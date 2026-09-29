using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Auth.Dtos;

/// <summary>
/// What the API returns as the signed-in identity. Roles is a list, not a single
/// value, so an account that one day holds more than one role needs no shape
/// change here.
/// </summary>
public record CurrentUserDto
{
    public required Guid Id { get; init; }
    public required string FullName { get; init; }
    public required string Email { get; init; }
    public required IReadOnlyList<string> Roles { get; init; }
    public required AccountStatus Status { get; init; }

    /// <summary>
    /// True if this account must change its password before doing anything
    /// else — set on admin-created staff accounts (temporary password) and
    /// after a credentials reset. The frontend routes here first.
    /// </summary>
    public required bool MustChangePassword { get; init; }

    /// <summary>
    /// The linked Staff row's specialization (e.g. "Laboratory", "Pharmacy"), or
    /// null for a Student or a staff account with none set. Lets the frontend
    /// grant a specialized staff member (e.g. a Nurse specialized in Laboratory)
    /// access to that department's pages alongside its dedicated role.
    /// </summary>
    public string? Specialization { get; init; }
}
