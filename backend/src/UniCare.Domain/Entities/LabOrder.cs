using UniCare.Domain.Common;
using UniCare.Domain.Enums;

namespace UniCare.Domain.Entities;

/// <summary>
/// A doctor's request to send a student to the lab, and the lab's eventual
/// response — free text on both sides, not a structured test catalogue.
/// </summary>
public class LabOrder : AuditableEntity
{
    public Guid MedicalVisitId { get; set; }
    public MedicalVisit MedicalVisit { get; set; } = null!;

    public Guid OrderedByStaffId { get; set; }
    public Staff OrderedByStaff { get; set; } = null!;

    /// <summary>e.g. "CBC, blood glucose" — what the doctor wants tested.</summary>
    public required string RequestDetails { get; set; }

    public LabOrderStatus Status { get; set; } = LabOrderStatus.Requested;
    public string? ResultNotes { get; set; }

    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
}
