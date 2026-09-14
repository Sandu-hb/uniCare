using UniCare.Application.Contracts;
using UniCare.Application.Features.Students.Dtos;
using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Students;

/// <summary>
/// The parts of student account management that need Identity — separate from
/// IStudentService, which is pure data access and knows nothing about sign-in.
/// Mirrors why IStaffService lives apart from IStudentService in the first place.
/// </summary>
public interface IStudentAccountService
{
    /// <summary>Self-service. Starts PendingApproval; an admin must Activate it.</summary>
    /// <exception cref="Exceptions.ConflictException">
    /// The email or registration number is already taken.
    /// </exception>
    Task<StudentDto> RegisterAsync(RegisterStudentRequest request, CancellationToken cancellationToken = default);

    /// <summary>Admin-only: the approval queue, optionally filtered by status and name/registration number.</summary>
    Task<PagedResult<StudentAccountDto>> SearchAsync(
        AccountStatus? status, string? search, int page, int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>Valid from PendingApproval or Suspended only.</summary>
    Task<StudentAccountDto> ActivateAsync(Guid studentId, CancellationToken cancellationToken = default);

    /// <summary>Valid from Active or PendingApproval only. Also revokes the refresh token.</summary>
    Task<StudentAccountDto> SuspendAsync(Guid studentId, CancellationToken cancellationToken = default);
}
