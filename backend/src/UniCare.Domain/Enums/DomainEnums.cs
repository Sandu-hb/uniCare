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
