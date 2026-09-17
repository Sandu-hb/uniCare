using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Features.Laboratory;
using UniCare.Application.Features.Laboratory.Dtos;
using UniCare.Domain.Constants;

namespace UniCare.Api.Controllers;

/// <summary>The lab's live queue: what's been requested, and marking it done.</summary>
[ApiController]
[Route("api/laboratory")]
[Authorize(Roles = $"{AppRoles.LabStaff},{AppRoles.Admin}")]
public class LaboratoryController(ILabOrderService labOrderService) : ControllerBase
{
    [HttpGet("queue")]
    public async Task<ActionResult<IReadOnlyList<LabOrderDto>>> GetQueue(CancellationToken cancellationToken) =>
        Ok(await labOrderService.GetQueueAsync(cancellationToken));

    [HttpGet("orders/{visitId:guid}")]
    public async Task<ActionResult<LabOrderDto>> GetByVisit(Guid visitId, CancellationToken cancellationToken)
    {
        var order = await labOrderService.GetByVisitIdAsync(visitId, cancellationToken);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpPost("orders/{visitId:guid}/complete")]
    public async Task<ActionResult<LabOrderDto>> Complete(
        Guid visitId, CompleteLabOrderRequest request, CancellationToken cancellationToken) =>
        Ok(await labOrderService.CompleteAsync(visitId, request, cancellationToken));
}
