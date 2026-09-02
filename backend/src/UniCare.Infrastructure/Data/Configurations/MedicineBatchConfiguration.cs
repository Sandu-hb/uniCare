using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;
public class MedicineBatchConfiguration : IEntityTypeConfiguration<MedicineBatch>
{
    public void Configure(EntityTypeBuilder<MedicineBatch> builder)
    {
        // One batch number per medicine — the same number may recur across medicines.
        builder.HasIndex(b => new { b.MedicineId, b.BatchNumber }).IsUnique();
        // Dispensing picks the oldest non-expired batch first.
        builder.HasIndex(b => b.ExpiryDate);
    }
}

