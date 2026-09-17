using FluentValidation;
using UniCare.Application.Features.Students.Dtos;

namespace UniCare.Application.Features.Students.Validators;

public class UpdateStudentRequestValidator : AbstractValidator<UpdateStudentRequest>
{
    public UpdateStudentRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(256);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.Faculty).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Department).NotEmpty().MaximumLength(256);

        RuleFor(x => x.AcademicYear)
            .InclusiveBetween(1, 6)
            .WithMessage("Academic year must be between 1 and 6.");

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
}
