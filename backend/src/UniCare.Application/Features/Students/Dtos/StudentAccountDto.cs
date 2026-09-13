using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Students.Dtos;

/// <summary>
/// StudentDto plus the linked sign-in account's status — for the admin
/// approval screen only. Kept separate from StudentDto so every other caller
/// (ownership checks, ordinary student lookups) keeps using the pure,
/// Identity-free IStudentService and never pays for this join.
/// </summary>
public record StudentAccountDto : StudentDto
{
    public required AccountStatus AccountStatus { get; init; }
}
