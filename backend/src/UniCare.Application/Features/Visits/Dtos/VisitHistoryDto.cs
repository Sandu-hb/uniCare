namespace UniCare.Application.Features.Visits.Dtos;

public record VisitHistoryDiagnosisDto
{
    public required string Description { get; init; }
    public string? IcdCode { get; init; }
    public required bool IsPrimary { get; init; }
}

public record VisitHistoryPrescriptionItemDto
{
    public required string MedicineName { get; init; }
    public required string Dosage { get; init; }
    public required string Frequency { get; init; }
    public required int DurationDays { get; init; }
    public required int Quantity { get; init; }
    public string? Instructions { get; init; }
}

/// <summary>
/// A student's own read-only history of one visit — consultation, diagnoses,
/// lab result and prescription rolled into a single payload so the student
/// portal's Reports and Prescriptions pages can each render their slice of
/// it without extra round trips (and without touching the staff-only
/// Laboratory/Pharmacy endpoints, which this student cannot call).
/// </summary>
public record VisitHistoryDto
{
    public required Guid Id { get; init; }
    public required DateTimeOffset CheckedInAt { get; init; }
    public DateTimeOffset? CompletedAt { get; init; }
    public required string Status { get; init; }

    public string? DoctorName { get; init; }
    public string? Symptoms { get; init; }
    public string? ExaminationFindings { get; init; }
    public string? Treatment { get; init; }
    public string? FollowUpInstructions { get; init; }
    public IReadOnlyList<VisitHistoryDiagnosisDto> Diagnoses { get; init; } = [];

    public string? LabRequestDetails { get; init; }
    public string? LabResultNotes { get; init; }
    public string? LabStatus { get; init; }

    public string? PrescriptionStatus { get; init; }
    public IReadOnlyList<VisitHistoryPrescriptionItemDto> PrescriptionItems { get; init; } = [];
}
