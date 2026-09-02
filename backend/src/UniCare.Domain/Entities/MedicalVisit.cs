using UniCare.Domain.Common;
using UniCare.Domain.Enums;

namespace UniCare.Domain.Entities;

/// <summary>
/// One attendance at the medical centre, created at check-in. This is the anchor
/// that ties vitals, consultation and queue position together.
/// </summary>
public class MedicalVisit : AuditableEntity
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    /// <summary>Null for walk-ins and emergencies, which have no prior appointment.</summary>
    public Guid? AppointmentId { get; set; }
    public Appointment? Appointment { get; set; }

    public DateTimeOffset CheckedInAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public VisitStatus Status { get; set; } = VisitStatus.CheckedIn;
    public bool IsEmergency { get; set; }

    public VitalSign? VitalSign { get; set; }
    public Consultation? Consultation { get; set; }
    public QueueEntry? QueueEntry { get; set; }
}
