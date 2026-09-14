namespace UniCare.Application.Features.Consultations.Dtos;

public record DiagnosisInput
{
    public required string Description { get; init; }
    public string? IcdCode { get; init; }
    public bool IsPrimary { get; init; }
}

/// <summary>
/// Diagnoses are replaced wholesale on every save rather than patched one by
/// one — a consultation carries at most a handful, and replace-all keeps the
/// doctor's form a single honest submission instead of a sync problem.
/// </summary>
public record UpsertConsultationRequest
{
    public string? Symptoms { get; init; }
    public string? ExaminationFindings { get; init; }
    public string? Treatment { get; init; }
    public string? FollowUpInstructions { get; init; }
    public IReadOnlyList<DiagnosisInput> Diagnoses { get; init; } = [];
}
