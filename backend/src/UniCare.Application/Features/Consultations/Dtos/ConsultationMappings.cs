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
        };
}
