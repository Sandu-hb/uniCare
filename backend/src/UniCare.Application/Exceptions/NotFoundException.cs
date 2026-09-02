namespace UniCare.Application.Exceptions;

/// <summary>Thrown when an operation targets an entity that does not exist.</summary>
public class NotFoundException(string entityName, object key)
    : Exception($"{entityName} with key '{key}' was not found.")
{
    public string EntityName { get; } = entityName;
    public object Key { get; } = key;
}
