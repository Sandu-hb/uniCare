using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;
public class CounselingMessageConfiguration : IEntityTypeConfiguration<CounselingMessage>
{
    public void Configure(EntityTypeBuilder<CounselingMessage> builder)
    {
        builder.HasIndex(m => new { m.CounselingSessionId, m.SentAt });
        builder.Property(m => m.Content).HasMaxLength(4000);
    }
}
