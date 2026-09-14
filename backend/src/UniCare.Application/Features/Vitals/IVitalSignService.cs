using UniCare.Application.Features.Vitals.Dtos;

namespace UniCare.Application.Features.Vitals;

public interface IVitalSignService
{
    Task<VitalSignDto?> GetByVisitIdAsync(Guid visitId, CancellationToken cancellationToken = default);

    /// <summary>
    /// One vitals record per visit (unique index on MedicalVisitId), so this
    /// creates on first call and corrects the same row thereafter.
    /// </summary>
    /// <exception cref="Exceptions.NotFoundException">The visit, or the caller's staff record, does not exist.</exception>
    Task<VitalSignDto> UpsertAsync(
        Guid visitId, Guid recorderApplicationUserId, UpsertVitalSignRequest request,
        CancellationToken cancellationToken = default);
}
