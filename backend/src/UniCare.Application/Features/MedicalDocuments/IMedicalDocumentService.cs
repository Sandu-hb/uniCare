using UniCare.Application.Features.MedicalDocuments.Dtos;

namespace UniCare.Application.Features.MedicalDocuments;

public interface IMedicalDocumentService
{
    /// <summary>
    /// Takes a plain Stream and primitives rather than IFormFile — that type
    /// belongs to ASP.NET Core's web framework, and Application must not depend
    /// on it, exactly as it must not depend on EF Core or Npgsql. The controller
    /// unpacks IFormFile before calling this.
    /// </summary>
    Task<MedicalDocumentDto> UploadAsync(
        Guid studentId,
        Stream fileContent,
        string fileName,
        string contentType,
        long fileSizeBytes,
        UploadMedicalDocumentRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MedicalDocumentDto>> GetForStudentAsync(
        Guid studentId, CancellationToken cancellationToken = default);
}
