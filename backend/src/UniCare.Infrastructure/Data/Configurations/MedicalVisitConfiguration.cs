using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;
public class MedicalVisitConfiguration : IEntityTypeConfiguration<MedicalVisit>
{
    public void Configure(EntityTypeBuilder<MedicalVisit> builder)
    {
        // Unique but nullable: walk-ins have no appointment, and PostgreSQL allows
        // many NULLs in a unique index — so several walk-ins coexist happily.
        builder.HasIndex(v => v.AppointmentId).IsUnique();
        builder.HasIndex(v => new { v.StudentId, v.CheckedInAt });
    }
}
