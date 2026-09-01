namespace UniCare.Domain.Common;

/// <summary>
/// Base for every persisted entity. Abstract because there is no "base entity"
/// table — it only exists to give every entity a consistent identity.
/// </summary>
public abstract class BaseEntity
{
    /// <summary>
    /// Guid rather than int: these appear in URLs like /api/students/{id}, and
    /// sequential integers would let any signed-in user enumerate the table.
    /// </summary>
    public Guid Id { get; set; }
}
