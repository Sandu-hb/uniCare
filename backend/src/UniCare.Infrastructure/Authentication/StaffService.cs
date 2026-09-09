using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
    IAuthService authService) : IStaffService
{
    private static readonly AccountStatus[] ActivatableStates =
        [AccountStatus.PendingApproval, AccountStatus.Suspended];

    private static readonly AccountStatus[] SuspendableStates =
        [AccountStatus.Active, AccountStatus.PendingApproval];

    public async Task<StaffDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await BaseQuery().Where(s => s.Id == id).FirstOrDefaultAsync(cancellationToken);

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
        string email, string password, string fullName, StaffRole role,
        string? specialization, string? licenseNumber, string? contactNumber,
        AccountStatus accountStatus, bool isActive, CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var user = new ApplicationUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            EmailConfirmed = true,
            FullName = fullName.Trim(),
            Status = accountStatus,
        };

        var result = await userManager.CreateAsync(user, password);
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

        return await GetByIdAsync(staff.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Staff), staff.Id);
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
