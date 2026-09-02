using UniCare.Domain.Common;
using UniCare.Domain.Enums;

namespace UniCare.Domain.Entities;

public class Appointment : AuditableEntity
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    /// <summary>Null until an admin assigns a doctor.</summary>
    public Guid? AssignedStaffId { get; set; }
    public Staff? AssignedStaff { get; set; }

    public DateOnly ScheduledDate { get; set; }
    public TimeOnly ScheduledTime { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Requested;
    public string? Reason { get; set; }
    public string? RejectionReason { get; set; }

    /// <summary>Created when the student checks in. Null until then.</summary>
    public MedicalVisit? Visit { get; set; }
}
