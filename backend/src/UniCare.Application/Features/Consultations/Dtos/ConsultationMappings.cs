using System.Linq.Expressions;
using UniCare.Domain.Entities;

namespace UniCare.Application.Features.Consultations.Dtos;

public static class ConsultationMappings
{
    public static Expression<Func<Consultation, ConsultationDto>> Projection =>
        consultation => new ConsultationDto
        {
            Id = consultation.Id,
            MedicalVisitId = consultation.MedicalVisitId,
            DoctorStaffId = consultation.DoctorStaffId,
            DoctorStaffName = consultation.DoctorStaff.FullName,
            Symptoms = consultation.Symptoms,
            ExaminationFindings = consultation.ExaminationFindings,
            Treatment = consultation.Treatment,
            FollowUpInstructions = consultation.FollowUpInstructions,
            ConsultedAt = consultation.ConsultedAt,
            Diagnoses = consultation.Diagnoses
                .Select(d => new DiagnosisDto
                {
                    Id = d.Id,
                    Description = d.Description,
                    IcdCode = d.IcdCode,
                    IsPrimary = d.IsPrimary,
                })
                .ToList(),
            PrescriptionItems = consultation.Prescription == null
                ? new List<PrescriptionItemDto>()
                : consultation.Prescription.Items
                    .Select(i => new PrescriptionItemDto
                    {
                        MedicineId = i.MedicineId,
                        MedicineName = i.Medicine.Name,
                        Dosage = i.Dosage,
                        Frequency = i.Frequency,
                        DurationDays = i.DurationDays,
                        Quantity = i.Quantity,
                        Instructions = i.Instructions,
                    })
                    .ToList(),
            LabRequestDetails = consultation.MedicalVisit.LabOrder != null
                ? consultation.MedicalVisit.LabOrder.RequestDetails
                : null,
        };
}
