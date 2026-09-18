using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Counseling.Dtos;

public record CounselingMessageDto
{
    public required Guid Id { get; init; }
    public required CounselingMessageRole Role { get; init; }
    public required string Content { get; init; }
    public required DateTimeOffset SentAt { get; init; }
}

/// <summary>List-shaped: no message bodies, cheap to return many of.</summary>
public record CounselingSessionSummaryDto
{
    public required Guid Id { get; init; }
    public required Guid StudentId { get; init; }
    public required string StudentName { get; init; }
    public required DateTimeOffset StartedAt { get; init; }
    public required DateTimeOffset LastMessageAt { get; init; }
    public required CounselingSessionStatus Status { get; init; }
    public required bool CrisisFlagged { get; init; }
}

public record CounselingSessionDto
{
    public required Guid Id { get; init; }
    public required Guid StudentId { get; init; }
    public required string StudentName { get; init; }
    public required DateTimeOffset StartedAt { get; init; }
    public required DateTimeOffset LastMessageAt { get; init; }
    public required CounselingSessionStatus Status { get; init; }
    public required bool CrisisFlagged { get; init; }
    public required IReadOnlyList<CounselingMessageDto> Messages { get; init; }
}

public record SendCounselingMessageRequest
{
    public required string Content { get; init; }
}
