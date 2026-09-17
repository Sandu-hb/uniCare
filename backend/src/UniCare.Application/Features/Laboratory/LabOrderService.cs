using Microsoft.EntityFrameworkCore;
using UniCare.Application.Abstractions;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.Laboratory.Dtos;
using UniCare.Application.Features.Visits;
using UniCare.Domain.Entities;
using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Laboratory;

/// <summary>
/// The lab's side of a simple handoff: no test catalogue, no structured
/// per-test results — just what the doctor asked for and a free-text
/// response. Completing an order routes the visit onward via VisitService.
/// </summary>
public class LabOrderService(IApplicationDbContext db, IVisitService visitService) : ILabOrderService
{
    public async Task<IReadOnlyList<LabOrderDto>> GetQueueAsync(CancellationToken cancellationToken = default) =>
        await db.LabOrders
            .AsNoTracking()
            .Where(o => o.Status == LabOrderStatus.Requested)
            .OrderBy(o => o.RequestedAt)
            .Select(LabOrderMappings.Projection)
            .ToListAsync(cancellationToken);

    public async Task<LabOrderDto?> GetByVisitIdAsync(
        Guid visitId, CancellationToken cancellationToken = default) =>
        await db.LabOrders
            .AsNoTracking()
            .Where(o => o.MedicalVisitId == visitId)
            .Select(LabOrderMappings.Projection)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<LabOrderDto> CompleteAsync(
        Guid visitId, CompleteLabOrderRequest request, CancellationToken cancellationToken = default)
    {
        var order = await db.LabOrders.FirstOrDefaultAsync(o => o.MedicalVisitId == visitId, cancellationToken)
            ?? throw new NotFoundException(nameof(LabOrder), visitId);

        if (order.Status == LabOrderStatus.Completed)
        {
            throw new ConflictException("This lab order has already been completed.");
        }

        order.Status = LabOrderStatus.Completed;
        order.ResultNotes = string.IsNullOrWhiteSpace(request.ResultNotes) ? null : request.ResultNotes.Trim();
        order.CompletedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        await visitService.RouteNextStageAsync(visitId, cancellationToken);

        return await GetByVisitIdAsync(visitId, cancellationToken)
            ?? throw new NotFoundException(nameof(LabOrder), visitId);
    }
}
