using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;
public class PrescriptionConfiguration : IEntityTypeConfiguration<Prescription>
{
    public void Configure(EntityTypeBuilder<Prescription> builder)
    {
        builder.HasIndex(p => p.ConsultationId).IsUnique();
        builder.Property(p => p.Notes).HasMaxLength(1000);
    }
}
