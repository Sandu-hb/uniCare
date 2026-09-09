using FluentValidation;
using UniCare.Application.Features.Staff.Dtos;

namespace UniCare.Application.Features.Staff.Validators;

public class CreateStaffRequestValidator : AbstractValidator<CreateStaffRequest>
{
    public CreateStaffRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Role).IsInEnum();

        RuleFor(x => x.Specialization).MaximumLength(256);
        RuleFor(x => x.LicenseNumber).MaximumLength(256);
        RuleFor(x => x.ContactNumber).MaximumLength(32);
    }
}
