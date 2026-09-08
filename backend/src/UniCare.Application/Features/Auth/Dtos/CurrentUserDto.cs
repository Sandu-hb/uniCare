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
}
