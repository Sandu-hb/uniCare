using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Contracts;
using UniCare.Application.Features.Staff;
using UniCare.Application.Features.Staff.Dtos;
using UniCare.Domain.Constants;
using UniCare.Domain.Enums;

namespace UniCare.Api.Controllers;

/// <summary>
/// Staff account administration. Registration is public (any non-admin role,
/// starts PendingApproval); everything else — listing, direct creation,
/// activation, suspension — is Admin-only.
/// </summary>
[ApiController]
[Route("api/staff")]
[Authorize(Roles = AppRoles.Admin)]
public class StaffController(
    IStaffService staffService,
    IValidator<RegisterStaffRequest> registerValidator,
    IValidator<CreateStaffRequest> createValidator) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<StaffDto>> Register(
        RegisterStaffRequest request, CancellationToken cancellationToken)
    {
        var validation = await registerValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        var created = await staffService.RegisterAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost]
    public async Task<ActionResult<StaffDto>> Create(
        CreateStaffRequest request, CancellationToken cancellationToken)
    {
        var validation = await createValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        var created = await staffService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<StaffDto>>> Search(
        [FromQuery] AccountStatus? status,
        [FromQuery] StaffRole? role,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        return Ok(await staffService.SearchAsync(status, role, page, pageSize, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<StaffDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var staff = await staffService.GetByIdAsync(id, cancellationToken);
        return staff is null ? NotFound() : Ok(staff);
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<ActionResult<StaffDto>> Activate(Guid id, CancellationToken cancellationToken) =>
        Ok(await staffService.ActivateAsync(id, cancellationToken));

    [HttpPost("{id:guid}/suspend")]
    public async Task<ActionResult<StaffDto>> Suspend(Guid id, CancellationToken cancellationToken) =>
        Ok(await staffService.SuspendAsync(id, cancellationToken));
}
