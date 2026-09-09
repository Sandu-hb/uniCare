namespace UniCare.Application.Features.Appointments.Dtos;

public record AssignAppointmentStaffRequest
{
    public required Guid StaffId { get; init; }
}
