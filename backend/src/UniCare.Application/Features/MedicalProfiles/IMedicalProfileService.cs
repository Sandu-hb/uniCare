using UniCare.Application.Features.MedicalProfiles.Dtos;

namespace UniCare.Application.Features.MedicalProfiles;

public interface IMedicalProfileService
{
    Task<MedicalProfileDto?> GetByStudentIdAsync(
        Guid studentId, CancellationToken cancellationToken = default);

    Task<MedicalProfileDto> UpsertAsync(
        Guid studentId, UpsertMedicalProfileRequest request,
        CancellationToken cancellationToken = default);

    Task<MedicalProfileDto> SubmitAsync(
        Guid studentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// reviewerApplicationUserId is the ApplicationUser.Id from the caller's JWT —
    /// not a Staff.Id. The service resolves the actual Staff record internally.
    /// </summary>
    Task<MedicalProfileDto> VerifyAsync(
        Guid studentId, Guid reviewerApplicationUserId, CancellationToken cancellationToken = default);

    Task<MedicalProfileDto> RejectAsync(
        Guid studentId, Guid reviewerApplicationUserId, string reason,
        CancellationToken cancellationToken = default);
}
