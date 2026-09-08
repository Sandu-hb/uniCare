using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Features.MedicalDocuments;
using UniCare.Application.Features.MedicalDocuments.Dtos;

namespace UniCare.Api.Controllers;

[ApiController]
[Route("api/students/{studentId:guid}/documents")]
public class MedicalDocumentsController(
    IMedicalDocumentService documentService,
    IValidator<UploadMedicalDocumentRequest> uploadValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MedicalDocumentDto>>> GetForStudent(
        Guid studentId, CancellationToken cancellationToken)
    {
        return Ok(await documentService.GetForStudentAsync(studentId, cancellationToken));
    }

    // [FromForm] because this is a multipart request — a file plus a field —
    // not JSON. [ApiController]'s automatic model binding cannot infer that
    // for a mixed file+data body, so it must be stated explicitly.
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)] // matches MedicalDocumentService.MaxSizeBytes
    public async Task<ActionResult<MedicalDocumentDto>> Upload(
        Guid studentId,
        [FromForm] IFormFile file,
        [FromForm] UploadMedicalDocumentRequest request,
        CancellationToken cancellationToken)
    {
        var validation = await uploadValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        var uploaded = await documentService.UploadAsync(
            studentId,
            file.OpenReadStream(),
            file.FileName,
            file.ContentType,
            file.Length,
            request,
            cancellationToken);

        return CreatedAtAction(nameof(GetForStudent), new { studentId }, uploaded);
    }
}
