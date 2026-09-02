using Microsoft.EntityFrameworkCore;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data;

/// <summary>
/// The EF Core context for UniCare. Lives in Infrastructure, not Domain — entities
/// must know nothing about how they are persisted.
/// </summary>
public class UniCareDbContext(DbContextOptions<UniCareDbContext> options)
    : DbContext(options)
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
    }
}
