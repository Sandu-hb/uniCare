using Microsoft.AspNetCore.Identity;
using UniCare.Application.Features.Auth.Dtos;

namespace UniCare.Infrastructure.Authentication;

/// <summary>
/// Issues a fresh access/refresh token pair for a user and persists the
/// refresh token. Shared by AuthService (login, refresh) and
/// StudentAccountService (auto-login right after self-registration) so the
/// token-issuing logic — including the refresh token's storage — exists in
/// exactly one place rather than two copies quietly drifting apart.
/// </summary>
public class TokenIssuer(
    UserManager<ApplicationUser> userManager,
    JwtTokenGenerator tokenGenerator)
{
    private const string LoginProvider = "UniCare";
    private const string RefreshTokenName = "RefreshToken";

    // Matches AuthService's own comment: short-lived access token, longer-lived
    // refresh token, so a stolen access token expires fast while the refresh
    // token survives a closed browser tab.
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);

    public async Task<AuthResponse> IssueAsync(
        ApplicationUser user, CancellationToken cancellationToken = default)
    {
        var roles = await userManager.GetRolesAsync(user);
        var (token, expiresAtUtc) = tokenGenerator.Generate(user, roles);

        // Cryptographically random, URL-safe opaque token.
        // Guid.NewGuid() is not cryptographically strong — use RandomNumberGenerator instead.
        var refreshToken = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64));
        var refreshTokenExpiresAtUtc = DateTimeOffset.UtcNow.Add(RefreshTokenLifetime);

        // SetAuthenticationTokenAsync upserts: creates the row if absent,
        // replaces the value if present — automatic rotation with no extra SQL.
        await userManager.SetAuthenticationTokenAsync(user, LoginProvider, RefreshTokenName, refreshToken);

        return new AuthResponse
        {
            Token = token,
            ExpiresAtUtc = expiresAtUtc,
            RefreshToken = refreshToken,
            RefreshTokenExpiresAtUtc = refreshTokenExpiresAtUtc,
            User = ToCurrentUserDto(user, roles),
        };
    }

    public static CurrentUserDto ToCurrentUserDto(ApplicationUser user, IList<string> roles) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email ?? string.Empty,
        Roles = [.. roles],
        Status = user.Status,
    };
}
