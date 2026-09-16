using UniCare.Application.Contracts;
using UniCare.Application.Features.Auth.Dtos;
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
    /// <summary>
    /// Self-service, and logs the new account straight in — the account itself
    /// starts PendingApproval, but nothing about signing in is gated on that;
    /// what actually unlocks (booking an appointment) is gated on the medical
    /// profile being Verified, which is checked independently at that point.
    /// </summary>
    /// <exception cref="Exceptions.ConflictException">
    /// The email or registration number is already taken.
    /// </exception>
    Task<AuthResponse> RegisterAsync(RegisterStudentRequest request, CancellationToken cancellationToken = default);

    /// <summary>Admin-only: the approval queue, optionally filtered by status and name/registration number.</summary>
    Task<PagedResult<StudentAccountDto>> SearchAsync(
        AccountStatus? status, string? search, int page, int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>Valid from PendingApproval or Suspended only.</summary>
    Task<StudentAccountDto> ActivateAsync(Guid studentId, CancellationToken cancellationToken = default);

    /// <summary>Valid from Active or PendingApproval only. Also revokes the refresh token.</summary>
    Task<StudentAccountDto> SuspendAsync(Guid studentId, CancellationToken cancellationToken = default);
}
