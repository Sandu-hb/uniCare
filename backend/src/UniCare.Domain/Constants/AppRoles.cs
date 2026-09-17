using UniCare.Domain.Enums;

namespace UniCare.Domain.Constants;

/// <summary>
/// Canonical role names, shared by Identity role seeding, JWT role claims and
/// [Authorize(Roles = ...)] attributes. Staff role names mirror <see cref="StaffRole"/>
/// exactly via nameof, so the two can never drift apart; Student has no equivalent
/// in StaffRole since a student is not staff.
/// </summary>
public static class AppRoles
{
    public const string Student = "Student";
    public const string Admin = nameof(StaffRole.Admin);
    public const string Doctor = nameof(StaffRole.Doctor);
    public const string LabStaff = nameof(StaffRole.LabStaff);
    public const string PharmacyStaff = nameof(StaffRole.PharmacyStaff);

    public static readonly IReadOnlyList<string> Staff =
    [
        Admin, Doctor, LabStaff, PharmacyStaff,
    ];

    public static readonly IReadOnlyList<string> All = [Student, .. Staff];
}
