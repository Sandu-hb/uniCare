using UniCare.Domain.Common;

namespace UniCare.Domain.Entities;

/// <summary>Nurse assessment, recorded before the student sees a doctor.</summary>
public class VitalSign : AuditableEntity
{
    public Guid MedicalVisitId { get; set; }
    public MedicalVisit MedicalVisit { get; set; } = null!;

    public Guid RecordedByStaffId { get; set; }
    public Staff RecordedByStaff { get; set; } = null!;

    public decimal? TemperatureCelsius { get; set; }

    /// <summary>Blood pressure is two numbers — 120/80 — so it needs two columns.</summary>
    public int? SystolicBp { get; set; }
    public int? DiastolicBp { get; set; }

    public int? PulseBpm { get; set; }
    public decimal? HeightCm { get; set; }
    public decimal? WeightKg { get; set; }
    public string? Observations { get; set; }
    public DateTimeOffset RecordedAt { get; set; }
}
