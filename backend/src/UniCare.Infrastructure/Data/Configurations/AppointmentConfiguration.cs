using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;
public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        // The admin's daily list filters on date and status — index both together.
        builder.HasIndex(a => new { a.ScheduledDate, a.Status });
        builder.HasIndex(a => a.StudentId);

        builder.Property(a => a.Reason).HasMaxLength(1000);
        builder.Property(a => a.RejectionReason).HasMaxLength(1000);
    }
}
