using UniCare.Application.Contracts;
using UniCare.Application.Features.Appointments.Dtos;
using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Appointments;

public interface IAppointmentService
{
    Task<AppointmentDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AppointmentDto>> GetForStudentAsync(
        Guid studentId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AppointmentDto>> GetForStaffAsync(
        Guid staffId, CancellationToken cancellationToken = default);

    Task<PagedResult<AppointmentDto>> SearchAsync(
        DateOnly? date, AppointmentStatus? status, int page, int pageSize,
        CancellationToken cancellationToken = default);

    Task<AppointmentDto> CreateAsync(
        Guid studentId, CreateAppointmentRequest request, CancellationToken cancellationToken = default);

    Task<AppointmentDto> AssignStaffAsync(
        Guid id, Guid staffId, CancellationToken cancellationToken = default);

    Task<AppointmentDto> CancelAsync(Guid id, CancellationToken cancellationToken = default);
}
