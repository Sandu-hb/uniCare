using Microsoft.EntityFrameworkCore;
using UniCare.Application.Abstractions;
using UniCare.Application.Contracts;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.Students.Dtos;
using UniCare.Domain.Entities;

namespace UniCare.Application.Features.Students;

/// <summary>
/// Student registration and lookup. Knows nothing about HTTP — it throws domain
/// exceptions and middleware turns those into status codes.
/// </summary>
public class StudentService(IApplicationDbContext db) : IStudentService
{
    public async Task<StudentDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await db.Students
            .AsNoTracking()
            .Where(s => s.Id == id)
            .Select(StudentMappings.Projection)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<PagedResult<StudentDto>> SearchAsync(
        string? searchTerm, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        // Clamp rather than trust: page=0 breaks Skip, pageSize=100000 is a denial of service.
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Students.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            // Provider-agnostic case-insensitive match: EF translates this to
            // LOWER(column) LIKE '%term%'. ILIKE would be faster but is Npgsql-only,
            // and Application must not know which database it is talking to.
            var term = searchTerm.Trim().ToLowerInvariant();
            query = query.Where(s =>
                s.FullName.ToLower().Contains(term) ||
                s.RegistrationNumber.ToLower().Contains(term));

        }

        // Count before paging, on the filtered query — two round trips, but the
        // alternative is loading every row to count them.
        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(s => s.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(StudentMappings.Projection)
            .ToListAsync(cancellationToken);

        return new PagedResult<StudentDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<StudentDto> CreateAsync(
        CreateStudentRequest request, CancellationToken cancellationToken = default)
    {
        var registrationNumber = request.RegistrationNumber.Trim();

        // Check first so the caller gets a clear 409. The unique index still backs this
        // up — two simultaneous requests could both pass this check — but relying on the
        // index alone means catching DbUpdateException and guessing which constraint fired.
        var exists = await db.Students
            .AnyAsync(s => s.RegistrationNumber == registrationNumber, cancellationToken);

        if (exists)
        {
            throw new ConflictException(
                $"A student with registration number '{registrationNumber}' already exists.");
        }

        var student = new Student
        {
            RegistrationNumber = registrationNumber,
            FullName = request.FullName.Trim(),
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            Faculty = request.Faculty.Trim(),
            Department = request.Department.Trim(),
            AcademicYear = request.AcademicYear,
            ContactNumber = request.ContactNumber?.Trim(),
            Email = request.Email.Trim(),
            Address = request.Address?.Trim(),
            EmergencyContactName = request.EmergencyContactName?.Trim(),
            EmergencyContactNumber = request.EmergencyContactNumber?.Trim(),
        };

        db.Students.Add(student);
        await db.SaveChangesAsync(cancellationToken);

        return student.ToDto();
    }

    public async Task<StudentDto> UpdateAsync(
        Guid id, UpdateStudentRequest request, CancellationToken cancellationToken = default)
    {
        // Tracked on purpose — EF must detect the changes in order to save them.
        var student = await db.Students
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(Student), id);

        student.FullName = request.FullName.Trim();
        student.Faculty = request.Faculty.Trim();
        student.Department = request.Department.Trim();
        student.AcademicYear = request.AcademicYear;
        student.ContactNumber = request.ContactNumber?.Trim();
        student.Email = request.Email.Trim();
        student.Address = request.Address?.Trim();
        student.EmergencyContactName = request.EmergencyContactName?.Trim();
        student.EmergencyContactNumber = request.EmergencyContactNumber?.Trim();

        await db.SaveChangesAsync(cancellationToken);

        return student.ToDto();
    }
}
