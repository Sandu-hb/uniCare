using System.Linq.Expressions;
using UniCare.Domain.Entities;

namespace UniCare.Application.Features.Appointments.Dtos;

public static class AppointmentMappings
{
    public static Expression<Func<Appointment, AppointmentDto>> Projection =>
        appointment => new AppointmentDto
        {
            Id = appointment.Id,
            StudentId = appointment.StudentId,
            StudentName = appointment.Student.FullName,
            AssignedStaffId = appointment.AssignedStaffId,
            AssignedStaffName = appointment.AssignedStaff == null ? null : appointment.AssignedStaff.FullName,
            ScheduledDate = appointment.ScheduledDate,
            ScheduledTime = appointment.ScheduledTime,
            Status = appointment.Status,
            Reason = appointment.Reason,
            RejectionReason = appointment.RejectionReason,
        };

    public static AppointmentDto ToDto(this Appointment appointment) =>
        Projection.Compile()(appointment);
}
