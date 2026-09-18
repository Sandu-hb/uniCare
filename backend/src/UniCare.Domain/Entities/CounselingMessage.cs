using UniCare.Domain.Common;
using UniCare.Domain.Enums;

namespace UniCare.Domain.Entities;

public class CounselingMessage : AuditableEntity
{
    public Guid CounselingSessionId { get; set; }
    public CounselingSession CounselingSession { get; set; } = null!;

    public CounselingMessageRole Role { get; set; }
    public required string Content { get; set; }
    public DateTimeOffset SentAt { get; set; }
}
