using Microsoft.EntityFrameworkCore;
using UniCare.Application.Abstractions;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.MedicalDocuments.Dtos;
using UniCare.Domain.Entities;
using UniCare.Domain.Enums;

namespace UniCare.Application.Features.MedicalDocuments;

public class MedicalDocumentService(IApplicationDbContext db, IFileStorage storage) : IMedicalDocumentService
{
    private const long MaxSizeBytes = 10 * 1024 * 1024; // 10 MB

    private static readonly Dictionary<string, string> AllowedTypes = new()
    {
        [".pdf"] = "application/pdf",
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".png"] = "image/png",
    };

    public async Task<MedicalDocumentDto> UploadAsync(
        Guid studentId,
        Stream fileContent,
        string fileName,
        string contentType,
        long fileSizeBytes,
        UploadMedicalDocumentRequest request,
        CancellationToken cancellationToken = default)
    {
        var studentExists = await db.Students.AnyAsync(s => s.Id == studentId, cancellationToken);
        if (!studentExists)
        {
            throw new NotFoundException(nameof(Student), studentId);
        }

        if (fileSizeBytes == 0)
        {
            throw new ConflictException("The uploaded file is empty.");
        }

        if (fileSizeBytes > MaxSizeBytes)
        {
            throw new ConflictException($"File exceeds the {MaxSizeBytes / 1024 / 1024} MB limit.");
        }

        var extension = Path.GetExtension(fileName).ToLowerInvariant();

        if (!AllowedTypes.TryGetValue(extension, out var expectedContentType))
        {
            throw new ConflictException(
                $"File type '{extension}' is not accepted. Allowed: {string.Join(", ", AllowedTypes.Keys)}.");
        }

        if (!string.Equals(contentType, expectedContentType, StringComparison.OrdinalIgnoreCase))
        {
            throw new ConflictException(
                $"The file's declared type ('{contentType}') does not match its extension.");
        }

        var storageKey = await storage.SaveAsync(fileContent, extension, cancellationToken);

        var document = new MedicalDocument
        {
            StudentId = studentId,
            OriginalFileName = fileName,
            StorageKey = storageKey,
            ContentType = contentType,
            SizeBytes = fileSizeBytes,
            DocumentType = request.DocumentType,
            Status = DocumentStatus.Uploaded,
            UploadedAt = DateTimeOffset.UtcNow,
        };

        db.MedicalDocuments.Add(document);
        await db.SaveChangesAsync(cancellationToken);

        return document.ToDto();
    }

    public async Task<IReadOnlyList<MedicalDocumentDto>> GetForStudentAsync(
        Guid studentId, CancellationToken cancellationToken = default) =>
        await db.MedicalDocuments
            .AsNoTracking()
            .Where(d => d.StudentId == studentId)
            .OrderByDescending(d => d.UploadedAt)
            .Select(MedicalDocumentMappings.Projection)
            .ToListAsync(cancellationToken);
}
