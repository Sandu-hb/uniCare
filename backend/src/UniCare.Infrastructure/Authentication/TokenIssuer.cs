using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UniCare.Application.Features.Auth.Dtos;
using UniCare.Infrastructure.Data;

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
    JwtTokenGenerator tokenGenerator,
    UniCareDbContext db)
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

        var specialization = await GetSpecializationAsync(user.Id, cancellationToken);

        return new AuthResponse
        {
            Token = token,
            ExpiresAtUtc = expiresAtUtc,
            RefreshToken = refreshToken,
            RefreshTokenExpiresAtUtc = refreshTokenExpiresAtUtc,
            User = ToCurrentUserDto(user, roles, specialization),
        };
    }

    /// <summary>
    /// A Student has no Staff row at all, so this is null for them; a staff
    /// account with no specialization set is also null — both cases mean
    /// "no specialization-based access beyond the account's role(s)".
    /// </summary>
    public async Task<string?> GetSpecializationAsync(Guid applicationUserId, CancellationToken cancellationToken = default) =>
        await db.Staff.AsNoTracking()
            .Where(s => s.ApplicationUserId == applicationUserId)
            .Select(s => s.Specialization)
            .FirstOrDefaultAsync(cancellationToken);

    public static CurrentUserDto ToCurrentUserDto(ApplicationUser user, IList<string> roles, string? specialization = null) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email ?? string.Empty,
        Roles = [.. roles],
        Status = user.Status,
        MustChangePassword = user.MustChangePassword,
        Specialization = specialization,
    };
}
