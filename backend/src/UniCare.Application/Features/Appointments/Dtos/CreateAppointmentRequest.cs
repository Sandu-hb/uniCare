namespace UniCare.Application.Features.Appointments.Dtos;

public record CreateAppointmentRequest
{
    public required DateOnly ScheduledDate { get; init; }
    public required TimeOnly ScheduledTime { get; init; }
    public string? Reason { get; init; }
}
