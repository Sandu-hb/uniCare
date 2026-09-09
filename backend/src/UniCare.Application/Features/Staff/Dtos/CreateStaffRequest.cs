using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Staff.Dtos;

/// <summary>
/// Admin-created: any role, including Admin. The creating admin has already
/// vetted this person, so the account is Active immediately — no approval step.
/// </summary>
public record CreateStaffRequest
{
    public required string Email { get; init; }
    public required string Password { get; init; }
    public required string FullName { get; init; }
    public required StaffRole Role { get; init; }
    public string? Specialization { get; init; }
    public string? LicenseNumber { get; init; }
    public string? ContactNumber { get; init; }
}
