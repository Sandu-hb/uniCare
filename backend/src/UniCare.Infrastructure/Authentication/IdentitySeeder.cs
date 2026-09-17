using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using UniCare.Domain.Constants;
using UniCare.Domain.Entities;
using UniCare.Domain.Enums;
using UniCare.Infrastructure.Data;

namespace UniCare.Infrastructure.Authentication;

/// <summary>
/// Development convenience: seeds the same demo accounts the frontend's
/// mock auth ships with (see frontend/src/features/auth/mock-api.ts), so
/// switching VITE_USE_MOCK_AUTH to "false" logs in against real data without any
/// manual setup. Never runs outside Development — see Program.cs.
/// </summary>
public static class IdentitySeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var db = services.GetRequiredService<UniCareDbContext>();

        foreach (var roleName in AppRoles.All)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
            }
        }

        var student = await EnsureUserAsync(
            userManager, "student@uom.lk", "Passw0rd", "Nadeesha Perera", AppRoles.Student, AccountStatus.Active);

        if (!await db.Students.AnyAsync(s => s.ApplicationUserId == student.Id))
        {
            db.Students.Add(new Student
            {
                ApplicationUserId = student.Id,
                RegistrationNumber = "2021/CS/045",
                FullName = student.FullName,
                Email = student.Email!,
                Faculty = "Engineering",
                Department = "Computer Science",
                AcademicYear = 3,
                DateOfBirth = new DateOnly(2000, 5, 14),
                Gender = Gender.Female,
            });
        }

        var doctor = await EnsureUserAsync(
            userManager, "doctor@uom.lk", "Passw0rd", "Dr. Ishara Wickramasinghe", AppRoles.Doctor, AccountStatus.Active);

        var doctorStaff = await db.Staff.FirstOrDefaultAsync(s => s.ApplicationUserId == doctor.Id);
        if (doctorStaff is null)
        {
            doctorStaff = new Staff
            {
                ApplicationUserId = doctor.Id,
                StaffNumber = "STF-0001",
                FullName = doctor.FullName,
                Email = doctor.Email!,
                Role = StaffRole.Doctor,
                IsActive = true,
            };
            db.Staff.Add(doctorStaff);
            await db.SaveChangesAsync(); // need the generated Id for appointments below
        }

        // A few more students with verified medical profiles, so there is
        // something real for an admin to book appointments against beyond
        // the single original demo student.
        var extraStudents = new[]
        {
            ("kasun.f@uom.lk", "Kasun Fernando", "2022/IT/031", "Computing", "Information Technology", 2, new DateOnly(2001, 3, 22), Gender.Male),
            ("dilani.j@uom.lk", "Dilani Jayasuriya", "2021/SCI/018", "Science", "Biology", 3, new DateOnly(2000, 11, 9), Gender.Female),
            ("ruwan.b@uom.lk", "Ruwan Bandara", "2020/ENG/076", "Engineering", "Civil Engineering", 4, new DateOnly(1999, 7, 2), Gender.Male),
            ("sachini.r@uom.lk", "Sachini Rathnayake", "2023/MGT/004", "Management", "Business Administration", 1, new DateOnly(2002, 1, 30), Gender.Female),
        };

        var seededStudentIds = new List<Guid>();

        foreach (var (email, fullName, regNo, faculty, department, year, dob, gender) in extraStudents)
        {
            var user = await EnsureUserAsync(userManager, email, "Passw0rd", fullName, AppRoles.Student, AccountStatus.Active);

            var existing = await db.Students.FirstOrDefaultAsync(s => s.ApplicationUserId == user.Id);
            Guid studentId;

            if (existing is null)
            {
                var newStudent = new Student
                {
                    ApplicationUserId = user.Id,
                    RegistrationNumber = regNo,
                    FullName = fullName,
                    Email = email,
                    Faculty = faculty,
                    Department = department,
                    AcademicYear = year,
                    DateOfBirth = dob,
                    Gender = gender,
                };
                db.Students.Add(newStudent);
                await db.SaveChangesAsync(); // need the generated Id before referencing it below
                studentId = newStudent.Id;
            }
            else
            {
                studentId = existing.Id;
            }

            seededStudentIds.Add(studentId);

            if (!await db.MedicalProfiles.AnyAsync(p => p.StudentId == studentId))
            {
                db.MedicalProfiles.Add(new MedicalProfile
                {
                    StudentId = studentId,
                    BloodGroup = BloodGroup.OPositive,
                    Status = VerificationStatus.Verified,
                    SubmittedAt = DateTimeOffset.UtcNow.AddDays(-3),
                    VerifiedAt = DateTimeOffset.UtcNow.AddDays(-2),
                });
            }
        }

        // A handful of real appointments with the seeded doctor, on the next
        // available weekdays within business hours — enough to check in,
        // record a consultation against, and see a completed visit already
        // sitting in the student's history.
        if (!await db.Appointments.AnyAsync(a => a.AssignedStaffId == doctorStaff.Id))
        {
            var slots = new (int DaysAhead, TimeOnly Time, string Reason)[]
            {
                (0, new TimeOnly(9, 0), "Recurring headaches"),
                (1, new TimeOnly(10, 30), "Annual physical checkup"),
                (1, new TimeOnly(14, 0), "Follow-up on allergy medication"),
                (2, new TimeOnly(15, 30), "Sports injury — knee pain"),
            };

            for (var i = 0; i < slots.Length && i < seededStudentIds.Count; i++)
            {
                var (daysAhead, time, reason) = slots[i];
                db.Appointments.Add(new Appointment
                {
                    StudentId = seededStudentIds[i],
                    AssignedStaffId = doctorStaff.Id,
                    ScheduledDate = NextWeekday(DateOnly.FromDateTime(DateTime.UtcNow), daysAhead),
                    ScheduledTime = time,
                    Status = AppointmentStatus.Approved,
                    Reason = reason,
                });
            }
        }

        // One shared account per portal — the university runs a single pharmacy
        // counter and a single lab bench, not per-person logins for either.
        var pharmacy = await EnsureUserAsync(
            userManager, "pharmacy@uom.lk", "Passw0rd", "Pharmacy Counter", AppRoles.PharmacyStaff, AccountStatus.Active);

        if (!await db.Staff.AnyAsync(s => s.ApplicationUserId == pharmacy.Id))
        {
            db.Staff.Add(new Staff
            {
                ApplicationUserId = pharmacy.Id,
                StaffNumber = "STF-0002",
                FullName = pharmacy.FullName,
                Email = pharmacy.Email!,
                Role = StaffRole.PharmacyStaff,
                IsActive = true,
            });
        }

        var lab = await EnsureUserAsync(
            userManager, "lab@uom.lk", "Passw0rd", "Laboratory Bench", AppRoles.LabStaff, AccountStatus.Active);

        if (!await db.Staff.AnyAsync(s => s.ApplicationUserId == lab.Id))
        {
            db.Staff.Add(new Staff
            {
                ApplicationUserId = lab.Id,
                StaffNumber = "STF-0004",
                FullName = lab.FullName,
                Email = lab.Email!,
                Role = StaffRole.LabStaff,
                IsActive = true,
            });
        }

        // Bootstrap account: self-registration deliberately cannot create an Admin,
        // and admin-direct creation (StaffService.CreateAsync) requires an existing
        // admin to call it — so exactly one admin must exist before either path works.
        var admin = await EnsureUserAsync(
            userManager, "admin@uom.lk", "Passw0rd", "Priyantha Bandara", AppRoles.Admin, AccountStatus.Active);

        if (!await db.Staff.AnyAsync(s => s.ApplicationUserId == admin.Id))
        {
            db.Staff.Add(new Staff
            {
                ApplicationUserId = admin.Id,
                StaffNumber = "STF-0003",
                FullName = admin.FullName,
                Email = admin.Email!,
                Role = StaffRole.Admin,
                IsActive = true,
            });
        }

        if (!await db.Medicines.AnyAsync())
        {
            db.Medicines.AddRange(
                new Medicine { Name = "Paracetamol", Form = MedicineForm.Tablet, Strength = "500mg", Unit = "tablet" },
                new Medicine { Name = "Amoxicillin", Form = MedicineForm.Capsule, Strength = "250mg", Unit = "capsule" },
                new Medicine { Name = "Ibuprofen", Form = MedicineForm.Tablet, Strength = "400mg", Unit = "tablet" },
                new Medicine { Name = "Cetirizine", Form = MedicineForm.Tablet, Strength = "10mg", Unit = "tablet" },
                new Medicine { Name = "Omeprazole", Form = MedicineForm.Capsule, Strength = "20mg", Unit = "capsule" },
                new Medicine { Name = "Amoxicillin-Clavulanate", GenericName = "Co-amoxiclav", Form = MedicineForm.Tablet, Strength = "625mg", Unit = "tablet" },
                new Medicine { Name = "Salbutamol", Form = MedicineForm.Inhaler, Strength = "100mcg", Unit = "inhaler" },
                new Medicine { Name = "Diclofenac Gel", Form = MedicineForm.Ointment, Strength = "1%", Unit = "tube" },
                new Medicine { Name = "Cough Syrup", GenericName = "Dextromethorphan", Form = MedicineForm.Syrup, Unit = "ml" },
                new Medicine { Name = "Loratadine", Form = MedicineForm.Tablet, Strength = "10mg", Unit = "tablet" });
        }

        await db.SaveChangesAsync();
    }

    private static async Task<ApplicationUser> EnsureUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string password,
        string fullName,
        string role,
        AccountStatus status)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FullName = fullName,
                Status = status,
            };

            var result = await userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Failed to seed {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }

        if (!await userManager.IsInRoleAsync(user, role))
        {
            await userManager.AddToRoleAsync(user, role);
        }

        return user;
    }

    /// <summary>The next date that is `daysAhead` weekdays after `from`, skipping weekends
    /// — the medical centre is closed Saturday/Sunday, same rule as appointment booking.</summary>
    private static DateOnly NextWeekday(DateOnly from, int daysAhead)
    {
        var date = from;
        var remaining = daysAhead;

        while (remaining > 0 || date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
        {
            date = date.AddDays(1);
            if (date.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday))
            {
                remaining--;
            }
        }

        return date;
    }
}
