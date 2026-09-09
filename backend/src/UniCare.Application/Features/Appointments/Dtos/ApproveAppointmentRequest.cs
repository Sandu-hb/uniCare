namespace UniCare.Application.Features.Appointments.Dtos;

/// <summary>AssignedStaffId is optional — an admin may approve first and assign a doctor later.</summary>
public record ApproveAppointmentRequest
{
    public Guid? AssignedStaffId { get; init; }
}
