using UniCare.Domain.Common;
using UniCare.Domain.Enums;

namespace UniCare.Domain.Entities;

public class QueueEntry : AuditableEntity
{
    public Guid MedicalVisitId { get; set; }
    public MedicalVisit MedicalVisit { get; set; } = null!;

    /// <summary>Display number the student sees on the queue screen.</summary>
    public int QueueNumber { get; set; }

    public QueueStage Stage { get; set; }
    public DateTimeOffset EnteredAt { get; set; }
    public DateTimeOffset? CalledAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
}
