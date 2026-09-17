using FluentValidation;
using UniCare.Application.Features.Appointments.Dtos;

namespace UniCare.Application.Features.Appointments.Validators;

public class CreateAppointmentRequestValidator : AbstractValidator<CreateAppointmentRequest>
{
    private static readonly TimeOnly MorningStart = new(8, 0);
    private static readonly TimeOnly MorningEnd = new(12, 30);
    private static readonly TimeOnly AfternoonStart = new(13, 0);
    private static readonly TimeOnly AfternoonEnd = new(17, 0);

    public CreateAppointmentRequestValidator()
    {
        RuleFor(x => x.AssignedStaffId).NotEmpty();

        RuleFor(x => x.ScheduledDate)
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("The appointment date cannot be in the past.")
            .Must(d => d.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday))
            .WithMessage("The medical centre is closed on weekends.");

        RuleFor(x => x.ScheduledTime)
            .Must(IsWithinBusinessHours)
            .WithMessage("Appointments can only be scheduled between 8:00 AM–12:30 PM or 1:00 PM–5:00 PM.");

        RuleFor(x => x.Reason).MaximumLength(1000);
    }

    private static bool IsWithinBusinessHours(TimeOnly time) =>
        (time >= MorningStart && time <= MorningEnd) ||
        (time >= AfternoonStart && time <= AfternoonEnd);
}
