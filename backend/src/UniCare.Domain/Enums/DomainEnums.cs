namespace UniCare.Domain.Enums;

public enum Gender { Unspecified, Male, Female, Other }

// Unknown first: it's genuinely unknown at registration
public enum BloodGroup
{
    Unknown, APositive, ANegative, BPositive, BNegative,
    ABPositive, ABNegative, OPositive, ONegative
}

// SRS document workflow
public enum VerificationStatus { Draft, SubmittedForVerification, Verified, Rejected }

public enum AppointmentStatus
{
    Requested, Approved, Rejected, Rescheduled, CheckedIn, Completed, Cancelled
}

public enum StaffRole
{
    Unassigned, Admin, Nurse, Doctor, Dentist, LabStaff, PharmacyStaff, SystemAdmin
}

public enum VisitStatus { CheckedIn, WithNurse, AwaitingDoctor, WithDoctor, Completed, Abandoned }

public enum QueueStage { Nurse, Doctor, Pharmacy, Laboratory }

public enum PrescriptionStatus { Issued, PartiallyDispensed, Dispensed, Cancelled }

public enum MedicineForm { Tablet, Capsule, Syrup, Injection, Ointment, Drops, Inhaler, Other }

public enum DocumentType { HospitalReport, LabReport, VaccinationRecord, DentalReport, Other }

public enum DocumentStatus { Uploaded }

/// <summary>
/// Lifecycle of a sign-in account, as distinct from a Staff row's IsActive flag —
/// this describes whether the account may sign in at all, not whether the person
/// currently works here.
/// </summary>
public enum AccountStatus { Active, PendingApproval, Suspended }
