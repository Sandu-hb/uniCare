using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UniCare.Application.Contracts;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.Auth;
using UniCare.Application.Features.Auth.Dtos;
using UniCare.Application.Features.Students;
using UniCare.Application.Features.Students.Dtos;
using UniCare.Domain.Constants;
using UniCare.Domain.Entities;
using UniCare.Domain.Enums;
using UniCare.Infrastructure.Data;

namespace UniCare.Infrastructure.Authentication;

/// <summary>
/// Student self-registration and account activation/suspension. Lives here
/// rather than alongside IStudentService because it needs UserManager —
/// the same reason StaffService lives in Infrastructure, not Application.
/// </summary>
public class StudentAccountService(
    UserManager<ApplicationUser> userManager,
    UniCareDbContext db,
    IAuthService authService,
    TokenIssuer tokenIssuer) : IStudentAccountService
{
    private static readonly AccountStatus[] ActivatableStates =
        [AccountStatus.PendingApproval, AccountStatus.Suspended];

    private static readonly AccountStatus[] SuspendableStates =
        [AccountStatus.Active, AccountStatus.PendingApproval];

    public async Task<AuthResponse> RegisterAsync(
        RegisterStudentRequest request, CancellationToken cancellationToken = default)
    {
        var registrationNumber = request.RegistrationNumber.Trim();

        var exists = await db.Students.AnyAsync(
            s => s.RegistrationNumber == registrationNumber, cancellationToken);

        if (exists)
        {
            throw new ConflictException(
                $"A student with registration number '{registrationNumber}' already exists.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = new ApplicationUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            EmailConfirmed = true,
            FullName = request.FullName.Trim(),
            Status = AccountStatus.PendingApproval,
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            throw new ConflictException(string.Join(" ", result.Errors.Select(e => e.Description)));
        }

        await userManager.AddToRoleAsync(user, AppRoles.Student);

        var student = new Student
        {
            ApplicationUserId = user.Id,
            RegistrationNumber = registrationNumber,
            FullName = request.FullName.Trim(),
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            Faculty = request.Faculty.Trim(),
            Department = request.Department.Trim(),
            AcademicYear = request.AcademicYear,
            ContactNumber = request.ContactNumber?.Trim(),
            Email = normalizedEmail,
            Address = request.Address?.Trim(),
            EmergencyContactName = request.EmergencyContactName?.Trim(),
            EmergencyContactNumber = request.EmergencyContactNumber?.Trim(),
        };

        db.Students.Add(student);
        await db.SaveChangesAsync(cancellationToken);

        // Auto-login: nothing about signing in is gated on PendingApproval — the
        // actual gate is the medical profile's own Verified check, enforced
        // independently wherever it matters (booking an appointment).
        return await tokenIssuer.IssueAsync(user, cancellationToken);
    }

    public async Task<PagedResult<StudentAccountDto>> SearchAsync(
        AccountStatus? status, string? search, int page, int pageSize,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = BaseQuery();

        if (status.HasValue)
        {
            query = query.Where(s => s.AccountStatus == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(s =>
                s.FullName.ToLower().Contains(term) ||
                s.RegistrationNumber.ToLower().Contains(term));
        }

        query = query.OrderBy(s => s.FullName);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<StudentAccountDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    /// <summary>
    /// Idempotent: activating an already-Active account is a no-op, not an error.
    /// This is what lets MedicalProfilesController.Verify call this unconditionally
    /// right after verifying a profile, without caring whether the student was
    /// already active from an earlier registration.
    /// </summary>
    public async Task<StudentAccountDto> ActivateAsync(Guid studentId, CancellationToken cancellationToken = default)
    {
        var student = await LoadAsync(studentId, cancellationToken);
        var user = await FindUserAsync(student, cancellationToken);

        if (user.Status == AccountStatus.Active)
        {
            return ToAccountDto(student, user.Status);
        }

        if (!ActivatableStates.Contains(user.Status))
        {
            throw new ConflictException(
                $"Only a pending or suspended account can be activated; this one is {user.Status}.");
        }

        user.Status = AccountStatus.Active;
        await userManager.UpdateAsync(user);

        return ToAccountDto(student, user.Status);
    }

    public async Task<StudentAccountDto> SuspendAsync(Guid studentId, CancellationToken cancellationToken = default)
    {
        var student = await LoadAsync(studentId, cancellationToken);
        var user = await FindUserAsync(student, cancellationToken);

        if (!SuspendableStates.Contains(user.Status))
        {
            throw new ConflictException(
                $"Only an active or pending account can be suspended; this one is {user.Status}.");
        }

        user.Status = AccountStatus.Suspended;
        await userManager.UpdateAsync(user);

        // Otherwise a suspended account could keep minting new access tokens
        // with its existing refresh token until that token's own expiry.
        await authService.RevokeAsync(user.Id, cancellationToken);

        return ToAccountDto(student, user.Status);
    }

    private IQueryable<StudentAccountDto> BaseQuery() =>
        from student in db.Students.AsNoTracking()
        join user in db.Users.AsNoTracking() on student.ApplicationUserId equals (Guid?)user.Id
        select new StudentAccountDto
        {
            Id = student.Id,
            RegistrationNumber = student.RegistrationNumber,
            FullName = student.FullName,
            DateOfBirth = student.DateOfBirth,
            Gender = student.Gender,
            Faculty = student.Faculty,
            Department = student.Department,
            AcademicYear = student.AcademicYear,
            ContactNumber = student.ContactNumber,
            Email = student.Email,
            Address = student.Address,
            EmergencyContactName = student.EmergencyContactName,
            EmergencyContactNumber = student.EmergencyContactNumber,
            AccountStatus = user.Status,
        };

    private static StudentAccountDto ToAccountDto(Student student, AccountStatus status) => new()
    {
        Id = student.Id,
        RegistrationNumber = student.RegistrationNumber,
        FullName = student.FullName,
        DateOfBirth = student.DateOfBirth,
        Gender = student.Gender,
        Faculty = student.Faculty,
        Department = student.Department,
        AcademicYear = student.AcademicYear,
        ContactNumber = student.ContactNumber,
        Email = student.Email,
        Address = student.Address,
        EmergencyContactName = student.EmergencyContactName,
        EmergencyContactNumber = student.EmergencyContactNumber,
        AccountStatus = status,
    };

    private async Task<Student> LoadAsync(Guid studentId, CancellationToken cancellationToken) =>
        await db.Students.FirstOrDefaultAsync(s => s.Id == studentId, cancellationToken)
            ?? throw new NotFoundException(nameof(Student), studentId);

    private async Task<ApplicationUser> FindUserAsync(Student student, CancellationToken cancellationToken)
    {
        if (student.ApplicationUserId is not { } userId)
        {
            throw new ConflictException("This student record has no linked sign-in account.");
        }

        return await db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException(nameof(ApplicationUser), userId);
    }
}
