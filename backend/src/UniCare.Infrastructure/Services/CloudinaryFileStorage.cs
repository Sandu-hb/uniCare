using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using UniCare.Application.Abstractions;

namespace UniCare.Infrastructure.Services;

/// <summary>
/// Stores files in Cloudinary under "private" delivery — never the public
/// default. A public URL would mean anyone who saw or guessed the link could
/// open a student's hospital report with no login at all. "private" (not
/// "authenticated") specifically: this account's Cloudinary configuration
/// rejects plain signed URLs for "authenticated"-type resources with a 401 —
/// confirmed even Cloudinary's own Admin-API-issued signed URL for an
/// existing "authenticated" resource 401s — while "private" uses the same
/// signed-URL delivery without whatever extra account-level restriction
/// applies to "authenticated".
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
            Type = "private",   // not "upload" — that would be public
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
        // Signed and short-lived on purpose — generated only at the moment
        // something actually needs to read the file, never stored.
        //
        // NOTE: this exact fluent chain has moved between CloudinaryDotNet
        // versions. Type `_cloudinary.` and let IntelliSense confirm the real
        // one rather than trusting this line blindly.
        var signedUrl = _cloudinary.Api
            .UrlImgUp
            .ResourceType("raw")
            .Type("private")
            .Signed(true)
            .BuildUrl(storageKey);

        using var http = new HttpClient();
        var bytes = await http.GetByteArrayAsync(signedUrl, cancellationToken);
        return new MemoryStream(bytes);
    }

    public async Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var result = await _cloudinary.DestroyAsync(new DeletionParams(storageKey)
        {
            ResourceType = ResourceType.Raw,
            Type = "private",
        });

        if (result.Error is not null)
        {
            throw new InvalidOperationException($"Cloudinary delete failed: {result.Error.Message}");
        }
    }
}
