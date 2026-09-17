using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using UniCare.Application.Abstractions;

namespace UniCare.Infrastructure.Services;

/// <summary>
/// Stores files in Cloudinary under plain "upload" (public) delivery — not
/// "private"/"authenticated". Both of those 401 on this account's free tier
/// with "x-cld-error: deny or ACL failure", confirmed even against
/// Cloudinary's own Admin-API-issued signed URLs, so their ACL layer isn't
/// usable here. Access control instead lives entirely in this app:
/// MedicalDocumentsController checks staff-or-owner before ever calling
/// OpenReadAsync, the storage key is a GUID (never guessable) and is never
/// returned to the client (see MedicalDocumentDto — no StorageKey field) —
/// only this server ever sees the Cloudinary URL.
/// </summary>
public class CloudinaryFileStorage : IFileStorage
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryFileStorage()
    {
        var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME")
            ?? throw new InvalidOperationException("CLOUDINARY_CLOUD_NAME is not set.");
        var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY")
            ?? throw new InvalidOperationException("CLOUDINARY_API_KEY is not set.");
        var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET")
            ?? throw new InvalidOperationException("CLOUDINARY_API_SECRET is not set.");

        _cloudinary = new Cloudinary(new Account(cloudName, apiKey, apiSecret))
        {
            Api = { Secure = true }
        };
    }

    public async Task<string> SaveAsync(
        Stream content, string suggestedExtension, CancellationToken cancellationToken = default)
    {
        var publicId = $"medical-documents/{Guid.NewGuid()}{suggestedExtension}";

        var uploadParams = new RawUploadParams
        {
            File = new FileDescription(publicId, content),
            PublicId = publicId,
            Type = "upload",
            Overwrite = false,
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error is not null)
        {
            throw new InvalidOperationException($"Cloudinary upload failed: {result.Error.Message}");
        }

        return publicId; // saved as MedicalDocument.StorageKey
    }

    public async Task<Stream> OpenReadAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var url = _cloudinary.Api
            .UrlImgUp
            .ResourceType("raw")
            .Type("upload")
            .BuildUrl(storageKey);

        using var http = new HttpClient();
        var bytes = await http.GetByteArrayAsync(url, cancellationToken);
        return new MemoryStream(bytes);
    }

    public async Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var result = await _cloudinary.DestroyAsync(new DeletionParams(storageKey)
        {
            ResourceType = ResourceType.Raw,
            Type = "upload",
        });

        if (result.Error is not null)
        {
            throw new InvalidOperationException($"Cloudinary delete failed: {result.Error.Message}");
        }
    }
}
