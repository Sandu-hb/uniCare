using UniCare.Application.Features.Students.Dtos;

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

    /// <summary>Valid from PendingApproval or Suspended only.</summary>
    Task<StudentDto> ActivateAsync(Guid studentId, CancellationToken cancellationToken = default);

    /// <summary>Valid from Active or PendingApproval only. Also revokes the refresh token.</summary>
    Task<StudentDto> SuspendAsync(Guid studentId, CancellationToken cancellationToken = default);
}
