using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Students.Dtos;

/// <summary>
/// Registration input. Note what is absent: Id, ApplicationUserId and the audit
/// fields. A client cannot set them because they do not exist on this type —
/// the shape of the contract enforces it, not a validation rule someone can forget.
/// </summary>
public record CreateStudentRequest
{
    public required string RegistrationNumber { get; init; }
    public required string FullName { get; init; }
    public required DateOnly DateOfBirth { get; init; }
    public required Gender Gender { get; init; }
    public required string Faculty { get; init; }
    public required string Department { get; init; }
    public required int AcademicYear { get; init; }
    public string? ContactNumber { get; init; }
    public required string Email { get; init; }
    public string? Address { get; init; }
    public string? EmergencyContactName { get; init; }
    public string? EmergencyContactNumber { get; init; }
}
