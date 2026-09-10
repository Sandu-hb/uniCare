using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Appointments.Dtos;

public record AppointmentDto
{
    public required Guid Id { get; init; }
    public required Guid StudentId { get; init; }
    public required string StudentName { get; init; }

    public Guid? AssignedStaffId { get; init; }
    public string? AssignedStaffName { get; init; }

    public required DateOnly ScheduledDate { get; init; }
    public required TimeOnly ScheduledTime { get; init; }

    public required AppointmentStatus Status { get; init; }
    public string? Reason { get; init; }
    public string? RejectionReason { get; init; }
}
