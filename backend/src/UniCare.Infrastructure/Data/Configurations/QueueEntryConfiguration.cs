using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;
public class QueueEntryConfiguration : IEntityTypeConfiguration<QueueEntry>
{
    public void Configure(EntityTypeBuilder<QueueEntry> builder)
    {
        builder.HasIndex(q => q.MedicalVisitId).IsUnique();
        // The live queue screen filters by stage.
        builder.HasIndex(q => new { q.Stage, q.EnteredAt });
    }
}
