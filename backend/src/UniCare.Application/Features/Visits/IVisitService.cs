using UniCare.Application.Features.Visits.Dtos;
using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Visits;

public interface IVisitService
{
    Task<VisitDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// The live board for one stage — active entries only, ordered by queue number.
    /// When assignedStaffId is given (a doctor viewing their own queue), only visits
    /// whose appointment was assigned to that staff member are included; walk-ins
    /// with no appointment never appear on a doctor-filtered board.
    /// </summary>
    Task<IReadOnlyList<VisitDto>> GetQueueAsync(
        QueueStage stage, Guid? assignedStaffId = null, CancellationToken cancellationToken = default);

    /// <exception cref="Exceptions.NotFoundException">Student, or the given appointment, does not exist.</exception>
    /// <exception cref="Exceptions.ConflictException">
    /// The student already has an open visit today, or the appointment is not an
    /// Approved appointment scheduled for today.
    /// </exception>
    Task<VisitDto> CheckInAsync(
        Guid studentId, CheckInRequest request, CancellationToken cancellationToken = default);

    /// <summary>Marks the queue entry as called. Safe to call again to re-call.</summary>
    Task<VisitDto> CallAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Routes a visit to whatever comes next, based on its current stage and
    /// whether a LabOrder/Prescription now exists for it: Doctor → Laboratory (if
    /// ordered) or Pharmacy (if prescribed) or Completed; Laboratory → Pharmacy (if
    /// prescribed) or Completed; Pharmacy → Completed. Called internally by
    /// ConsultationService, LabOrderService and PharmacyService right after their
    /// respective clinical action — never exposed as its own endpoint, since there
    /// is no longer a manual "advance" action for staff to trigger.
    /// </summary>
    Task RouteNextStageAsync(Guid medicalVisitId, CancellationToken cancellationToken = default);

    Task<VisitDto> AbandonAsync(Guid id, CancellationToken cancellationToken = default);
}
