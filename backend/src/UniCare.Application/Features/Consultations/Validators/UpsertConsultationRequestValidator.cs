using FluentValidation;
using UniCare.Application.Features.Consultations.Dtos;

namespace UniCare.Application.Features.Consultations.Validators;

public class UpsertConsultationRequestValidator : AbstractValidator<UpsertConsultationRequest>
{
    public UpsertConsultationRequestValidator()
    {
        // These map to columns configured at 2000 in ConsultationConfiguration.
        RuleFor(x => x.Symptoms).MaximumLength(2000);
        RuleFor(x => x.ExaminationFindings).MaximumLength(2000);
        RuleFor(x => x.Treatment).MaximumLength(2000);
        RuleFor(x => x.FollowUpInstructions).MaximumLength(2000);

        RuleForEach(x => x.Diagnoses).ChildRules(diagnosis =>
        {
            diagnosis.RuleFor(d => d.Description)
                .NotEmpty().WithMessage("A diagnosis needs a description.")
                .MaximumLength(256);

            diagnosis.RuleFor(d => d.IcdCode).MaximumLength(16);
        });
    }
}
