using UniCare.Application.Features.Laboratory.Dtos;

namespace UniCare.Application.Features.Laboratory;

public interface ILabOrderService
{
    /// <summary>The live board: requested (not yet completed) lab orders, oldest first.</summary>
    Task<IReadOnlyList<LabOrderDto>> GetQueueAsync(CancellationToken cancellationToken = default);

    Task<LabOrderDto?> GetByVisitIdAsync(Guid visitId, CancellationToken cancellationToken = default);

    /// <exception cref="Exceptions.NotFoundException">No lab order exists for this visit.</exception>
    /// <exception cref="Exceptions.ConflictException">The order is already Completed.</exception>
    Task<LabOrderDto> CompleteAsync(
        Guid visitId, CompleteLabOrderRequest request, CancellationToken cancellationToken = default);
}
