using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Features.Auth;
using UniCare.Application.Features.Auth.Dtos;

namespace UniCare.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    IAuthService authService,
    IValidator<LoginRequest> loginValidator,
    IValidator<RefreshRequest> refreshValidator) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginRequest request, CancellationToken cancellationToken)
    {
        var validation = await loginValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            return ValidationProblem(ModelState);
        }

        // InvalidCredentialsException (401) and AccountSuspendedException (403) are
        // caught by GlobalExceptionHandler — this method only handles the happy path.
        return Ok(await authService.LoginAsync(request, cancellationToken));
    }

    /// <summary>
    /// Exchange a valid refresh token for a new access token + refresh token pair.
    /// The old refresh token is immediately rotated (invalidated) on success.
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Refresh(
        RefreshRequest request, CancellationToken cancellationToken)
    {
        var validation = await refreshValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            return ValidationProblem(ModelState);
        }

        // InvalidRefreshTokenException (401) handled by GlobalExceptionHandler.
        return Ok(await authService.RefreshAsync(request, cancellationToken));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<CurrentUserDto>> Me(CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await authService.GetCurrentUserAsync(userId, cancellationToken));
    }

    /// <summary>
    /// Revokes the server-side refresh token, completing a true stateful logout.
    /// The short-lived access token will expire on its own within 15 minutes.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await authService.RevokeAsync(userId, cancellationToken);
        return NoContent();
    }
}
