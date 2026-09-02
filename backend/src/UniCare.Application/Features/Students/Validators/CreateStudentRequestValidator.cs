using FluentValidation;
using UniCare.Application.Features.Students.Dtos;

namespace UniCare.Application.Features.Students.Validators;

public class CreateStudentRequestValidator : AbstractValidator<CreateStudentRequest>
{
    public CreateStudentRequestValidator()
    {
        RuleFor(x => x.RegistrationNumber)
            .NotEmpty()
            .MaximumLength(32)
            .Matches("^[A-Za-z0-9/-]+$")
            .WithMessage("Registration number may contain only letters, digits, hyphens and slashes.");

        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(256);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.Faculty).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Department).NotEmpty().MaximumLength(256);

        RuleFor(x => x.AcademicYear)
            .InclusiveBetween(1, 6)
            .WithMessage("Academic year must be between 1 and 6.");

        // A date of birth in the future is a data-entry error; the lower bound
        // catches typos like 1023 without rejecting genuine mature students.
        RuleFor(x => x.DateOfBirth)
            .Must(BeAPlausibleDateOfBirth)
            .WithMessage("Date of birth must give an age between 15 and 70.");

        RuleFor(x => x.Gender).IsInEnum();

        // Optional fields: only validated when supplied.
        RuleFor(x => x.ContactNumber)
            .MaximumLength(32)
            .Matches(@"^[0-9+\-\s()]+$")
            .When(x => !string.IsNullOrWhiteSpace(x.ContactNumber))
            .WithMessage("Contact number may contain only digits and + - ( ) characters.");

        RuleFor(x => x.Address).MaximumLength(512);
        RuleFor(x => x.EmergencyContactName).MaximumLength(256);

        RuleFor(x => x.EmergencyContactNumber)
            .MaximumLength(32)
            .Matches(@"^[0-9+\-\s()]+$")
            .When(x => !string.IsNullOrWhiteSpace(x.EmergencyContactNumber));
    }

    private static bool BeAPlausibleDateOfBirth(DateOnly dateOfBirth)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (dateOfBirth >= today) return false;

        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth > today.AddYears(-age)) age--;   // birthday not yet reached this year

        return age is >= 15 and <= 70;
    }
}
