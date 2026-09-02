using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using UniCare.Application.Abstractions;
using UniCare.Domain.Common;
using UniCare.Domain.Entities;
using UniCare.Domain.Enums;

namespace UniCare.Infrastructure.Data;

/// <summary>
/// The EF Core context for UniCare. Lives in Infrastructure, not Domain — entities
/// must know nothing about how they are persisted.
/// </summary>
public class UniCareDbContext(DbContextOptions<UniCareDbContext> options)
    : DbContext(options), IApplicationDbContext
{
    // People
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Staff> Staff => Set<Staff>();

    // Medical records
    public DbSet<MedicalProfile> MedicalProfiles => Set<MedicalProfile>();

    // Visit lifecycle
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<MedicalVisit> MedicalVisits => Set<MedicalVisit>();
    public DbSet<QueueEntry> QueueEntries => Set<QueueEntry>();
    public DbSet<VitalSign> VitalSigns => Set<VitalSign>();
    public DbSet<Consultation> Consultations => Set<Consultation>();
    public DbSet<Diagnosis> Diagnoses => Set<Diagnosis>();

    // Pharmacy
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<PrescriptionItem> PrescriptionItems => Set<PrescriptionItem>();
    public DbSet<Medicine> Medicines => Set<Medicine>();
    public DbSet<MedicineBatch> MedicineBatches => Set<MedicineBatch>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Picks up every IEntityTypeConfiguration<T> in this assembly, so adding a new
        // entity configuration never requires editing this method.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(UniCareDbContext).Assembly);


        // Soft-deleted rows are invisible to normal queries. EF appends this predicate
        // to every query for these types; call IgnoreQueryFilters() to see them.
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(AuditableEntity).IsAssignableFrom(entityType.ClrType)) continue;

            // No generic type parameter is available in this loop, so the predicate
            // e => !e.IsDeleted has to be built as an expression tree by hand.
            var parameter = Expression.Parameter(entityType.ClrType, "e");
            var body = Expression.Not(
                Expression.Property(parameter, nameof(AuditableEntity.IsDeleted)));

            modelBuilder.Entity(entityType.ClrType)
                .HasQueryFilter(Expression.Lambda(body, parameter));
        }


        // EF defaults required relationships to cascade delete. Deleting a student would
        // take their visits, consultations, diagnoses and prescriptions with them.
        // Make the database refuse instead — medical history is never collateral damage.
        foreach (var foreignKey in modelBuilder.Model
                     .GetEntityTypes()
                     .SelectMany(entityType => entityType.GetForeignKeys()))
        {
            foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
        }

    }

    protected override void ConfigureConventions(ModelConfigurationBuilder builder)
    {
        base.ConfigureConventions(builder);

        // Store enums as text, not integers. With ints, inserting a new member in the
        // middle later shifts every value below it and silently reinterprets old rows.
        builder.Properties<Gender>().HaveConversion<string>().HaveMaxLength(32);
        builder.Properties<BloodGroup>().HaveConversion<string>().HaveMaxLength(32);
        builder.Properties<VerificationStatus>().HaveConversion<string>().HaveMaxLength(32);
        builder.Properties<AppointmentStatus>().HaveConversion<string>().HaveMaxLength(32);
        builder.Properties<StaffRole>().HaveConversion<string>().HaveMaxLength(32);
        builder.Properties<VisitStatus>().HaveConversion<string>().HaveMaxLength(32);
        builder.Properties<QueueStage>().HaveConversion<string>().HaveMaxLength(32);
        builder.Properties<PrescriptionStatus>().HaveConversion<string>().HaveMaxLength(32);
        builder.Properties<MedicineForm>().HaveConversion<string>().HaveMaxLength(32);

        // Heights and weights: 4 digits, 2 decimal places — 180.50cm, 72.25kg.
        builder.Properties<decimal>().HavePrecision(6, 2);

        // A sane default so no column becomes unbounded text by accident.
        builder.Properties<string>().HaveMaxLength(256);
    }
}
