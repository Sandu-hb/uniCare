using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Features.Counseling;
using UniCare.Application.Features.Counseling.Dtos;
using UniCare.Application.Features.Students;
using UniCare.Domain.Constants;

namespace UniCare.Api.Controllers;

[ApiController]
[Route("api/wellness")]
[Authorize]
public class WellnessController(
    ICounselingService counselingService,
    IStudentService studentService,
    IValidator<SendCounselingMessageRequest> sendMessageValidator) : ControllerBase
{
    private Guid CurrentApplicationUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Resolves the signed-in student's own record, or null if the caller isn't one.</summary>
    private async Task<Guid?> CurrentStudentIdAsync(CancellationToken cancellationToken)
    {
        var student = await studentService.GetByApplicationUserIdAsync(CurrentApplicationUserId, cancellationToken);
        return student?.Id;
    }

    [HttpPost("sessions")]
    [Authorize(Roles = AppRoles.Student)]
    public async Task<ActionResult<CounselingSessionDto>> StartOrResumeSession(CancellationToken cancellationToken)
    {
        var studentId = await CurrentStudentIdAsync(cancellationToken);
        if (studentId is null)
        {
            return Forbid();
        }

        return Ok(await counselingService.GetOrStartActiveSessionAsync(studentId.Value, cancellationToken));
    }

    [HttpPost("sessions/{sessionId:guid}/messages")]
    [Authorize(Roles = AppRoles.Student)]
    public async Task<ActionResult<CounselingSessionDto>> SendMessage(
        Guid sessionId, SendCounselingMessageRequest request, CancellationToken cancellationToken)
    {
        var studentId = await CurrentStudentIdAsync(cancellationToken);
        if (studentId is null)
        {
            return Forbid();
        }

        var validation = await sendMessageValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        return Ok(await counselingService.SendMessageAsync(studentId.Value, sessionId, request.Content, cancellationToken));
    }

    [HttpGet("sessions")]
    [Authorize(Roles = AppRoles.Student)]
    public async Task<ActionResult<IReadOnlyList<CounselingSessionSummaryDto>>> GetOwnSessions(
        CancellationToken cancellationToken)
    {
        var studentId = await CurrentStudentIdAsync(cancellationToken);
        if (studentId is null)
        {
            return Forbid();
        }

        return Ok(await counselingService.GetSessionsForStudentAsync(studentId.Value, cancellationToken));
    }

    [HttpGet("sessions/{sessionId:guid}")]
    [Authorize(Roles = AppRoles.Student)]
    public async Task<ActionResult<CounselingSessionDto>> GetOwnSessionDetail(
        Guid sessionId, CancellationToken cancellationToken)
    {
        var studentId = await CurrentStudentIdAsync(cancellationToken);
        if (studentId is null)
        {
            return Forbid();
        }

        var session = await counselingService.GetOwnSessionDetailAsync(studentId.Value, sessionId, cancellationToken);
        return session is null ? NotFound() : Ok(session);
    }

    /// <summary>Admin-only: every session ever flagged for crisis indicators. Ordinary sessions are never visible to staff.</summary>
    [HttpGet("alerts")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<IReadOnlyList<CounselingSessionSummaryDto>>> GetFlaggedSessions(
        CancellationToken cancellationToken) =>
        Ok(await counselingService.GetFlaggedSessionsAsync(cancellationToken));

    [HttpGet("alerts/{sessionId:guid}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<CounselingSessionDto>> GetFlaggedSessionDetail(
        Guid sessionId, CancellationToken cancellationToken)
    {
        var session = await counselingService.GetFlaggedSessionDetailAsync(sessionId, cancellationToken);
        return session is null ? NotFound() : Ok(session);
    }
}
