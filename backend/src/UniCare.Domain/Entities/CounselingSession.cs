using UniCare.Domain.Common;
using UniCare.Domain.Enums;

namespace UniCare.Domain.Entities;

/// <summary>
/// A student's AI wellness chat — first-line support and campus resources,
/// never a substitute for a real counselor. CrisisFlagged is set the moment
/// any message in the session is judged to show crisis indicators; once true
/// it never reverts, and it is what makes the session visible to Admin at
/// all — an unflagged session is private to the student.
/// </summary>
public class CounselingSession : AuditableEntity
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset LastMessageAt { get; set; }
    public CounselingSessionStatus Status { get; set; } = CounselingSessionStatus.Active;

    public bool CrisisFlagged { get; set; }
    public DateTimeOffset? CrisisFlaggedAt { get; set; }

    public ICollection<CounselingMessage> Messages { get; set; } = [];
}
