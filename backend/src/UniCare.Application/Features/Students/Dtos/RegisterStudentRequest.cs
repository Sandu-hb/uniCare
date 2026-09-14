using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Students.Dtos;

/// <summary>
/// Self-service registration: everything CreateStudentRequest asks for, plus a
/// password to create the sign-in account. The resulting account starts
/// PendingApproval — an admin must Activate it before it can sign in.
/// </summary>
public record RegisterStudentRequest
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
    public required string Password { get; init; }
}
