using Microsoft.EntityFrameworkCore;
using UniCare.Application.Abstractions;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.Consultations.Dtos;
using UniCare.Domain.Entities;

namespace UniCare.Application.Features.Consultations;

/// <summary>
/// The doctor's record for one visit, plus its diagnoses. As with vitals, this
/// is not gated on queue stage — VisitService enforces the other direction by
/// refusing to complete a visit that has no consultation.
/// </summary>
public class ConsultationService(IApplicationDbContext db) : IConsultationService
{
    public async Task<ConsultationDto?> GetByVisitIdAsync(
        Guid visitId, CancellationToken cancellationToken = default) =>
        await db.Consultations
            .AsNoTracking()
            .Where(c => c.MedicalVisitId == visitId)
            .Select(ConsultationMappings.Projection)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<ConsultationDto> UpsertAsync(
        Guid visitId, Guid doctorApplicationUserId, UpsertConsultationRequest request,
        CancellationToken cancellationToken = default)
    {
        var visitExists = await db.MedicalVisits.AnyAsync(v => v.Id == visitId, cancellationToken);
        if (!visitExists)
        {
            throw new NotFoundException(nameof(MedicalVisit), visitId);
        }

        var staffId = await ResolveStaffIdAsync(doctorApplicationUserId, cancellationToken);

        var consultation = await db.Consultations
            .Include(c => c.Diagnoses)
            .FirstOrDefaultAsync(c => c.MedicalVisitId == visitId, cancellationToken);

        if (consultation is null)
        {
            consultation = new Consultation { MedicalVisitId = visitId };
            db.Consultations.Add(consultation);
        }

        consultation.DoctorStaffId = staffId;
        consultation.ConsultedAt = DateTimeOffset.UtcNow;
        consultation.Symptoms = request.Symptoms?.Trim();
        consultation.ExaminationFindings = request.ExaminationFindings?.Trim();
        consultation.Treatment = request.Treatment?.Trim();
        consultation.FollowUpInstructions = request.FollowUpInstructions?.Trim();

        // Replace-all: drop what was there and write the submitted set. Diagnoses
        // are few and always saved together with the form they came from.
        db.Diagnoses.RemoveRange(consultation.Diagnoses);
        consultation.Diagnoses = request.Diagnoses
            .Select(d => new Diagnosis
            {
                Description = d.Description.Trim(),
                IcdCode = string.IsNullOrWhiteSpace(d.IcdCode) ? null : d.IcdCode.Trim(),
                IsPrimary = d.IsPrimary,
            })
            .ToList();

        await db.SaveChangesAsync(cancellationToken);

        return await GetByVisitIdAsync(visitId, cancellationToken)
            ?? throw new NotFoundException(nameof(Consultation), visitId);
    }

    private async Task<Guid> ResolveStaffIdAsync(Guid applicationUserId, CancellationToken cancellationToken) =>
        await db.Staff
            .Where(s => s.ApplicationUserId == applicationUserId)
            .Select(s => s.Id)
            .FirstOrDefaultAsync(cancellationToken) is var staffId && staffId != Guid.Empty
            ? staffId
            : throw new NotFoundException(nameof(Staff), applicationUserId);
}
