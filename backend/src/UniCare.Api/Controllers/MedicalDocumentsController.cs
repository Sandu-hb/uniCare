using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Features.MedicalDocuments;
using UniCare.Application.Features.MedicalDocuments.Dtos;
using UniCare.Application.Features.Students;
using UniCare.Domain.Constants;

namespace UniCare.Api.Controllers;

[ApiController]
[Route("api/students/{studentId:guid}/documents")]
[Authorize]
public class MedicalDocumentsController(
    IMedicalDocumentService documentService,
    IStudentService studentService,
    IValidator<UploadMedicalDocumentRequest> uploadValidator) : ControllerBase
{
    private Guid CurrentApplicationUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsStaff() => AppRoles.Staff.Any(User.IsInRole);

    /// <summary>Staff may view any student's documents; a student may only view their own.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MedicalDocumentDto>>> GetForStudent(
        Guid studentId, CancellationToken cancellationToken)
    {
        if (!IsStaff() &&
            !await studentService.IsOwnedByApplicationUserAsync(studentId, CurrentApplicationUserId, cancellationToken))
        {
            return Forbid();
        }

        return Ok(await documentService.GetForStudentAsync(studentId, cancellationToken));
    }

    // [FromForm] because this is a multipart request — a file plus a field —
    // not JSON. [ApiController]'s automatic model binding cannot infer that
    // for a mixed file+data body, so it must be stated explicitly.
    //
    // Owner only — uploading is the student's action per the SRS; staff verify
    // and extract from what a student has already uploaded, they do not upload
    // on someone's behalf.
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)] // matches MedicalDocumentService.MaxSizeBytes
    public async Task<ActionResult<MedicalDocumentDto>> Upload(
        Guid studentId,
        [FromForm] IFormFile file,
        [FromForm] UploadMedicalDocumentRequest request,
        CancellationToken cancellationToken)
    {
        if (!await studentService.IsOwnedByApplicationUserAsync(studentId, CurrentApplicationUserId, cancellationToken))
        {
            return Forbid();
        }

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
