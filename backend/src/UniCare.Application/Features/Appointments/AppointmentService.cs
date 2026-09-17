using Microsoft.EntityFrameworkCore;
using UniCare.Application.Abstractions;
using UniCare.Application.Contracts;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.Appointments.Dtos;
using UniCare.Domain.Entities;
using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Appointments;

/// <summary>
/// Owns the appointment workflow: an admin creates an appointment already Approved
/// and staff-assigned, and it can be Cancelled from that open state. CheckedIn/Completed
/// belong to the check-in feature, not here — nothing in this service sets them.
/// </summary>
public class AppointmentService(IApplicationDbContext db) : IAppointmentService
{
    private static readonly AppointmentStatus[] OpenStates = [AppointmentStatus.Approved];

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

    public async Task<IReadOnlyList<AppointmentDto>> GetForStaffAsync(
        Guid staffId, CancellationToken cancellationToken = default) =>
        await db.Appointments
            .AsNoTracking()
            .Where(a => a.AssignedStaffId == staffId)
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

        var profileStatus = await db.MedicalProfiles
            .Where(p => p.StudentId == studentId)
            .Select(p => (VerificationStatus?)p.Status)
            .FirstOrDefaultAsync(cancellationToken);

        if (profileStatus != VerificationStatus.Verified)
        {
            throw new ConflictException(
                "Your medical profile must be verified before you can book an appointment.");
        }

        await EnsureAssignableStaffAsync(request.AssignedStaffId, cancellationToken);

        var appointment = new Appointment
        {
            StudentId = studentId,
            AssignedStaffId = request.AssignedStaffId,
            ScheduledDate = request.ScheduledDate,
            ScheduledTime = request.ScheduledTime,
            Reason = request.Reason?.Trim(),
            Status = AppointmentStatus.Approved,
        };

        db.Appointments.Add(appointment);
        await db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(appointment.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Appointment), appointment.Id);
    }

    public async Task<AppointmentDto> AssignStaffAsync(
        Guid id, Guid staffId, CancellationToken cancellationToken = default)
    {
        var appointment = await LoadAsync(id, cancellationToken);

        if (!OpenStates.Contains(appointment.Status))
        {
            throw new ConflictException(
                $"Only an approved appointment can have staff reassigned; this one is {appointment.Status}.");
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
                $"Only an approved appointment can be cancelled; this one is {appointment.Status}.");
        }

        appointment.Status = AppointmentStatus.Cancelled;

        await db.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException(nameof(Appointment), id);
    }

    private async Task<Appointment> LoadAsync(Guid id, CancellationToken cancellationToken) =>
        await db.Appointments.FirstOrDefaultAsync(a => a.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Appointment), id);

    private async Task EnsureAssignableStaffAsync(Guid staffId, CancellationToken cancellationToken)
    {
        var staff = await db.Staff.FirstOrDefaultAsync(s => s.Id == staffId, cancellationToken)
            ?? throw new NotFoundException(nameof(Staff), staffId);

        if (!staff.IsActive)
        {
            throw new ConflictException("Cannot assign an inactive staff member to an appointment.");
        }

        if (staff.Role is not StaffRole.Doctor)
        {
            throw new ConflictException("Appointments can only be assigned to a doctor.");
        }
    }
}
