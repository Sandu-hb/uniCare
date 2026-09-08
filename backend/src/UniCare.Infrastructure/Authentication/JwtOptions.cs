namespace UniCare.Infrastructure.Authentication;

/// <summary>Bound from the JWT_* environment variables — see AddInfrastructure.</summary>
public class JwtOptions
{
    public required string Secret { get; init; }
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public required int ExpiryMinutes { get; init; }
}
