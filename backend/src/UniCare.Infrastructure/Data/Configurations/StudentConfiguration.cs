using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;

public class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        // Two students cannot share a registration number.
        builder.HasIndex(s => s.RegistrationNumber).IsUnique();
        builder.HasIndex(s => s.Email);

        builder.Property(s => s.RegistrationNumber).HasMaxLength(32);
        builder.Property(s => s.Address).HasMaxLength(512);
    }
}

