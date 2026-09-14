using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Visits.Dtos;

public record VisitDto
{
    public required Guid Id { get; init; }
    public required Guid StudentId { get; init; }
    public required string StudentName { get; init; }
    public Guid? AppointmentId { get; init; }

    public required DateTimeOffset CheckedInAt { get; init; }
    public DateTimeOffset? CompletedAt { get; init; }
    public required VisitStatus Status { get; init; }
    public required bool IsEmergency { get; init; }

    public required int QueueNumber { get; init; }
    public required QueueStage Stage { get; init; }
    public DateTimeOffset? CalledAt { get; init; }

    /// <summary>
    /// Whether the clinical record for each stage exists yet. The queue board
    /// uses these to show what still needs doing before this visit can advance —
    /// VisitService enforces the same rule server-side.
    /// </summary>
    public required bool HasVitalSign { get; init; }
    public required bool HasConsultation { get; init; }
}
