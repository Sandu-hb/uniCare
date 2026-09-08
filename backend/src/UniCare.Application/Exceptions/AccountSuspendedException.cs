namespace UniCare.Application.Exceptions;

/// <summary>Thrown when credentials are correct but the account has been suspended.</summary>
public class AccountSuspendedException()
    : Exception("This account has been suspended. Contact the medical centre.");
