using Microsoft.EntityFrameworkCore;
using UniCare.Application.Abstractions;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.Vitals.Dtos;
using UniCare.Domain.Entities;

namespace UniCare.Application.Features.Vitals;

/// <summary>
/// The nurse's assessment for one visit. Deliberately not tied to a queue stage:
/// a nurse may correct a reading after the fact. What is enforced is the other
/// direction — VisitService will not advance a visit that has no vitals yet.
/// </summary>
public class VitalSignService(IApplicationDbContext db) : IVitalSignService
{
    public async Task<VitalSignDto?> GetByVisitIdAsync(
        Guid visitId, CancellationToken cancellationToken = default) =>
        await db.VitalSigns
            .AsNoTracking()
            .Where(v => v.MedicalVisitId == visitId)
            .Select(VitalSignMappings.Projection)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<VitalSignDto> UpsertAsync(
        Guid visitId, Guid recorderApplicationUserId, UpsertVitalSignRequest request,
        CancellationToken cancellationToken = default)
    {
        var visitExists = await db.MedicalVisits.AnyAsync(v => v.Id == visitId, cancellationToken);
        if (!visitExists)
        {
            throw new NotFoundException(nameof(MedicalVisit), visitId);
        }

        var staffId = await ResolveStaffIdAsync(recorderApplicationUserId, cancellationToken);

        var vital = await db.VitalSigns
            .FirstOrDefaultAsync(v => v.MedicalVisitId == visitId, cancellationToken);

        if (vital is null)
        {
            vital = new VitalSign { MedicalVisitId = visitId };
            db.VitalSigns.Add(vital);
        }

        vital.RecordedByStaffId = staffId;
        vital.RecordedAt = DateTimeOffset.UtcNow;
        vital.TemperatureCelsius = request.TemperatureCelsius;
        vital.SystolicBp = request.SystolicBp;
        vital.DiastolicBp = request.DiastolicBp;
        vital.PulseBpm = request.PulseBpm;
        vital.HeightCm = request.HeightCm;
        vital.WeightKg = request.WeightKg;
        vital.Observations = request.Observations?.Trim();

        await db.SaveChangesAsync(cancellationToken);

        return await GetByVisitIdAsync(visitId, cancellationToken)
            ?? throw new NotFoundException(nameof(VitalSign), visitId);
    }

    /// <summary>
    /// The JWT carries the ApplicationUser id; clinical records need Staff.Id,
    /// which is a separate row linked by Staff.ApplicationUserId.
    /// </summary>
    private async Task<Guid> ResolveStaffIdAsync(Guid applicationUserId, CancellationToken cancellationToken) =>
        await db.Staff
            .Where(s => s.ApplicationUserId == applicationUserId)
            .Select(s => s.Id)
            .FirstOrDefaultAsync(cancellationToken) is var staffId && staffId != Guid.Empty
            ? staffId
            : throw new NotFoundException(nameof(Staff), applicationUserId);
}
