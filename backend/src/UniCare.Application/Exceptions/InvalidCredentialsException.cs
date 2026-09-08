namespace UniCare.Application.Exceptions;

/// <summary>
/// Thrown when an email/password pair does not match an account. The message is
/// deliberately generic — it must never reveal whether the email itself exists.
/// </summary>
public class InvalidCredentialsException()
    : Exception("Email or password is incorrect.");
