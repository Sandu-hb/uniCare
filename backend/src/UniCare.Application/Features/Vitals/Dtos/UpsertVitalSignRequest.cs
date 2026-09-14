namespace UniCare.Application.Features.Vitals.Dtos;

/// <summary>
/// Every field is optional — a nurse may only take some readings. Who recorded
/// it and when are absent on purpose: both are derived server-side from the
/// caller's token, so a client cannot attribute a reading to someone else.
/// </summary>
public record UpsertVitalSignRequest
{
    public decimal? TemperatureCelsius { get; init; }
    public int? SystolicBp { get; init; }
    public int? DiastolicBp { get; init; }
    public int? PulseBpm { get; init; }
    public decimal? HeightCm { get; init; }
    public decimal? WeightKg { get; init; }
    public string? Observations { get; init; }
}
