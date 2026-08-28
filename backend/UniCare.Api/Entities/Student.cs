namespace UniCare.Api.Entities;

/// <summary>
/// A student registered with the university medical center.
/// </summary>
public class Student
{
    // EF Core convention: a property named `Id` (or `StudentId`) is automatically
    // treated as the primary key. No attribute needed.
    //
    // Guid rather than int: student IDs appear in URLs like /api/students/{id}.
    // Sequential integers would let anyone who is logged in walk the whole table
    // by incrementing the number. Authorization should stop that anyway, but for
    // medical records we don't rely on a single line of defence.
    public Guid Id { get; set; }

    // `required` (C# 11) means the compiler refuses to let you construct a Student
    // without setting this. Combined with nullable reference types being enabled in
    // the .csproj, `string` means "never null" and `string?` means "may be null" —
    // so the type itself documents which columns are optional.
    public required string RegistrationNumber { get; set; }

    public required string FullName { get; set; }

    // DateOnly maps to PostgreSQL `date`. Using DateTime here would add a
    // meaningless midnight time component and drag timezone conversion into
    // something that is just a calendar date.
    public DateOnly DateOfBirth { get; set; }

    public Gender Gender { get; set; }

    public required string Faculty { get; set; }

    public required string Department { get; set; }

    public int AcademicYear { get; set; }

    public string? ContactNumber { get; set; }

    public required string Email { get; set; }

    public string? Address { get; set; }

    public string? EmergencyContactName { get; set; }

    public string? EmergencyContactNumber { get; set; }

    // DateTimeOffset maps to `timestamptz`, which stores an absolute instant.
    // A plain DateTime has no timezone, so two servers in different regions can
    // disagree about what it means — a real problem for an audit trail.
    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? UpdatedAt { get; set; }

    // ---- Navigation properties (not columns) ----

    // One-to-one: a student has at most one medical profile. Nullable because
    // the profile does not exist until the student completes registration.
    public MedicalProfile? MedicalProfile { get; set; }

    // One-to-many: the "many" side is a collection. Initialised so you can call
    // .Add() on a new Student without a null check.
    public ICollection<Appointment> Appointments { get; set; } = [];
}
