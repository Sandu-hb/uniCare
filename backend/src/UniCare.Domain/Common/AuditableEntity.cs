namespace UniCare.Domain.Common;

/// <summary>
/// Base for entities that need a full audit trail — who created or changed a row
/// and when. Inherit this only where it is needed; a catalogue row like Medicine
/// can stay on <see cref="BaseEntity"/> rather than carrying six unused columns.
/// </summary>
public abstract class AuditableEntity : BaseEntity
{
    /// <summary>
    /// DateTimeOffset maps to PostgreSQL timestamptz and stores an absolute
    /// instant. A plain DateTime carries no timezone, so two servers can disagree
    /// about what it means — unacceptable in an audit trail.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>Null for seeded and system-generated rows, which have no user.</summary>
    public Guid? CreatedBy { get; set; }

    /// <summary>Null until the row is first edited.</summary>
    public DateTimeOffset? UpdatedAt { get; set; }

    public Guid? UpdatedBy { get; set; }

    /// <summary>
    /// Soft delete. Medical records are never physically removed — a global query
    /// filter hides these from normal queries while the row survives for auditing.
    /// </summary>
    public bool IsDeleted { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }
}
