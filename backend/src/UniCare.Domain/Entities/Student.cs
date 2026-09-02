using UniCare.Domain.Common;
using UniCare.Domain.Enums;

namespace UniCare.Domain.Entities;

public class Student : AuditableEntity
{
    public required string RegistrationNumber { get; set; }
    public required string FullName { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public required string Faculty { get; set; }
    public required string Department { get; set; }
    public int AcademicYear { get; set; }
    public string? ContactNumber { get; set; }
    public required string Email { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactNumber { get; set; }

    /// <summary>Identity link by id only — same reason as Staff.</summary>
    public Guid? ApplicationUserId { get; set; }

    public MedicalProfile? MedicalProfile { get; set; }
    public ICollection<Appointment> Appointments { get; set; } = [];
    public ICollection<MedicalVisit> Visits { get; set; } = [];
}
