using FluentValidation;
using UniCare.Application.Features.Appointments.Dtos;

namespace UniCare.Application.Features.Appointments.Validators;

public class CreateAppointmentRequestValidator : AbstractValidator<CreateAppointmentRequest>
{
    public CreateAppointmentRequestValidator()
    {
        RuleFor(x => x.ScheduledDate)
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("The appointment date cannot be in the past.");

        RuleFor(x => x.Reason).MaximumLength(1000);
    }
}
