using FluentValidation;
using UniCare.Application.Features.Counseling.Dtos;

namespace UniCare.Application.Features.Counseling.Validators;

public class SendCounselingMessageRequestValidator : AbstractValidator<SendCounselingMessageRequest>
{
    public SendCounselingMessageRequestValidator()
    {
        RuleFor(x => x.Content).NotEmpty().MaximumLength(2000);
    }
}
