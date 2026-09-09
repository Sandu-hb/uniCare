using Microsoft.EntityFrameworkCore;
using UniCare.Application.Abstractions;
using UniCare.Application.Contracts;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.Appointments.Dtos;
using UniCare.Domain.Entities;
using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Appointments;

/// <summary>
/// Owns the appointment workflow: Requested → Approved or Rejected, and Cancelled
/// from either open state. CheckedIn/Completed belong to the check-in feature,
/// not here — nothing in this service sets them.
/// </summary>
public class AppointmentService(IApplicationDbContext db) : IAppointmentService
{
    private static readonly AppointmentStatus[] OpenStates =
        [AppointmentStatus.Requested, AppointmentStatus.Approved];

    public async Task<AppointmentDto?> GetByIdAsync(
        Guid id, CancellationToken cancellationToken = default) =>
        await db.Appointments
            .AsNoTracking()
            .Where(a => a.Id == id)
            .Select(AppointmentMappings.Projection)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<AppointmentDto>> GetForStudentAsync(
        Guid studentId, CancellationToken cancellationToken = default) =>
        await db.Appointments
            .AsNoTracking()
            .Where(a => a.StudentId == studentId)
            .OrderByDescending(a => a.ScheduledDate)
            .ThenByDescending(a => a.ScheduledTime)
            .Select(AppointmentMappings.Projection)
            .ToListAsync(cancellationToken);

    public async Task<PagedResult<AppointmentDto>> SearchAsync(
        DateOnly? date, AppointmentStatus? status, int page, int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = db.Appointments.AsNoTracking().AsQueryable();

        if (date.HasValue)
        {
            query = query.Where(a => a.ScheduledDate == date.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(a => a.Status == status.Value);
        }

        query = query.OrderBy(a => a.ScheduledDate).ThenBy(a => a.ScheduledTime);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(AppointmentMappings.Projection)
            .ToListAsync(cancellationToken);

        return new PagedResult<AppointmentDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<AppointmentDto> CreateAsync(
        Guid studentId, CreateAppointmentRequest request, CancellationToken cancellationToken = default)
    {
        var studentExists = await db.Students.AnyAsync(s => s.Id == studentId, cancellationToken);
        if (!studentExists)
        {
            throw new NotFoundException(nameof(Student), studentId);
        }

        var appointment = new Appointment
        {
            StudentId = studentId,
            ScheduledDate = request.ScheduledDate,
            ScheduledTime = request.ScheduledTime,
            Reason = request.Reason?.Trim(),
        };

        db.Appointments.Add(appointment);
        await db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(appointment.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Appointment), appointment.Id);
    }

    public async Task<AppointmentDto> ApproveAsync(
        Guid id, ApproveAppointmentRequest request, CancellationToken cancellationToken = default)
    {
        var appointment = await LoadAsync(id, cancellationToken);
        EnsureRequested(appointment);

        if (request.AssignedStaffId.HasValue)
        {
            await EnsureAssignableStaffAsync(request.AssignedStaffId.Value, cancellationToken);
            appointment.AssignedStaffId = request.AssignedStaffId;
        }

        appointment.Status = AppointmentStatus.Approved;
        appointment.RejectionReason = null;

        await db.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException(nameof(Appointment), id);
    }

    public async Task<AppointmentDto> RejectAsync(
        Guid id, string reason, CancellationToken cancellationToken = default)
    {
        var appointment = await LoadAsync(id, cancellationToken);
        EnsureRequested(appointment);

        appointment.Status = AppointmentStatus.Rejected;
        appointment.RejectionReason = reason.Trim();

        await db.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException(nameof(Appointment), id);
    }

    public async Task<AppointmentDto> AssignStaffAsync(
        Guid id, Guid staffId, CancellationToken cancellationToken = default)
    {
        var appointment = await LoadAsync(id, cancellationToken);

        if (!OpenStates.Contains(appointment.Status))
        {
            throw new ConflictException(
                $"Only a requested or approved appointment can have staff assigned; this one is {appointment.Status}.");
        }

        await EnsureAssignableStaffAsync(staffId, cancellationToken);
        appointment.AssignedStaffId = staffId;

        await db.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException(nameof(Appointment), id);
    }

    public async Task<AppointmentDto> CancelAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        var appointment = await LoadAsync(id, cancellationToken);

        if (!OpenStates.Contains(appointment.Status))
        {
            throw new ConflictException(
                $"Only a requested or approved appointment can be cancelled; this one is {appointment.Status}.");
        }

        appointment.Status = AppointmentStatus.Cancelled;

        await db.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException(nameof(Appointment), id);
    }

    private async Task<Appointment> LoadAsync(Guid id, CancellationToken cancellationToken) =>
        await db.Appointments.FirstOrDefaultAsync(a => a.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Appointment), id);

    private static void EnsureRequested(Appointment appointment)
    {
        if (appointment.Status != AppointmentStatus.Requested)
        {
            throw new ConflictException(
                $"Only a requested appointment can be approved or rejected; this one is {appointment.Status}.");
        }
    }

    private async Task EnsureAssignableStaffAsync(Guid staffId, CancellationToken cancellationToken)
    {
        var staff = await db.Staff.FirstOrDefaultAsync(s => s.Id == staffId, cancellationToken)
            ?? throw new NotFoundException(nameof(Staff), staffId);

        if (!staff.IsActive)
        {
            throw new ConflictException("Cannot assign an inactive staff member to an appointment.");
        }
    }
}
