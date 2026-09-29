using FluentValidation;
using UniCare.Application.Features.Auth.Dtos;

namespace UniCare.Application.Features.Auth.Validators;

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();

        // The Identity password policy (digit + upper + lower, 8+ chars — see
        // DependencyInjection.AddIdentityCore) is enforced by UserManager itself
        // when the password is actually set; this is just fast client feedback.
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8);

        RuleFor(x => x.NewPassword)
            .NotEqual(x => x.CurrentPassword)
            .WithMessage("New password must be different from the current password.");
    }
}
