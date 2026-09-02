using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;
public class StaffConfiguration : IEntityTypeConfiguration<Staff>
{
    public void Configure(EntityTypeBuilder<Staff> builder)
    {
        builder.HasIndex(s => s.StaffNumber).IsUnique();
        builder.Property(s => s.StaffNumber).HasMaxLength(32);
    }
}
