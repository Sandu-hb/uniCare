namespace UniCare.Application.Exceptions;

/// <summary>
/// Thrown when a refresh token is missing, expired, or does not match the stored
/// value. Returns 401 via GlobalExceptionHandler — same as InvalidCredentialsException
/// so callers cannot distinguish "bad refresh token" from "bad password".
/// </summary>
public class InvalidRefreshTokenException()
    : Exception("The refresh token is invalid or has expired.");
