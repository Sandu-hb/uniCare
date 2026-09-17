namespace UniCare.Application.Features.Consultations.Dtos;

public record DiagnosisDto
{
    public required Guid Id { get; init; }
    public required string Description { get; init; }
    public string? IcdCode { get; init; }
    public required bool IsPrimary { get; init; }
}

public record PrescriptionItemDto
{
    public required Guid MedicineId { get; init; }
    public required string MedicineName { get; init; }
    public required string Dosage { get; init; }
    public required string Frequency { get; init; }
    public required int DurationDays { get; init; }
    public required int Quantity { get; init; }
    public string? Instructions { get; init; }
}

public record ConsultationDto
{
    public required Guid Id { get; init; }
    public required Guid MedicalVisitId { get; init; }
    public required Guid DoctorStaffId { get; init; }
    public required string DoctorStaffName { get; init; }

    public string? Symptoms { get; init; }
    public string? ExaminationFindings { get; init; }
    public string? Treatment { get; init; }
    public string? FollowUpInstructions { get; init; }

    public required DateTimeOffset ConsultedAt { get; init; }
    public required IReadOnlyList<DiagnosisDto> Diagnoses { get; init; }
    public required IReadOnlyList<PrescriptionItemDto> PrescriptionItems { get; init; }
    public string? LabRequestDetails { get; init; }
}
