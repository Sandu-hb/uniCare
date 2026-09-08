using UniCare.Domain.Enums;

namespace UniCare.Application.Features.MedicalDocuments.Dtos;

/// <summary>
/// What the API returns for an uploaded document. No StorageKey — that is an
/// internal detail of where the file physically lives, and exposing it would
/// let a client guess at other students' file locations.
/// </summary>
public record MedicalDocumentDto
{
    public required Guid Id { get; init; }
    public required Guid StudentId { get; init; }
    public required string OriginalFileName { get; init; }
    public required string ContentType { get; init; }
    public required long SizeBytes { get; init; }
    public required DocumentType DocumentType { get; init; }
    public required DocumentStatus Status { get; init; }
    public required DateTimeOffset UploadedAt { get; init; }
}
