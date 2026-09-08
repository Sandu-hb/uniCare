namespace UniCare.Application.Features.Auth.Dtos;

public record RefreshRequest
{
    public required string RefreshToken { get; init; }
}
