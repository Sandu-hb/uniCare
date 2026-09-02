using System.Linq.Expressions;
using UniCare.Domain.Entities;

namespace UniCare.Application.Features.Students.Dtos;

public static class StudentMappings
{
    /// <summary>
    /// An expression tree, not a method — EF Core inspects it and emits a SELECT of
    /// exactly these columns. Use inside database queries: .Select(StudentMappings.Projection)
    /// </summary>
    public static Expression<Func<Student, StudentDto>> Projection => student => new StudentDto
    {
        Id = student.Id,
        RegistrationNumber = student.RegistrationNumber,
        FullName = student.FullName,
        DateOfBirth = student.DateOfBirth,
        Gender = student.Gender,
        Faculty = student.Faculty,
        Department = student.Department,
        AcademicYear = student.AcademicYear,
        ContactNumber = student.ContactNumber,
        Email = student.Email,
        Address = student.Address,
        EmergencyContactName = student.EmergencyContactName,
        EmergencyContactNumber = student.EmergencyContactNumber,
    };

    /// <summary>
    /// For entities already in memory — after an Add, or a tracked lookup. Compiles the
    /// same expression, so the two shapes can never drift apart.
    /// </summary>
    public static StudentDto ToDto(this Student student) => Projection.Compile()(student);
}
