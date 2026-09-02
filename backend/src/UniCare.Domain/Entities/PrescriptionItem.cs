using UniCare.Domain.Common;

namespace UniCare.Domain.Entities;

/// <summary>
/// Joins Prescription to Medicine — but it is a real entity, not a plain join table,
/// because the relationship carries its own data: dosage, frequency, quantity.
/// </summary>
public class PrescriptionItem : AuditableEntity
{
    public Guid PrescriptionId { get; set; }
    public Prescription Prescription { get; set; } = null!;

    public Guid MedicineId { get; set; }
    public Medicine Medicine { get; set; } = null!;

    public required string Dosage { get; set; }
    public required string Frequency { get; set; }
    public int DurationDays { get; set; }
    public int Quantity { get; set; }

    /// <summary>Tracks partial dispensing when stock runs short.</summary>
    public int QuantityDispensed { get; set; }

    public string? Instructions { get; set; }
}
