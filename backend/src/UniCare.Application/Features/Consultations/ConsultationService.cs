using Microsoft.EntityFrameworkCore;
using UniCare.Application.Abstractions;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.Consultations.Dtos;
using UniCare.Application.Features.Visits;
using UniCare.Domain.Entities;
using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Consultations;

/// <summary>
/// The doctor's record for one visit — diagnoses, an optional prescription and
/// an optional lab request, all saved together as one submission. Saving is
/// also the moment the visit routes onward: see VisitService.RouteNextStageAsync,
/// called at the end of UpsertAsync so the queue reflects whatever was ordered.
/// </summary>
public class ConsultationService(IApplicationDbContext db, IVisitService visitService) : IConsultationService
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
            .Include(c => c.Prescription).ThenInclude(p => p!.Items)
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
        // and prescription items are few and always saved together with the form
        // they came from.
        db.Diagnoses.RemoveRange(consultation.Diagnoses);
        consultation.Diagnoses = request.Diagnoses
            .Select(d => new Diagnosis
            {
                Description = d.Description.Trim(),
                IcdCode = string.IsNullOrWhiteSpace(d.IcdCode) ? null : d.IcdCode.Trim(),
                IsPrimary = d.IsPrimary,
            })
            .ToList();

        UpsertPrescription(consultation, staffId, request.PrescriptionItems);
        await UpsertLabOrderAsync(visitId, staffId, request.LabRequestDetails, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
        await visitService.RouteNextStageAsync(visitId, cancellationToken);

        return await GetByVisitIdAsync(visitId, cancellationToken)
            ?? throw new NotFoundException(nameof(Consultation), visitId);
    }

    private void UpsertPrescription(
        Consultation consultation, Guid staffId, IReadOnlyList<PrescriptionItemInput> items)
    {
        if (items.Count == 0)
        {
            if (consultation.Prescription is { } existing)
            {
                db.PrescriptionItems.RemoveRange(existing.Items);
                db.Prescriptions.Remove(existing);
                consultation.Prescription = null;
            }

            return;
        }

        var prescription = consultation.Prescription;
        if (prescription is null)
        {
            prescription = new Prescription { Consultation = consultation, IssuedAt = DateTimeOffset.UtcNow };
            db.Prescriptions.Add(prescription);
            consultation.Prescription = prescription;
        }

        prescription.PrescribedByStaffId = staffId;
        prescription.Status = PrescriptionStatus.Issued;

        db.PrescriptionItems.RemoveRange(prescription.Items);
        prescription.Items = items
            .Select(i => new PrescriptionItem
            {
                MedicineId = i.MedicineId,
                Dosage = i.Dosage.Trim(),
                Frequency = i.Frequency.Trim(),
                DurationDays = i.DurationDays,
                Quantity = i.Quantity,
                Instructions = string.IsNullOrWhiteSpace(i.Instructions) ? null : i.Instructions.Trim(),
            })
            .ToList();
    }

    private async Task UpsertLabOrderAsync(
        Guid visitId, Guid staffId, string? requestDetails, CancellationToken cancellationToken)
    {
        var existing = await db.LabOrders.FirstOrDefaultAsync(o => o.MedicalVisitId == visitId, cancellationToken);

        if (string.IsNullOrWhiteSpace(requestDetails))
        {
            if (existing is not null)
            {
                db.LabOrders.Remove(existing);
            }

            return;
        }

        if (existing is null)
        {
            db.LabOrders.Add(new LabOrder
            {
                MedicalVisitId = visitId,
                OrderedByStaffId = staffId,
                RequestDetails = requestDetails.Trim(),
                RequestedAt = DateTimeOffset.UtcNow,
            });
        }
        else if (existing.Status == LabOrderStatus.Requested)
        {
            // Only editable while still pending — once the lab has completed it,
            // the doctor amending the consultation shouldn't silently reopen it.
            existing.RequestDetails = requestDetails.Trim();
        }
    }

    private async Task<Guid> ResolveStaffIdAsync(Guid applicationUserId, CancellationToken cancellationToken) =>
        await db.Staff
            .Where(s => s.ApplicationUserId == applicationUserId)
            .Select(s => s.Id)
            .FirstOrDefaultAsync(cancellationToken) is var staffId && staffId != Guid.Empty
            ? staffId
            : throw new NotFoundException(nameof(Staff), applicationUserId);
}
