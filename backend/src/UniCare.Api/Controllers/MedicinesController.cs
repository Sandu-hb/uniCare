using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Features.Medicines;
using UniCare.Application.Features.Medicines.Dtos;

namespace UniCare.Api.Controllers;

/// <summary>Read-only catalogue lookup — any staff member may browse it (a doctor prescribing).</summary>
[ApiController]
[Route("api/medicines")]
[Authorize]
public class MedicinesController(IMedicineService medicineService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MedicineDto>>> Search(
        [FromQuery] string? search, CancellationToken cancellationToken) =>
        Ok(await medicineService.SearchAsync(search, cancellationToken));
}
