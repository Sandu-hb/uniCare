using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;
public class VitalSignConfiguration : IEntityTypeConfiguration<VitalSign>
{
    public void Configure(EntityTypeBuilder<VitalSign> builder)
    {
        builder.HasIndex(v => v.MedicalVisitId).IsUnique();
        builder.Property(v => v.Observations).HasMaxLength(2000);
    }
}
