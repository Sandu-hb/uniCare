namespace UniCare.Application.Exceptions;

/// <summary>Thrown when a request violates a uniqueness or state rule.</summary>
public class ConflictException(string message) : Exception(message);
