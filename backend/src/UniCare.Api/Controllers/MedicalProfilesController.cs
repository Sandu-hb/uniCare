using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Features.MedicalProfiles;
using UniCare.Application.Features.MedicalProfiles.Dtos;
using UniCare.Application.Features.Students;
using UniCare.Domain.Constants;

namespace UniCare.Api.Controllers;

/// <summary>
/// A student has at most one medical profile, so the routes hang off the student
/// rather than exposing a separate profile id.
/// </summary>
[ApiController]
[Route("api/students/{studentId:guid}/medical-profile")]
[Authorize]
public class MedicalProfilesController(
    IMedicalProfileService profileService,
    IStudentService studentService,
    IValidator<UpsertMedicalProfileRequest> upsertValidator,
    IValidator<RejectMedicalProfileRequest> rejectValidator) : ControllerBase
{
    private const string ReviewerRoles = $"{AppRoles.Doctor},{AppRoles.Nurse},{AppRoles.Admin}";

    private Guid CurrentApplicationUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsStaff() => AppRoles.Staff.Any(User.IsInRole);

    /// <summary>Staff may view any profile; a student may only view their own.</summary>
    [HttpGet]
    public async Task<ActionResult<MedicalProfileDto>> Get(
        Guid studentId, CancellationToken cancellationToken)
    {
        if (!IsStaff() &&
            !await studentService.IsOwnedByApplicationUserAsync(studentId, CurrentApplicationUserId, cancellationToken))
        {
            return Forbid();
        }

        var profile = await profileService.GetByStudentIdAsync(studentId, cancellationToken);
        return profile is null ? NotFound() : Ok(profile);
    }

    /// <summary>
    /// Creates the profile on first call, updates it thereafter. Owner only — even
    /// staff cannot edit a student's data, only verify or reject it once submitted.
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<MedicalProfileDto>> Upsert(
        Guid studentId, UpsertMedicalProfileRequest request, CancellationToken cancellationToken)
    {
        if (!await studentService.IsOwnedByApplicationUserAsync(studentId, CurrentApplicationUserId, cancellationToken))
        {
            return Forbid();
        }

        var validation = await upsertValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        return Ok(await profileService.UpsertAsync(studentId, request, cancellationToken));
    }

    [HttpPost("submit")]
    public async Task<ActionResult<MedicalProfileDto>> Submit(
        Guid studentId, CancellationToken cancellationToken)
    {
        if (!await studentService.IsOwnedByApplicationUserAsync(studentId, CurrentApplicationUserId, cancellationToken))
        {
            return Forbid();
        }

        return Ok(await profileService.SubmitAsync(studentId, cancellationToken));
    }

    [HttpPost("verify")]
    [Authorize(Roles = ReviewerRoles)]
    public async Task<ActionResult<MedicalProfileDto>> Verify(
        Guid studentId, CancellationToken cancellationToken)
    {
        return Ok(await profileService.VerifyAsync(studentId, CurrentApplicationUserId, cancellationToken));
    }

    [HttpPost("reject")]
    [Authorize(Roles = ReviewerRoles)]
    public async Task<ActionResult<MedicalProfileDto>> Reject(
        Guid studentId,
        RejectMedicalProfileRequest request,
        CancellationToken cancellationToken)
    {
        var validation = await rejectValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        return Ok(await profileService.RejectAsync(
            studentId, CurrentApplicationUserId, request.Reason, cancellationToken));
    }
}
