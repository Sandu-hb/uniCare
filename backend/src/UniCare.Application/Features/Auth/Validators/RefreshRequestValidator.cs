using FluentValidation;
using UniCare.Application.Features.Auth.Dtos;

namespace UniCare.Application.Features.Auth.Validators;

public class RefreshRequestValidator : AbstractValidator<RefreshRequest>
{
    public RefreshRequestValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}
