using UniCare.Domain.Entities;

namespace UniCare.Application.Features.Students.Dtos;

public static class StudentMappings
{
    /// <summary>
    /// Written as an expression so EF Core can translate it into SQL. Used with
    /// .Select(), Postgres returns only these columns instead of whole entities.
    /// </summary>
    public static StudentDto ToDto(this Student student) => new()
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
}
