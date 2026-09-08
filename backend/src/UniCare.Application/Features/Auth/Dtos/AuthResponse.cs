namespace UniCare.Application.Features.Auth.Dtos;

public record AuthResponse
{
    /// <summary>Short-lived JWT access token (15 minutes).</summary>
    public required string Token { get; init; }

    public required DateTimeOffset ExpiresAtUtc { get; init; }

    /// <summary>
    /// Long-lived opaque refresh token (7 days). Stored server-side in
    /// AspNetUserTokens — can be revoked immediately when an account is
    /// suspended or a user logs out.
    /// </summary>
    public required string RefreshToken { get; init; }

    public required DateTimeOffset RefreshTokenExpiresAtUtc { get; init; }

    public required CurrentUserDto User { get; init; }
}
