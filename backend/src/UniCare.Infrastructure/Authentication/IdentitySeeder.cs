using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using UniCare.Domain.Constants;
using UniCare.Domain.Entities;
using UniCare.Domain.Enums;
using UniCare.Infrastructure.Data;

namespace UniCare.Infrastructure.Authentication;

/// <summary>
/// Development convenience: seeds the same three demo accounts the frontend's
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

        if (!await db.Staff.AnyAsync(s => s.ApplicationUserId == doctor.Id))
        {
            db.Staff.Add(new Staff
            {
                ApplicationUserId = doctor.Id,
                StaffNumber = "STF-0001",
                FullName = doctor.FullName,
                Email = doctor.Email!,
                Role = StaffRole.Doctor,
                IsActive = true,
            });
        }

        // Pending approval: the account can authenticate (so the frontend can route it
        // to /pending-approval) but IsActive is false — an admin has not signed off yet.
        var nurse = await EnsureUserAsync(
            userManager, "nurse@uom.lk", "Passw0rd", "Kavindi Silva", AppRoles.Nurse, AccountStatus.PendingApproval);

        if (!await db.Staff.AnyAsync(s => s.ApplicationUserId == nurse.Id))
        {
            db.Staff.Add(new Staff
            {
                ApplicationUserId = nurse.Id,
                StaffNumber = "STF-0002",
                FullName = nurse.FullName,
                Email = nurse.Email!,
                Role = StaffRole.Nurse,
                IsActive = false,
            });
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
}
