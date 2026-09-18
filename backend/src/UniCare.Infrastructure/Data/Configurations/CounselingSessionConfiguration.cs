using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;
public class CounselingSessionConfiguration : IEntityTypeConfiguration<CounselingSession>
{
    public void Configure(EntityTypeBuilder<CounselingSession> builder)
    {
        // The alerts board filters to flagged sessions; own-history reads filter by student.
        builder.HasIndex(s => new { s.StudentId, s.StartedAt });
        builder.HasIndex(s => s.CrisisFlagged);
    }
}
