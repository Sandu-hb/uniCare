namespace UniCare.Application.Features.Vitals.Dtos;

public record VitalSignDto
{
    public required Guid Id { get; init; }
    public required Guid MedicalVisitId { get; init; }
    public required Guid RecordedByStaffId { get; init; }
    public required string RecordedByStaffName { get; init; }

    public decimal? TemperatureCelsius { get; init; }
    public int? SystolicBp { get; init; }
    public int? DiastolicBp { get; init; }
    public int? PulseBpm { get; init; }
    public decimal? HeightCm { get; init; }
    public decimal? WeightKg { get; init; }
    public string? Observations { get; init; }

    public required DateTimeOffset RecordedAt { get; init; }
}
