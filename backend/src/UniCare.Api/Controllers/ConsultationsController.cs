using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Features.Consultations;
using UniCare.Application.Features.Consultations.Dtos;
using UniCare.Application.Features.Students;
using UniCare.Application.Features.Visits;
using UniCare.Domain.Constants;

namespace UniCare.Api.Controllers;

/// <summary>
/// One consultation per visit, including its diagnoses.
/// </summary>
[ApiController]
[Authorize]
public class ConsultationsController(
    IConsultationService consultationService,
    IVisitService visitService,
    IStudentService studentService,
    IValidator<UpsertConsultationRequest> validator) : ControllerBase
{
    private Guid CurrentApplicationUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsStaff() => AppRoles.Staff.Any(User.IsInRole);

    /// <summary>Any staff member, or the student the visit belongs to.</summary>
    [HttpGet("api/visits/{visitId:guid}/consultation")]
    public async Task<ActionResult<ConsultationDto>> Get(Guid visitId, CancellationToken cancellationToken)
    {
        var visit = await visitService.GetByIdAsync(visitId, cancellationToken);
        if (visit is null)
        {
            return NotFound();
        }

        if (!IsStaff() &&
            !await studentService.IsOwnedByApplicationUserAsync(visit.StudentId, CurrentApplicationUserId, cancellationToken))
        {
            return Forbid();
        }

        var consultation = await consultationService.GetByVisitIdAsync(visitId, cancellationToken);
        return consultation is null ? NotFound() : Ok(consultation);
    }

    /// <summary>Doctor only — this is the Doctor stage of the queue.</summary>
    [HttpPut("api/visits/{visitId:guid}/consultation")]
    [Authorize(Roles = AppRoles.Doctor)]
    public async Task<ActionResult<ConsultationDto>> Upsert(
        Guid visitId, UpsertConsultationRequest request, CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        return Ok(await consultationService.UpsertAsync(
            visitId, CurrentApplicationUserId, request, cancellationToken));
    }
}
