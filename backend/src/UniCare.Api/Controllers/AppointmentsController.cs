using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Contracts;
using UniCare.Application.Features.Appointments;
using UniCare.Application.Features.Appointments.Dtos;
using UniCare.Application.Features.Students;
using UniCare.Domain.Constants;
using UniCare.Domain.Enums;

namespace UniCare.Api.Controllers;

/// <summary>
/// Booking and scheduling lives here, split between student-scoped routes
/// (a student only ever sees their own appointments) and staff-wide routes
/// (an admin manages the whole queue, addressed by appointment id).
/// </summary>
[ApiController]
[Authorize]
public class AppointmentsController(
    IAppointmentService appointmentService,
    IStudentService studentService,
    IValidator<CreateAppointmentRequest> createValidator,
    IValidator<RejectAppointmentRequest> rejectValidator) : ControllerBase
{
    private Guid CurrentApplicationUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsStaff() => AppRoles.Staff.Any(User.IsInRole);

    [HttpPost("api/students/{studentId:guid}/appointments")]
    public async Task<ActionResult<AppointmentDto>> Create(
        Guid studentId, CreateAppointmentRequest request, CancellationToken cancellationToken)
    {
        if (!await studentService.IsOwnedByApplicationUserAsync(studentId, CurrentApplicationUserId, cancellationToken))
        {
            return Forbid();
        }

        var validation = await createValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        var created = await appointmentService.CreateAsync(studentId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Staff may view any student's appointments; a student may only view their own.</summary>
    [HttpGet("api/students/{studentId:guid}/appointments")]
    public async Task<ActionResult<IReadOnlyList<AppointmentDto>>> GetForStudent(
        Guid studentId, CancellationToken cancellationToken)
    {
        if (!IsStaff() &&
            !await studentService.IsOwnedByApplicationUserAsync(studentId, CurrentApplicationUserId, cancellationToken))
        {
            return Forbid();
        }

        return Ok(await appointmentService.GetForStudentAsync(studentId, cancellationToken));
    }

    /// <summary>Staff-only: the full queue, optionally filtered by date/status.</summary>
    [HttpGet("api/appointments")]
    public async Task<ActionResult<PagedResult<AppointmentDto>>> Search(
        [FromQuery] DateOnly? date,
        [FromQuery] AppointmentStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (!IsStaff())
        {
            return Forbid();
        }

        return Ok(await appointmentService.SearchAsync(date, status, page, pageSize, cancellationToken));
    }

    [HttpGet("api/appointments/{id:guid}")]
    public async Task<ActionResult<AppointmentDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var appointment = await appointmentService.GetByIdAsync(id, cancellationToken);
        if (appointment is null)
        {
            return NotFound();
        }

        if (!IsStaff() &&
            !await studentService.IsOwnedByApplicationUserAsync(appointment.StudentId, CurrentApplicationUserId, cancellationToken))
        {
            return Forbid();
        }

        return Ok(appointment);
    }

    [HttpPost("api/appointments/{id:guid}/approve")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<AppointmentDto>> Approve(
        Guid id, ApproveAppointmentRequest request, CancellationToken cancellationToken) =>
        Ok(await appointmentService.ApproveAsync(id, request, cancellationToken));

    [HttpPost("api/appointments/{id:guid}/reject")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<AppointmentDto>> Reject(
        Guid id, RejectAppointmentRequest request, CancellationToken cancellationToken)
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

        return Ok(await appointmentService.RejectAsync(id, request.Reason, cancellationToken));
    }

    [HttpPost("api/appointments/{id:guid}/assign")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<AppointmentDto>> AssignStaff(
        Guid id, AssignAppointmentStaffRequest request, CancellationToken cancellationToken) =>
        Ok(await appointmentService.AssignStaffAsync(id, request.StaffId, cancellationToken));

    /// <summary>Either the owning student or any staff member may cancel.</summary>
    [HttpPost("api/appointments/{id:guid}/cancel")]
    public async Task<ActionResult<AppointmentDto>> Cancel(Guid id, CancellationToken cancellationToken)
    {
        var appointment = await appointmentService.GetByIdAsync(id, cancellationToken);
        if (appointment is null)
        {
            return NotFound();
        }

        if (!IsStaff() &&
            !await studentService.IsOwnedByApplicationUserAsync(appointment.StudentId, CurrentApplicationUserId, cancellationToken))
        {
            return Forbid();
        }

        return Ok(await appointmentService.CancelAsync(id, cancellationToken));
    }
}
