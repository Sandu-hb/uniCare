using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;
public class MedicalProfileConfiguration : IEntityTypeConfiguration<MedicalProfile>
{
    public void Configure(EntityTypeBuilder<MedicalProfile> builder)
    {
        // THIS is what makes it one-to-one. Without it the database accepts
        // two profiles for the same student.
        builder.HasIndex(p => p.StudentId).IsUnique();

        // Free-text clinical fields need more than the 256-char default.
        builder.Property(p => p.ChronicConditions).HasMaxLength(2000);
        builder.Property(p => p.Allergies).HasMaxLength(2000);
        builder.Property(p => p.CurrentMedications).HasMaxLength(2000);
        builder.Property(p => p.EyeExamination).HasMaxLength(1000);
        builder.Property(p => p.DentalExamination).HasMaxLength(1000);
        builder.Property(p => p.RejectionReason).HasMaxLength(1000);
    }
}
