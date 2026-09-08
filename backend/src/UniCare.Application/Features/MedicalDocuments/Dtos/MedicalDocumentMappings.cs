using System.Linq.Expressions;
using UniCare.Domain.Entities;

namespace UniCare.Application.Features.MedicalDocuments.Dtos;

public static class MedicalDocumentMappings
{
    public static Expression<Func<MedicalDocument, MedicalDocumentDto>> Projection =>
        doc => new MedicalDocumentDto
        {
            Id = doc.Id,
            StudentId = doc.StudentId,
            OriginalFileName = doc.OriginalFileName,
            ContentType = doc.ContentType,
            SizeBytes = doc.SizeBytes,
            DocumentType = doc.DocumentType,
            Status = doc.Status,
            UploadedAt = doc.UploadedAt,
        };

    public static MedicalDocumentDto ToDto(this MedicalDocument doc) =>
        Projection.Compile()(doc);
}
