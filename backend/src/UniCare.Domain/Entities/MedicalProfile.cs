using UniCare.Domain.Common;
using UniCare.Domain.Enums;

namespace UniCare.Domain.Entities;

/// <summary>
/// One-to-one with Student. What makes it one-to-one rather than one-to-many is a
/// UNIQUE index on StudentId, added later in the entity configuration.
/// </summary>
public class MedicalProfile : AuditableEntity
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public BloodGroup BloodGroup { get; set; }
    public decimal? HeightCm { get; set; }
    public decimal? WeightKg { get; set; }

    public string? ChronicConditions { get; set; }
    public string? Allergies { get; set; }
    public string? CurrentMedications { get; set; }
    public string? EyeExamination { get; set; }
    public string? DentalExamination { get; set; }

    public VerificationStatus Status { get; set; } = VerificationStatus.Draft;
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? VerifiedAt { get; set; }
    public Guid? VerifiedByStaffId { get; set; }
    public string? RejectionReason { get; set; }
}
