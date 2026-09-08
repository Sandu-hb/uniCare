using UniCare.Application.Features.Auth.Dtos;

namespace UniCare.Application.Features.Auth;

/// <summary>
/// Authentication as Application sees it. The implementation lives in
/// Infrastructure (it needs ASP.NET Core Identity's password hashing and user
/// store), mirroring how IApplicationDbContext hides EF Core — Application only
/// ever sees this interface and plain DTOs.
/// </summary>
public interface IAuthService
{
    /// <exception cref="Exceptions.InvalidCredentialsException">Email or password does not match.</exception>
    /// <exception cref="Exceptions.AccountSuspendedException">Credentials are correct but the account is suspended.</exception>
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Issues a new access token + refresh token pair using a valid refresh token.
    /// The old refresh token is replaced (rotation) so each token can only be used once.
    /// </summary>
    /// <exception cref="Exceptions.InvalidRefreshTokenException">Token not found or user account suspended.</exception>
    Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Revokes the stored refresh token for a user, effectively logging them out
    /// server-side. Call this on logout or when an admin suspends an account.
    /// </summary>
    Task RevokeAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<CurrentUserDto> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
