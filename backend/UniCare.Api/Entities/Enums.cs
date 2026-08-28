namespace UniCare.Api.Entities;

/// <summary>
/// Domain enums. These are stored in PostgreSQL as text rather than integers
/// (see the entity configurations) so the database stays readable and adding a
/// member later cannot silently change the meaning of existing rows.
/// </summary>
public enum Gender
{
    Male,
    Female,
    Other
}

public enum BloodGroup
{
    Unknown,
    APositive,
    ANegative,
    BPositive,
    BNegative,
    ABPositive,
    ABNegative,
    OPositive,
    ONegative
}

/// <summary>
/// Tracks a medical profile through the review workflow required by the SRS:
/// AI extracts the data, the student reviews it, then medical staff verify it
/// before it becomes part of the official record.
/// </summary>
public enum VerificationStatus
{
    Draft,
    SubmittedForVerification,
    Verified,
    Rejected
}

public enum AppointmentStatus
{
    Requested,
    Approved,
    Rejected,
    Rescheduled,
    CheckedIn,
    Completed,
    Cancelled
}
