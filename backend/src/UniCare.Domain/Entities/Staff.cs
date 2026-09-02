using UniCare.Domain.Common;
using UniCare.Domain.Enums;

namespace UniCare.Domain.Entities;

/// <summary>
/// A member of medical centre staff — doctor, nurse, dentist, lab, pharmacy or admin.
/// Auditable because staff records determine who may access patient data.
/// </summary>
public class Staff : AuditableEntity
{
    public required string StaffNumber { get; set; }

    public required string FullName { get; set; }

    public StaffRole Role { get; set; }

    /// <summary>Free text — "General Medicine", "Orthodontics".</summary>
    public string? Specialization { get; set; }

    /// <summary>Medical council registration, where the role requires one.</summary>
    public string? LicenseNumber { get; set; }

    public string? ContactNumber { get; set; }

    public required string Email { get; set; }

    /// <summary>Staff who leave are deactivated, never deleted — their consultations remain.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Links to the ASP.NET Core Identity user, by id only. Domain cannot reference
    /// Identity without breaking the dependency rule, so there is deliberately no
    /// navigation property here — Application resolves it.
    /// </summary>
    public Guid? ApplicationUserId { get; set; }
}
