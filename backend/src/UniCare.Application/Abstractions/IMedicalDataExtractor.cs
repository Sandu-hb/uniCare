namespace UniCare.Application.Abstractions;

public interface IMedicalDataExtractor
{
    Task<ExtractedMedicalFields> ExtractFieldsAsync(string rawText, CancellationToken cancellationToken = default);
}

public record ExtractedField<T>(T? Value, decimal? Confidence);

public record ExtractedMedicalFields
{
    public ExtractedField<string>? BloodGroup { get; init; }
    public ExtractedField<decimal>? HeightCm { get; init; }
    public ExtractedField<decimal>? WeightKg { get; init; }
    public ExtractedField<string>? Allergies { get; init; }
    public ExtractedField<string>? ChronicConditions { get; init; }
    public ExtractedField<string>? CurrentMedications { get; init; }
    public ExtractedField<string>? EyeExamination { get; init; }
    public ExtractedField<string>? DentalExamination { get; init; }
}
