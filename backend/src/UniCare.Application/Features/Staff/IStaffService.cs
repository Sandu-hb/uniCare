using UniCare.Application.Contracts;
using UniCare.Application.Features.Staff.Dtos;
using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Staff;

public interface IStaffService
{
    Task<StaffDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<PagedResult<StaffDto>> SearchAsync(
        AccountStatus? status, StaffRole? role, int page, int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>Self-service. Starts PendingApproval; an admin must Activate it.</summary>
    /// <exception cref="Exceptions.ConflictException">The email is already registered.</exception>
    Task<StaffDto> RegisterAsync(RegisterStaffRequest request, CancellationToken cancellationToken = default);

    /// <summary>Admin-created, any role. Active immediately — no approval step.</summary>
    /// <exception cref="Exceptions.ConflictException">The email is already registered.</exception>
    Task<StaffDto> CreateAsync(CreateStaffRequest request, CancellationToken cancellationToken = default);

    /// <summary>Valid from PendingApproval or Suspended only.</summary>
    Task<StaffDto> ActivateAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Valid from Active or PendingApproval only. Also revokes the refresh token.</summary>
    Task<StaffDto> SuspendAsync(Guid id, CancellationToken cancellationToken = default);
}
