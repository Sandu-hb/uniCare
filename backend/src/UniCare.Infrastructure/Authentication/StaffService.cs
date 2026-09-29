using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniCare.Application.Abstractions;
using UniCare.Application.Contracts;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.Auth;
using UniCare.Application.Features.Staff;
using UniCare.Application.Features.Staff.Dtos;
using UniCare.Domain.Entities;
using UniCare.Domain.Enums;
using UniCare.Infrastructure.Data;

namespace UniCare.Infrastructure.Authentication;

/// <summary>
/// Staff has no navigation to ApplicationUser (Domain cannot reference Identity),
/// so this needs the concrete UniCareDbContext rather than IApplicationDbContext
/// to join the two tables directly — the same reason AuthService lives here
/// instead of Application.
/// </summary>
public class StaffService(
    UserManager<ApplicationUser> userManager,
    UniCareDbContext db,
    IAuthService authService,
    IEmailService emailService,
    ILogger<StaffService> logger) : IStaffService
{
    private static readonly AccountStatus[] ActivatableStates =
        [AccountStatus.PendingApproval, AccountStatus.Suspended];

    private static readonly AccountStatus[] SuspendableStates =
        [AccountStatus.Active, AccountStatus.PendingApproval];

    public async Task<StaffDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await BaseQuery().Where(s => s.Id == id).FirstOrDefaultAsync(cancellationToken);

    public async Task<StaffDto?> GetByApplicationUserIdAsync(
        Guid applicationUserId, CancellationToken cancellationToken = default)
    {
        var staff = await db.Staff.AsNoTracking()
            .FirstOrDefaultAsync(s => s.ApplicationUserId == applicationUserId, cancellationToken);

        return staff is null ? null : await GetByIdAsync(staff.Id, cancellationToken);
    }

    public async Task<PagedResult<StaffDto>> SearchAsync(
        AccountStatus? status, StaffRole? role, int page, int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = BaseQuery();

        if (status.HasValue)
        {
            query = query.Where(s => s.AccountStatus == status.Value);
        }

        if (role.HasValue)
        {
            query = query.Where(s => s.Role == role.Value);
        }

        query = query.OrderBy(s => s.StaffNumber);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedResult<StaffDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    public Task<StaffDto> RegisterAsync(
        RegisterStaffRequest request, CancellationToken cancellationToken = default) =>
        CreateAccountAsync(
            request.Email, request.Password, request.FullName, request.Role,
            request.Specialization, request.LicenseNumber, request.ContactNumber,
            AccountStatus.PendingApproval, isActive: false, cancellationToken);

    public Task<StaffDto> CreateAsync(
        CreateStaffRequest request, CancellationToken cancellationToken = default) =>
        CreateAccountAsync(
            request.Email, request.Password, request.FullName, request.Role,
            request.Specialization, request.LicenseNumber, request.ContactNumber,
            AccountStatus.Active, isActive: true, cancellationToken);

    public async Task<StaffDto> ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var staff = await LoadAsync(id, cancellationToken);
        var user = await FindUserAsync(staff, cancellationToken);

        if (!ActivatableStates.Contains(user.Status))
        {
            throw new ConflictException(
                $"Only a pending or suspended account can be activated; this one is {user.Status}.");
        }

        user.Status = AccountStatus.Active;
        staff.IsActive = true;

        await userManager.UpdateAsync(user);
        await db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException(nameof(Staff), id);
    }

    public async Task<StaffDto> SuspendAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var staff = await LoadAsync(id, cancellationToken);
        var user = await FindUserAsync(staff, cancellationToken);

        if (!SuspendableStates.Contains(user.Status))
        {
            throw new ConflictException(
                $"Only an active or pending account can be suspended; this one is {user.Status}.");
        }

        user.Status = AccountStatus.Suspended;
        staff.IsActive = false;

        await userManager.UpdateAsync(user);
        await db.SaveChangesAsync(cancellationToken);

        // Otherwise a suspended account could keep minting new access tokens
        // with its existing refresh token until that token's own expiry.
        await authService.RevokeAsync(user.Id, cancellationToken);

        return await GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException(nameof(Staff), id);
    }

    public async Task<StaffDto> ResendCredentialsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var staff = await LoadAsync(id, cancellationToken);
        var user = await FindUserAsync(staff, cancellationToken);

        var temporaryPassword = GenerateTemporaryPassword();

        // RemovePasswordAsync + AddPasswordAsync rather than ResetPasswordAsync: an
        // admin-triggered reset needs no reset token — the admin's own auth is the
        // authorization already, the same trust level CreateAsync sets a password with.
        var removeResult = await userManager.RemovePasswordAsync(user);
        if (!removeResult.Succeeded)
        {
            throw new ConflictException(string.Join(" ", removeResult.Errors.Select(e => e.Description)));
        }

        var addResult = await userManager.AddPasswordAsync(user, temporaryPassword);
        if (!addResult.Succeeded)
        {
            throw new ConflictException(string.Join(" ", addResult.Errors.Select(e => e.Description)));
        }

        // A reset credential is temporary too — force a change before anything
        // else, same as a brand-new admin-created account.
        user.MustChangePassword = true;
        await userManager.UpdateAsync(user);

        // The old credentials must stop working immediately — otherwise whoever has
        // them (possibly nobody, possibly the wrong person if the original email
        // leaked partway) keeps standing access after this "reset".
        await authService.RevokeAsync(user.Id, cancellationToken);

        var emailSent = await TrySendPasswordEmailAsync(
            staff.Email, staff.FullName, temporaryPassword, isNewAccount: false, cancellationToken);

        var current = await GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException(nameof(Staff), id);
        return current with { WelcomeEmailSent = emailSent };
    }

    private IQueryable<StaffDto> BaseQuery() =>
        from staff in db.Staff.AsNoTracking()
        join user in db.Users.AsNoTracking() on staff.ApplicationUserId equals (Guid?)user.Id
        select new StaffDto
        {
            Id = staff.Id,
            StaffNumber = staff.StaffNumber,
            FullName = staff.FullName,
            Email = staff.Email,
            Role = staff.Role,
            Specialization = staff.Specialization,
            LicenseNumber = staff.LicenseNumber,
            ContactNumber = staff.ContactNumber,
            IsActive = staff.IsActive,
            AccountStatus = user.Status,
        };

    private async Task<StaffDto> CreateAccountAsync(
        string email, string? password, string fullName, StaffRole role,
        string? specialization, string? licenseNumber, string? contactNumber,
        AccountStatus accountStatus, bool isActive, CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        // Only the admin-direct path (CreateAsync) ever omits a password; self-service
        // registration always supplies one, enforced by RegisterStaffRequestValidator.
        var generatedPassword = string.IsNullOrEmpty(password) ? GenerateTemporaryPassword() : null;

        var user = new ApplicationUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            EmailConfirmed = true,
            FullName = fullName.Trim(),
            Status = accountStatus,
            // A system-generated password is temporary by nature; a self-chosen
            // one (self-registration) needs no forced change.
            MustChangePassword = generatedPassword is not null,
        };

        var result = await userManager.CreateAsync(user, generatedPassword ?? password!);
        if (!result.Succeeded)
        {
            throw new ConflictException(string.Join(" ", result.Errors.Select(e => e.Description)));
        }

        await userManager.AddToRoleAsync(user, role.ToString());

        var staff = new Staff
        {
            ApplicationUserId = user.Id,
            StaffNumber = await NextStaffNumberAsync(cancellationToken),
            FullName = fullName.Trim(),
            Email = normalizedEmail,
            Role = role,
            Specialization = specialization?.Trim(),
            LicenseNumber = licenseNumber?.Trim(),
            ContactNumber = contactNumber?.Trim(),
            IsActive = isActive,
        };

        db.Staff.Add(staff);
        await db.SaveChangesAsync(cancellationToken);

        var created = await GetByIdAsync(staff.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Staff), staff.Id);

        if (generatedPassword is null)
        {
            return created;
        }

        // The account already exists at this point regardless of whether the email
        // succeeds — a flaky mail provider must not undo a valid account creation.
        // The admin sees WelcomeEmailSent=false and can re-trigger delivery some
        // other way; the account itself is not left half-created.
        var emailSent = await TrySendPasswordEmailAsync(
            normalizedEmail, fullName.Trim(), generatedPassword, isNewAccount: true, cancellationToken);

        return created with { WelcomeEmailSent = emailSent };
    }

    private async Task<bool> TrySendPasswordEmailAsync(
        string toEmail, string fullName, string temporaryPassword, bool isNewAccount,
        CancellationToken cancellationToken)
    {
        var subject = "Your UniCare staff account";
        var intro = isNewAccount
            ? "An account has been created for you on UniCare Medical Centre's staff portal."
            : "Your password for UniCare Medical Centre's staff portal has been reset.";
        var body = $"""
            <p>Hello {fullName},</p>
            <p>{intro}</p>
            <p><strong>Email:</strong> {toEmail}<br/>
            <strong>Temporary password:</strong> {temporaryPassword}</p>
            <p>Please sign in and change this password as soon as possible.</p>
            """;

        try
        {
            await emailService.SendAsync(toEmail, subject, body, cancellationToken);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send password email to staff account {Email}.", toEmail);
            return false;
        }
    }

    private const string TemporaryPasswordUppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";   // no I/O — easy to misread
    private const string TemporaryPasswordLowercase = "abcdefghijkmnopqrstuvwxyz";   // no l
    private const string TemporaryPasswordDigits = "23456789";                      // no 0/1
    private const int TemporaryPasswordLength = 12;

    /// <summary>
    /// Meets the Identity password policy (digit, upper, lower, 8+ chars — see
    /// DependencyInjection.AddIdentityCore) while avoiding characters that are
    /// easy to mistype when an admin reads it aloud or copies it by hand.
    /// </summary>
    private static string GenerateTemporaryPassword()
    {
        const string all = TemporaryPasswordUppercase + TemporaryPasswordLowercase + TemporaryPasswordDigits;

        Span<char> password = stackalloc char[TemporaryPasswordLength];
        password[0] = TemporaryPasswordUppercase[RandomNumberGenerator.GetInt32(TemporaryPasswordUppercase.Length)];
        password[1] = TemporaryPasswordLowercase[RandomNumberGenerator.GetInt32(TemporaryPasswordLowercase.Length)];
        password[2] = TemporaryPasswordDigits[RandomNumberGenerator.GetInt32(TemporaryPasswordDigits.Length)];
        for (var i = 3; i < password.Length; i++)
        {
            password[i] = all[RandomNumberGenerator.GetInt32(all.Length)];
        }

        // Shuffle so the three guaranteed character classes aren't always up front.
        for (var i = password.Length - 1; i > 0; i--)
        {
            var j = RandomNumberGenerator.GetInt32(i + 1);
            (password[i], password[j]) = (password[j], password[i]);
        }

        return new string(password);
    }

    private async Task<string> NextStaffNumberAsync(CancellationToken cancellationToken)
    {
        var count = await db.Staff.CountAsync(cancellationToken);
        return $"STF-{count + 1:D4}";
    }

    private async Task<Staff> LoadAsync(Guid id, CancellationToken cancellationToken) =>
        await db.Staff.FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Staff), id);

    private async Task<ApplicationUser> FindUserAsync(Staff staff, CancellationToken cancellationToken)
    {
        if (staff.ApplicationUserId is not { } userId)
        {
            throw new ConflictException("This staff record has no linked sign-in account.");
        }

        return await db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException(nameof(ApplicationUser), userId);
    }
}
