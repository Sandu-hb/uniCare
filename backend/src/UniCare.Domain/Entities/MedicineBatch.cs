using UniCare.Domain.Common;

namespace UniCare.Domain.Entities;

/// <summary>
/// A delivery of one medicine, tracked separately because batches expire on
/// different dates and stock must be dispensed oldest-first.
/// </summary>
public class MedicineBatch : BaseEntity
{
    /// <summary>
    /// Foreign key — the real column. A batch cannot exist without its medicine,
    /// so the FK lives on this side.
    /// </summary>
    public Guid MedicineId { get; set; }

    /// <summary>
    /// Navigation property — not a column. `= null!` tells the compiler EF Core
    /// populates this when it loads the row.
    /// </summary>
    public Medicine Medicine { get; set; } = null!;

    public required string BatchNumber { get; set; }

    /// <summary>DateOnly maps to PostgreSQL `date` — an expiry has no meaningful time.</summary>
    public DateOnly ExpiryDate { get; set; }

    public int QuantityReceived { get; set; }

    /// <summary>Decremented as the batch is dispensed. Never below zero.</summary>
    public int QuantityRemaining { get; set; }

    public DateTimeOffset ReceivedAt { get; set; }

    public string? Supplier { get; set; }
}
