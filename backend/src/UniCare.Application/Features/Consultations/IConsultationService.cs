using UniCare.Application.Features.Consultations.Dtos;

namespace UniCare.Application.Features.Consultations;

public interface IConsultationService
{
    Task<ConsultationDto?> GetByVisitIdAsync(Guid visitId, CancellationToken cancellationToken = default);

    /// <summary>
    /// One consultation per visit (unique index on MedicalVisitId). Diagnoses are
    /// replaced wholesale on each save.
    /// </summary>
    /// <exception cref="Exceptions.NotFoundException">The visit, or the caller's staff record, does not exist.</exception>
    Task<ConsultationDto> UpsertAsync(
        Guid visitId, Guid doctorApplicationUserId, UpsertConsultationRequest request,
        CancellationToken cancellationToken = default);
}
