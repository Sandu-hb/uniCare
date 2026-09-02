using UniCare.Domain.Common;
using UniCare.Domain.Enums;

namespace UniCare.Domain.Entities;

/// <summary>
/// A medicine in the pharmacy catalogue. Reference data rather than patient data,
/// so it inherits BaseEntity — nobody needs an audit trail on "Paracetamol exists".
/// </summary>
public class Medicine : BaseEntity
{
    public required string Name { get; set; }

    /// <summary>Generic equivalent, where the catalogue entry is a brand name.</summary>
    public string? GenericName { get; set; }

    public MedicineForm Form { get; set; }

    /// <summary>
    /// A label, not a number: real doses look like "500mg", "5mg/5ml", "2%".
    /// Modelling that numerically would need value, unit and ratio, and nothing
    /// in the system does arithmetic on it.
    /// </summary>
    public string? Strength { get; set; }

    /// <summary>Dispensing unit — "tablet", "ml", "vial".</summary>
    public required string Unit { get; set; }

    /// <summary>Stock at or below this level triggers the pharmacy low-stock warning.</summary>
    public int ReorderLevel { get; set; }

    /// <summary>
    /// Discontinued medicines are deactivated, never deleted — they still appear in
    /// prescriptions issued before they were withdrawn.
    /// </summary>
    public bool IsActive { get; set; } = true;

    public ICollection<MedicineBatch> Batches { get; set; } = [];
}
