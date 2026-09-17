using UniCare.Application.Features.Pharmacy.Dtos;

namespace UniCare.Application.Features.Pharmacy;

public interface IPharmacyService
{
    /// <summary>The live board: prescriptions not yet fully dispensed, oldest first.</summary>
    Task<IReadOnlyList<PharmacyPrescriptionDto>> GetQueueAsync(CancellationToken cancellationToken = default);

    Task<PharmacyPrescriptionDto?> GetByVisitIdAsync(Guid visitId, CancellationToken cancellationToken = default);

    /// <exception cref="Exceptions.NotFoundException">No prescription exists for this visit.</exception>
    /// <exception cref="Exceptions.ConflictException">The prescription is already Dispensed or Cancelled.</exception>
    Task<PharmacyPrescriptionDto> DispenseAsync(Guid visitId, CancellationToken cancellationToken = default);
}
