namespace UniCare.Application.Abstractions;

public interface IOcrService
{
    Task<string> ExtractTextAsync(Stream fileContent, CancellationToken cancellationToken = default);
}
