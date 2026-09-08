using FluentValidation;
using UniCare.Application.Features.MedicalDocuments.Dtos;

namespace UniCare.Application.Features.MedicalDocuments.Validators;

public class UploadMedicalDocumentRequestValidator : AbstractValidator<UploadMedicalDocumentRequest>
{
    public UploadMedicalDocumentRequestValidator()
    {
        RuleFor(x => x.DocumentType).IsInEnum();
    }
}
