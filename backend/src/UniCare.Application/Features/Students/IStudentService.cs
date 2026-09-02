using UniCare.Application.Contracts;
using UniCare.Application.Features.Students.Dtos;

namespace UniCare.Application.Features.Students;

public interface IStudentService
{
    Task<StudentDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<PagedResult<StudentDto>> SearchAsync(
        string? searchTerm, int page, int pageSize, CancellationToken cancellationToken = default);

    Task<StudentDto> CreateAsync(
        CreateStudentRequest request, CancellationToken cancellationToken = default);

    Task<StudentDto> UpdateAsync(
        Guid id, UpdateStudentRequest request, CancellationToken cancellationToken = default);
}
