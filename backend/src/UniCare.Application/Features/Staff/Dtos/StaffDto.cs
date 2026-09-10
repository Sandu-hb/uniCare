using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Staff.Dtos;

public record StaffDto
{
    public required Guid Id { get; init; }
    public required string StaffNumber { get; init; }
    public required string FullName { get; init; }
    public required string Email { get; init; }
    public required StaffRole Role { get; init; }
    public string? Specialization { get; init; }
    public string? LicenseNumber { get; init; }
    public string? ContactNumber { get; init; }

    /// <summary>Whether this person currently works here, distinct from AccountStatus.</summary>
    public required bool IsActive { get; init; }

    /// <summary>Whether the linked sign-in account may authenticate at all.</summary>
    public required AccountStatus AccountStatus { get; init; }
}
