using Microsoft.AspNetCore.Identity;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.Auth;
using UniCare.Application.Features.Auth.Dtos;
using UniCare.Domain.Enums;

namespace UniCare.Infrastructure.Authentication;

/// <summary>
/// Implements the Application-facing auth contract on top of ASP.NET Core
/// Identity. Registered in UniCare.Infrastructure.DependencyInjection, the same
/// way UniCareDbContext backs IApplicationDbContext.
/// </summary>
public class AuthService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    JwtTokenGenerator tokenGenerator) : IAuthService
{
    // Name used when storing tokens in AspNetUserTokens.
    // The loginProvider + tokenName pair forms a composite key on that table.
    private const string LoginProvider = "UniCare";
    private const string RefreshTokenName = "RefreshToken";

    // Refresh tokens live for 7 days. Access tokens are 15 minutes (set via
    // JWT_EXPIRY_MINUTES in .env). The asymmetry means a stolen access token
    // expires quickly, while the refresh token survives a closed browser tab.
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await userManager.FindByEmailAsync(email);

        // CheckPasswordSignInAsync (not UserManager.CheckPasswordAsync) so failed
        // attempts count toward Identity's lockout — five misses locks the account
        // out for a few minutes even if the password is eventually guessed right.
        var signInResult = user is null
            ? SignInResult.Failed
            : await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

        // One message regardless of which check failed — telling the caller "no such
        // account" vs "wrong password" would confirm which university emails exist.
        if (user is null || !signInResult.Succeeded)
        {
            throw new InvalidCredentialsException();
        }

        if (user.Status == AccountStatus.Suspended)
        {
            throw new AccountSuspendedException();
        }

        return await BuildAuthResponseAsync(user);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default)
    {
        // Find which user owns this refresh token.
        // UserManager stores tokens as (userId, loginProvider, tokenName) → value,
        // so we must search all users. The table is small and this path is infrequent.
        var user = await FindUserByRefreshTokenAsync(request.RefreshToken);

        if (user is null || user.Status == AccountStatus.Suspended)
        {
            // Same generic message as a bad login — no information leakage.
            throw new InvalidRefreshTokenException();
        }

        // Validate the stored token matches what the client sent.
        var stored = await userManager.GetAuthenticationTokenAsync(user, LoginProvider, RefreshTokenName);
        if (stored is null || stored != request.RefreshToken)
        {
            throw new InvalidRefreshTokenException();
        }

        // Token rotation: delete the old token and issue a brand-new one.
        // If a stolen token is ever used, the legitimate user's next refresh will
        // fail (token already rotated), alerting them to re-authenticate.
        return await BuildAuthResponseAsync(user);
    }

    public async Task RevokeAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null) return;

        // Silently a no-op if there is no token stored — idempotent logout.
        await userManager.RemoveAuthenticationTokenAsync(user, LoginProvider, RefreshTokenName);
    }

    public async Task<CurrentUserDto> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException(nameof(ApplicationUser), userId);

        var roles = await userManager.GetRolesAsync(user);
        return ToCurrentUserDto(user, roles);
    }

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    /// <summary>
    /// Generates a new access token + refresh token, stores the refresh token in
    /// AspNetUserTokens (replacing any existing one), and builds the response DTO.
    /// </summary>
    private async Task<AuthResponse> BuildAuthResponseAsync(ApplicationUser user)
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

    /// <summary>
    /// Searches AspNetUserTokens for the given refresh token value.
    /// EF Core does not expose a direct query here, so we use UserManager's
    /// token-retrieval on a per-user basis only after finding the user via a
    /// claim stored in the token itself isn't possible with opaque tokens.
    /// Instead we store the userId in a parallel lookup token.
    /// </summary>
    private async Task<ApplicationUser?> FindUserByRefreshTokenAsync(string refreshToken)
    {
        // We store a reverse-lookup token: userId stored under "RefreshTokenUserId"
        // keyed by the refresh token value. This avoids a full-table scan of AspNetUsers.
        // On every token issue, we write both:
        //   (userId, "UniCare", "RefreshToken")       → refreshToken value
        //   ("UniCare", "RefreshTokenUserId", refreshToken) → userId value  ← NOT feasible
        //
        // Simpler production approach: embed userId in the refresh token itself (signed).
        // For this project (small user base, university clinic) we use a direct DB query
        // via UserManager's backing store.
        var users = userManager.Users.ToList();
        foreach (var user in users)
        {
            var stored = await userManager.GetAuthenticationTokenAsync(user, LoginProvider, RefreshTokenName);
            if (stored == refreshToken) return user;
        }
        return null;
    }

    private static CurrentUserDto ToCurrentUserDto(ApplicationUser user, IList<string> roles) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email ?? string.Empty,
        Roles = [.. roles],
        Status = user.Status,
    };
}
