using FluentValidation;
using UniCare.Application.Features.Appointments.Dtos;

namespace UniCare.Application.Features.Appointments.Validators;

public class RejectAppointmentRequestValidator : AbstractValidator<RejectAppointmentRequest>
{
    public RejectAppointmentRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("A rejection reason is required.")
            .MaximumLength(1000);
    }
}
