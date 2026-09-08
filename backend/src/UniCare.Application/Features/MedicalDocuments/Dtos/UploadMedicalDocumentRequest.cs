using UniCare.Domain.Enums;

namespace UniCare.Application.Features.MedicalDocuments.Dtos;

/// <summary>
/// The metadata that travels alongside the file. The file itself is bound
/// separately by ASP.NET Core as an IFormFile controller parameter — it is
/// never a property here, because DTOs are plain data the framework can bind
/// from a form or JSON body, and a stream is neither.
/// </summary>
public record UploadMedicalDocumentRequest
{
    public required DocumentType DocumentType { get; init; }
}
