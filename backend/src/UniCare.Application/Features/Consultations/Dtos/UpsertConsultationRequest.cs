namespace UniCare.Application.Features.Consultations.Dtos;

public record DiagnosisInput
{
    public required string Description { get; init; }
    public string? IcdCode { get; init; }
    public bool IsPrimary { get; init; }
}

public record PrescriptionItemInput
{
    public required Guid MedicineId { get; init; }
    public required string Dosage { get; init; }
    public required string Frequency { get; init; }
    public int DurationDays { get; init; }
    public int Quantity { get; init; }
    public string? Instructions { get; init; }
}

/// <summary>
/// Diagnoses and prescription items are replaced wholesale on every save rather
/// than patched one by one — a consultation carries at most a handful of each,
/// and replace-all keeps the doctor's form a single honest submission instead
/// of a sync problem. PrescriptionItems empty means no prescription; null/empty
/// LabRequestDetails means no lab order — either or both routes the visit
/// onward once this is saved (see VisitService.RouteNextStageAsync).
/// </summary>
public record UpsertConsultationRequest
{
    public string? Symptoms { get; init; }
    public string? ExaminationFindings { get; init; }
    public string? Treatment { get; init; }
    public string? FollowUpInstructions { get; init; }
    public IReadOnlyList<DiagnosisInput> Diagnoses { get; init; } = [];
    public IReadOnlyList<PrescriptionItemInput> PrescriptionItems { get; init; } = [];
    public string? LabRequestDetails { get; init; }
}
