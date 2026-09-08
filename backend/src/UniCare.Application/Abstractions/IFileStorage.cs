namespace UniCare.Application.Abstractions;

/// <summary>
/// Storage for uploaded files, kept independent of any particular provider —
/// Cloudinary today, potentially something else later, with no change to
/// anything that calls this interface.
/// </summary>
public interface IFileStorage
{
    /// <summary>
    /// Saves a stream under a storage-generated key and returns that key.
    /// The caller supplies a suggested extension only — never trust an
    /// uploader-supplied filename as anything more than a display label.
    /// </summary>
    Task<string> SaveAsync(Stream content, string suggestedExtension, CancellationToken cancellationToken = default);

    Task<Stream> OpenReadAsync(string storageKey, CancellationToken cancellationToken = default);

    Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default);
}
