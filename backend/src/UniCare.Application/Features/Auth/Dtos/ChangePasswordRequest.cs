namespace UniCare.Application.Features.Auth.Dtos;

public record ChangePasswordRequest
{
    public required string CurrentPassword { get; init; }
    public required string NewPassword { get; init; }
}
