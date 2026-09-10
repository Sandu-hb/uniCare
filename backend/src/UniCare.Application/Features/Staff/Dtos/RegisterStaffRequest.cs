using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Staff.Dtos;

/// <summary>
/// Self-service registration. Deliberately a separate type from
/// CreateStaffRequest, even though the fields match today — this is the
/// untrusted, public entry point, and Role here is restricted to non-admin
/// roles by RegisterStaffRequestValidator. The account starts PendingApproval.
/// </summary>
public record RegisterStaffRequest
{
    public required string Email { get; init; }
    public required string Password { get; init; }
    public required string FullName { get; init; }
    public required StaffRole Role { get; init; }
    public string? Specialization { get; init; }
    public string? LicenseNumber { get; init; }
    public string? ContactNumber { get; init; }
}
