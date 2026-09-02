using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;
public class ConsultationConfiguration : IEntityTypeConfiguration<Consultation>
{
    public void Configure(EntityTypeBuilder<Consultation> builder)
    {
        builder.HasIndex(c => c.MedicalVisitId).IsUnique();
        builder.HasIndex(c => c.DoctorStaffId);

        builder.Property(c => c.Symptoms).HasMaxLength(2000);
        builder.Property(c => c.ExaminationFindings).HasMaxLength(2000);
        builder.Property(c => c.Treatment).HasMaxLength(2000);
        builder.Property(c => c.FollowUpInstructions).HasMaxLength(2000);
    }
}
