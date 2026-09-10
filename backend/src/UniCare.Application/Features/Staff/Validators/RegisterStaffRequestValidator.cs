using FluentValidation;
using UniCare.Application.Features.Staff.Dtos;
using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Staff.Validators;

public class RegisterStaffRequestValidator : AbstractValidator<RegisterStaffRequest>
{
    // Admin and SystemAdmin are deliberately excluded — a self-registering caller
    // must never be able to grant themselves administrative access. Only an
    // existing admin can create an account with one of those two roles, via
    // CreateStaffRequest instead.
    private static readonly StaffRole[] SelfRegisterableRoles =
        [StaffRole.Doctor, StaffRole.Nurse, StaffRole.Dentist, StaffRole.LabStaff, StaffRole.PharmacyStaff];

    public RegisterStaffRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(256);

        RuleFor(x => x.Role)
            .Must(role => SelfRegisterableRoles.Contains(role))
            .WithMessage("Self-registration is not available for this role.");

        RuleFor(x => x.Specialization).MaximumLength(256);
        RuleFor(x => x.LicenseNumber).MaximumLength(256);
        RuleFor(x => x.ContactNumber).MaximumLength(32);
    }
}
