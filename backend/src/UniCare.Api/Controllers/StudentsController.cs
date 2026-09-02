using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Contracts;
using UniCare.Application.Features.Students;
using UniCare.Application.Features.Students.Dtos;

namespace UniCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController(
    IStudentService studentService,
    IValidator<CreateStudentRequest> createValidator) : ControllerBase
{
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
