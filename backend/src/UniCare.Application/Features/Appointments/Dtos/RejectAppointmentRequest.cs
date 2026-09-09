namespace UniCare.Application.Features.Appointments.Dtos;

public record RejectAppointmentRequest
{
    public required string Reason { get; init; }
}
