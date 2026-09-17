using System.Linq.Expressions;
using UniCare.Domain.Entities;

namespace UniCare.Application.Features.Pharmacy.Dtos;

public static class PharmacyPrescriptionMappings
{
    public static Expression<Func<Prescription, PharmacyPrescriptionDto>> Projection =>
        prescription => new PharmacyPrescriptionDto
        {
            Id = prescription.Id,
            MedicalVisitId = prescription.Consultation.MedicalVisitId,
            StudentId = prescription.Consultation.MedicalVisit.StudentId,
            StudentName = prescription.Consultation.MedicalVisit.Student.FullName,
            Status = prescription.Status,
            IssuedAt = prescription.IssuedAt,
            Notes = prescription.Notes,
            Items = prescription.Items
                .Select(i => new PharmacyPrescriptionItemDto
                {
                    MedicineName = i.Medicine.Name,
                    Dosage = i.Dosage,
                    Frequency = i.Frequency,
                    DurationDays = i.DurationDays,
                    Quantity = i.Quantity,
                    Instructions = i.Instructions,
                })
                .ToList(),
        };
}
