using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Contracts;
using UniCare.Application.Features.Auth.Dtos;
using UniCare.Application.Features.Students;
using UniCare.Application.Features.Students.Dtos;
using UniCare.Domain.Constants;
using UniCare.Domain.Enums;

namespace UniCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController(
    IStudentService studentService,
    IStudentAccountService studentAccountService,
    IValidator<CreateStudentRequest> createValidator,
    IValidator<RegisterStudentRequest> registerValidator) : ControllerBase
{
    /// <summary>
    /// Creates the account and logs it straight in — see IStudentAccountService
    /// for why a PendingApproval account can safely do that. 200, not 201: the
    /// response is a session (matches AuthController.Login), not a resource with
    /// a Location a self-registering caller could even necessarily fetch.
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterStudentRequest request, CancellationToken cancellationToken)
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

        return Ok(await studentAccountService.RegisterAsync(request, cancellationToken));
    }

    [HttpPost("{id:guid}/activate")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<StudentAccountDto>> Activate(Guid id, CancellationToken cancellationToken) =>
        Ok(await studentAccountService.ActivateAsync(id, cancellationToken));

    [HttpPost("{id:guid}/suspend")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<StudentAccountDto>> Suspend(Guid id, CancellationToken cancellationToken) =>
        Ok(await studentAccountService.SuspendAsync(id, cancellationToken));

    /// <summary>Staff-only: student records with their account status. Activate/Suspend stay Admin-only.</summary>
    [HttpGet("accounts")]
    [Authorize]
    public async Task<ActionResult<PagedResult<StudentAccountDto>>> SearchAccounts(
        [FromQuery] AccountStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (!AppRoles.Staff.Any(User.IsInRole))
        {
            return Forbid();
        }

        return Ok(await studentAccountService.SearchAsync(status, search, page, pageSize, cancellationToken));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<StudentDto>> GetMe(CancellationToken cancellationToken)
    {
        var applicationUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var student = await studentService.GetByApplicationUserIdAsync(applicationUserId, cancellationToken);
        return student is null ? NotFound() : Ok(student);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<StudentDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var student = await studentService.GetByIdAsync(id, cancellationToken);
        return student is null ? NotFound() : Ok(student);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<StudentDto>>> Search(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        return Ok(await studentService.SearchAsync(search, page, pageSize, cancellationToken));
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<StudentDto>> Create(
        CreateStudentRequest request, CancellationToken cancellationToken)
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

        var created = await studentService.CreateAsync(request, cancellationToken);

        // 201 with a Location header pointing at the new resource — the correct
        // REST response for a create, and it saves the client a guess.
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<StudentDto>> Update(
        Guid id, UpdateStudentRequest request, CancellationToken cancellationToken)
    {
        // TODO: no UpdateStudentRequestValidator exists yet — this endpoint currently
        // accepts anything the type allows. Write one before this ships.
        var updated = await studentService.UpdateAsync(id, request, cancellationToken);
        return Ok(updated);
    }
}
