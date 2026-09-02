using UniCare.Domain.Common;
using UniCare.Domain.Enums;

namespace UniCare.Domain.Entities;

public class Prescription : AuditableEntity
{
    public Guid ConsultationId { get; set; }
    public Consultation Consultation { get; set; } = null!;

    public Guid PrescribedByStaffId { get; set; }
    public Staff PrescribedByStaff { get; set; } = null!;

    public PrescriptionStatus Status { get; set; } = PrescriptionStatus.Issued;
    public DateTimeOffset IssuedAt { get; set; }
    public string? Notes { get; set; }

    public ICollection<PrescriptionItem> Items { get; set; } = [];
}
