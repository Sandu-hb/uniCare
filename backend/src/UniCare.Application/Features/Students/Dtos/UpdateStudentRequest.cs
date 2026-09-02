namespace UniCare.Application.Features.Students.Dtos;

/// <summary>
/// Editable fields only. RegistrationNumber and DateOfBirth are missing on purpose —
/// they identify the person and must not change through a routine edit. Making them
/// absent from the type is stronger than trusting the service to ignore them.
/// </summary>
public record UpdateStudentRequest
{
    public required string FullName { get; init; }
    public required string Faculty { get; init; }
    public required string Department { get; init; }
    public required int AcademicYear { get; init; }
    public string? ContactNumber { get; init; }
    public required string Email { get; init; }
    public string? Address { get; init; }
    public string? EmergencyContactName { get; init; }
    public string? EmergencyContactNumber { get; init; }
}
