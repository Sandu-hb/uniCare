using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Features.Staff;
using UniCare.Application.Features.Students;
using UniCare.Application.Features.Visits;
using UniCare.Application.Features.Visits.Dtos;
using UniCare.Domain.Constants;
using UniCare.Domain.Enums;

namespace UniCare.Api.Controllers;

/// <summary>
/// Check-in and the live queue. Split between a student-scoped route
/// (check-in) and visit-id-addressed routes (everything else), the same
/// shape as AppointmentsController.
/// </summary>
[ApiController]
[Authorize]
public class VisitsController(
    IVisitService visitService,
    IStudentService studentService,
    IStaffService staffService) : ControllerBase
{
    private Guid CurrentApplicationUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsStaff() => AppRoles.Staff.Any(User.IsInRole);

    [HttpPost("api/students/{studentId:guid}/check-in")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<VisitDto>> CheckIn(
        Guid studentId, CheckInRequest request, CancellationToken cancellationToken)
    {
        var visit = await visitService.CheckInAsync(studentId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = visit.Id }, visit);
    }

    /// <summary>
    /// Staff-only: the live board for one stage. A doctor (not also Admin) only
    /// ever sees their own patients — Pharmacy/Lab/Admin see everything at that
    /// stage, since pharmacy and lab each run off one shared account.
    /// </summary>
    [HttpGet("api/visits/queue")]
    public async Task<ActionResult<IReadOnlyList<VisitDto>>> GetQueue(
        [FromQuery] QueueStage stage, CancellationToken cancellationToken)
    {
        if (!IsStaff())
        {
            return Forbid();
        }

        Guid? assignedStaffId = null;
        if (stage == QueueStage.Doctor && User.IsInRole(AppRoles.Doctor) && !User.IsInRole(AppRoles.Admin))
        {
            var staff = await staffService.GetByApplicationUserIdAsync(CurrentApplicationUserId, cancellationToken);
            assignedStaffId = staff?.Id;
        }

        return Ok(await visitService.GetQueueAsync(stage, assignedStaffId, cancellationToken));
    }

    [HttpGet("api/visits/{id:guid}")]
    public async Task<ActionResult<VisitDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var visit = await visitService.GetByIdAsync(id, cancellationToken);
        if (visit is null)
        {
            return NotFound();
        }

        if (!IsStaff() &&
            !await studentService.IsOwnedByApplicationUserAsync(visit.StudentId, CurrentApplicationUserId, cancellationToken))
        {
            return Forbid();
        }

        return Ok(visit);
    }

    /// <summary>The role that owns a stage may call its own visit; Admin may call any.</summary>
    [HttpPost("api/visits/{id:guid}/call")]
    public async Task<ActionResult<VisitDto>> Call(Guid id, CancellationToken cancellationToken)
    {
        var visit = await visitService.GetByIdAsync(id, cancellationToken);
        if (visit is null)
        {
            return NotFound();
        }

        if (!CanActOnStage(visit.Stage))
        {
            return Forbid();
        }

        return Ok(await visitService.CallAsync(id, cancellationToken));
    }

    [HttpPost("api/visits/{id:guid}/abandon")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<VisitDto>> Abandon(Guid id, CancellationToken cancellationToken) =>
        Ok(await visitService.AbandonAsync(id, cancellationToken));

    private bool CanActOnStage(QueueStage stage)
    {
        if (User.IsInRole(AppRoles.Admin)) return true;

        return stage switch
        {
            QueueStage.Doctor => User.IsInRole(AppRoles.Doctor),
            QueueStage.Laboratory => User.IsInRole(AppRoles.LabStaff),
            QueueStage.Pharmacy => User.IsInRole(AppRoles.PharmacyStaff),
            _ => false,
        };
    }
}
