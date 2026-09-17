using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Pharmacy.Dtos;

public record PharmacyPrescriptionItemDto
{
    public required string MedicineName { get; init; }
    public required string Dosage { get; init; }
    public required string Frequency { get; init; }
    public required int DurationDays { get; init; }
    public required int Quantity { get; init; }
    public string? Instructions { get; init; }
}

public record PharmacyPrescriptionDto
{
    public required Guid Id { get; init; }
    public required Guid MedicalVisitId { get; init; }
    public required Guid StudentId { get; init; }
    public required string StudentName { get; init; }

    public required PrescriptionStatus Status { get; init; }
    public required DateTimeOffset IssuedAt { get; init; }
    public string? Notes { get; init; }
    public required IReadOnlyList<PharmacyPrescriptionItemDto> Items { get; init; }
}
