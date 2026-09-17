using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Features.Pharmacy;
using UniCare.Application.Features.Pharmacy.Dtos;
using UniCare.Domain.Constants;

namespace UniCare.Api.Controllers;

/// <summary>The pharmacy's live queue: what's been prescribed, and dispensing it.</summary>
[ApiController]
[Route("api/pharmacy")]
[Authorize(Roles = $"{AppRoles.PharmacyStaff},{AppRoles.Admin}")]
public class PharmacyController(IPharmacyService pharmacyService) : ControllerBase
{
    [HttpGet("queue")]
    public async Task<ActionResult<IReadOnlyList<PharmacyPrescriptionDto>>> GetQueue(
        CancellationToken cancellationToken) =>
        Ok(await pharmacyService.GetQueueAsync(cancellationToken));

    [HttpGet("prescriptions/{visitId:guid}")]
    public async Task<ActionResult<PharmacyPrescriptionDto>> GetByVisit(
        Guid visitId, CancellationToken cancellationToken)
    {
        var prescription = await pharmacyService.GetByVisitIdAsync(visitId, cancellationToken);
        return prescription is null ? NotFound() : Ok(prescription);
    }

    [HttpPost("prescriptions/{visitId:guid}/dispense")]
    public async Task<ActionResult<PharmacyPrescriptionDto>> Dispense(
        Guid visitId, CancellationToken cancellationToken) =>
        Ok(await pharmacyService.DispenseAsync(visitId, cancellationToken));
}
