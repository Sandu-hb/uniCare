using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Students.Dtos;

/// <summary>
/// What the API returns for a student. Deliberately flat: no navigation to
/// MedicalProfile, so allergies and chronic conditions cannot leak through a
/// serializer walking the object graph.
/// </summary>
public record StudentDto
{
    public required Guid Id { get; init; }
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
