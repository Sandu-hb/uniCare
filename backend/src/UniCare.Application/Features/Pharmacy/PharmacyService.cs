using Microsoft.EntityFrameworkCore;
using UniCare.Application.Abstractions;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.Pharmacy.Dtos;
using UniCare.Application.Features.Visits;
using UniCare.Domain.Entities;
using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Pharmacy;

/// <summary>
/// The pharmacy's side of the queue: dispensing is a whole-prescription action
/// (no partial-batch/stock tracking — see Medicine/MedicineBatch, unused here
/// by design), which then routes the visit onward via VisitService.
/// </summary>
public class PharmacyService(IApplicationDbContext db, IVisitService visitService) : IPharmacyService
{
    private static readonly PrescriptionStatus[] PendingStatuses =
        [PrescriptionStatus.Issued, PrescriptionStatus.PartiallyDispensed];

    public async Task<IReadOnlyList<PharmacyPrescriptionDto>> GetQueueAsync(
        CancellationToken cancellationToken = default) =>
        await db.Prescriptions
            .AsNoTracking()
            .Where(p => PendingStatuses.Contains(p.Status))
            .OrderBy(p => p.IssuedAt)
            .Select(PharmacyPrescriptionMappings.Projection)
            .ToListAsync(cancellationToken);

    public async Task<PharmacyPrescriptionDto?> GetByVisitIdAsync(
        Guid visitId, CancellationToken cancellationToken = default) =>
        await db.Prescriptions
            .AsNoTracking()
            .Where(p => p.Consultation.MedicalVisitId == visitId)
            .Select(PharmacyPrescriptionMappings.Projection)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<PharmacyPrescriptionDto> DispenseAsync(
        Guid visitId, CancellationToken cancellationToken = default)
    {
        var prescription = await db.Prescriptions
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Consultation.MedicalVisitId == visitId, cancellationToken)
            ?? throw new NotFoundException(nameof(Prescription), visitId);

        if (!PendingStatuses.Contains(prescription.Status))
        {
            throw new ConflictException($"This prescription is already {prescription.Status}.");
        }

        foreach (var item in prescription.Items)
        {
            item.QuantityDispensed = item.Quantity;
        }

        prescription.Status = PrescriptionStatus.Dispensed;

        await db.SaveChangesAsync(cancellationToken);
        await visitService.RouteNextStageAsync(visitId, cancellationToken);

        return await GetByVisitIdAsync(visitId, cancellationToken)
            ?? throw new NotFoundException(nameof(Prescription), visitId);
    }
}
