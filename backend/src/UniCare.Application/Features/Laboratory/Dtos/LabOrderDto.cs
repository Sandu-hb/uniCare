using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Laboratory.Dtos;

public record LabOrderDto
{
    public required Guid Id { get; init; }
    public required Guid MedicalVisitId { get; init; }
    public required Guid StudentId { get; init; }
    public required string StudentName { get; init; }

    public required string RequestDetails { get; init; }
    public required LabOrderStatus Status { get; init; }
    public string? ResultNotes { get; init; }

    public required DateTimeOffset RequestedAt { get; init; }
    public DateTimeOffset? CompletedAt { get; init; }
}
