using FluentValidation;
using UniCare.Application.Features.Auth.Dtos;
using UniCare.Domain.Constants;

namespace UniCare.Application.Features.Auth.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .Must(UniversityEmail.IsValid)
            .WithMessage($"Use your @{UniversityEmail.Domain} email address.");

        RuleFor(x => x.Password).NotEmpty();
    }
}
