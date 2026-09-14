using FluentValidation;
using UniCare.Application.Features.Vitals.Dtos;

namespace UniCare.Application.Features.Vitals.Validators;

/// <summary>
/// Bounds are deliberately wide — they exist to catch a slipped decimal point or
/// a reading typed into the wrong box, not to second-guess a clinician.
/// </summary>
public class UpsertVitalSignRequestValidator : AbstractValidator<UpsertVitalSignRequest>
{
    public UpsertVitalSignRequestValidator()
    {
        RuleFor(x => x.TemperatureCelsius)
            .InclusiveBetween(30m, 45m)
            .When(x => x.TemperatureCelsius.HasValue)
            .WithMessage("Temperature must be between 30 and 45 °C.");

        RuleFor(x => x.SystolicBp)
            .InclusiveBetween(60, 250)
            .When(x => x.SystolicBp.HasValue)
            .WithMessage("Systolic pressure must be between 60 and 250.");

        RuleFor(x => x.DiastolicBp)
            .InclusiveBetween(30, 150)
            .When(x => x.DiastolicBp.HasValue)
            .WithMessage("Diastolic pressure must be between 30 and 150.");

        RuleFor(x => x.PulseBpm)
            .InclusiveBetween(30, 220)
            .When(x => x.PulseBpm.HasValue)
            .WithMessage("Pulse must be between 30 and 220 bpm.");

        RuleFor(x => x.HeightCm)
            .InclusiveBetween(50m, 250m)
            .When(x => x.HeightCm.HasValue)
            .WithMessage("Height must be between 50 and 250 cm.");

        RuleFor(x => x.WeightKg)
            .InclusiveBetween(10m, 300m)
            .When(x => x.WeightKg.HasValue)
            .WithMessage("Weight must be between 10 and 300 kg.");

        RuleFor(x => x.Observations).MaximumLength(2000);
    }
}
