using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;
public class LabOrderConfiguration : IEntityTypeConfiguration<LabOrder>
{
    public void Configure(EntityTypeBuilder<LabOrder> builder)
    {
        builder.HasIndex(o => o.MedicalVisitId).IsUnique();
        builder.Property(o => o.RequestDetails).HasMaxLength(1000);
        builder.Property(o => o.ResultNotes).HasMaxLength(1000);
    }
}
