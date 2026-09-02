using UniCare.Domain.Common;

namespace UniCare.Domain.Entities;

/// <summary>
/// A consultation can produce several diagnoses, so this is its own entity rather
/// than a text field — one of them is flagged primary.
/// </summary>
public class Diagnosis : AuditableEntity
{
    public Guid ConsultationId { get; set; }
    public Consultation Consultation { get; set; } = null!;

    public required string Description { get; set; }

    /// <summary>Optional ICD-10 code, where the doctor records one.</summary>
    public string? IcdCode { get; set; }

    public bool IsPrimary { get; set; }
}
