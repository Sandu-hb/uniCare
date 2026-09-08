using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Features.MedicalProfiles;
using UniCare.Application.Features.MedicalProfiles.Dtos;
using UniCare.Domain.Constants;

namespace UniCare.Api.Controllers;

/// <summary>
/// A student has at most one medical profile, so the routes hang off the student
/// rather than exposing a separate profile id.
/// </summary>
[ApiController]
[Route("api/students/{studentId:guid}/medical-profile")]
public class MedicalProfilesController(
    IMedicalProfileService profileService,
    IValidator<UpsertMedicalProfileRequest> upsertValidator,
    IValidator<RejectMedicalProfileRequest> rejectValidator) : ControllerBase
{
    private const string ReviewerRoles = $"{AppRoles.Doctor},{AppRoles.Nurse},{AppRoles.Admin}";

    [HttpGet]
    public async Task<ActionResult<MedicalProfileDto>> Get(
        Guid studentId, CancellationToken cancellationToken)
    {
        var profile = await profileService.GetByStudentIdAsync(studentId, cancellationToken);
        return profile is null ? NotFound() : Ok(profile);
    }

    /// <summary>Creates the profile on first call, updates it thereafter.</summary>
    [HttpPut]
    public async Task<ActionResult<MedicalProfileDto>> Upsert(
        Guid studentId, UpsertMedicalProfileRequest request, CancellationToken cancellationToken)
    {
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
        return Ok(await profileService.SubmitAsync(studentId, cancellationToken));
    }

    [HttpPost("verify")]
    [Authorize(Roles = ReviewerRoles)]
    public async Task<ActionResult<MedicalProfileDto>> Verify(
        Guid studentId, CancellationToken cancellationToken)
    {
        var reviewerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await profileService.VerifyAsync(studentId, reviewerId, cancellationToken));
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

        var reviewerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await profileService.RejectAsync(
            studentId, reviewerId, request.Reason, cancellationToken));
    }
}
