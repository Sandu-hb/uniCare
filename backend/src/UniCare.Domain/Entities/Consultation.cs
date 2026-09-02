using UniCare.Domain.Common;

namespace UniCare.Domain.Entities;

public class Consultation : AuditableEntity
{
    public Guid MedicalVisitId { get; set; }
    public MedicalVisit MedicalVisit { get; set; } = null!;

    public Guid DoctorStaffId { get; set; }
    public Staff DoctorStaff { get; set; } = null!;

    public string? Symptoms { get; set; }
    public string? ExaminationFindings { get; set; }
    public string? Treatment { get; set; }
    public string? FollowUpInstructions { get; set; }
    public DateTimeOffset ConsultedAt { get; set; }

    public ICollection<Diagnosis> Diagnoses { get; set; } = [];
    public Prescription? Prescription { get; set; }
}
