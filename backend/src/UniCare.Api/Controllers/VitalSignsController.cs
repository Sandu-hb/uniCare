using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Features.Students;
using UniCare.Application.Features.Visits;
using UniCare.Application.Features.Vitals;
using UniCare.Application.Features.Vitals.Dtos;
using UniCare.Domain.Constants;

namespace UniCare.Api.Controllers;

/// <summary>
/// One vitals record per visit, so the route hangs off the visit rather than
/// exposing a separate id — same shape as the medical profile under a student.
/// </summary>
[ApiController]
[Authorize]
public class VitalSignsController(
    IVitalSignService vitalSignService,
    IVisitService visitService,
    IStudentService studentService,
    IValidator<UpsertVitalSignRequest> validator) : ControllerBase
{
    private Guid CurrentApplicationUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsStaff() => AppRoles.Staff.Any(User.IsInRole);

    /// <summary>Any staff member may read them — the doctor needs what the nurse recorded. A student may read their own.</summary>
    [HttpGet("api/visits/{visitId:guid}/vital-sign")]
    public async Task<ActionResult<VitalSignDto>> Get(Guid visitId, CancellationToken cancellationToken)
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

        var vitals = await vitalSignService.GetByVisitIdAsync(visitId, cancellationToken);
        return vitals is null ? NotFound() : Ok(vitals);
    }

    /// <summary>Nurse only — this is the Nurse stage of the queue.</summary>
    [HttpPut("api/visits/{visitId:guid}/vital-sign")]
    [Authorize(Roles = AppRoles.Nurse)]
    public async Task<ActionResult<VitalSignDto>> Upsert(
        Guid visitId, UpsertVitalSignRequest request, CancellationToken cancellationToken)
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

        return Ok(await vitalSignService.UpsertAsync(
            visitId, CurrentApplicationUserId, request, cancellationToken));
    }
}
