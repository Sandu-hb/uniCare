using Microsoft.EntityFrameworkCore;
using UniCare.Domain.Entities;

namespace UniCare.Application.Abstractions;

/// <summary>
/// The database as Application sees it. Exposes EF Core's DbSet so services can
/// query and project freely, but nothing here reveals which provider is behind it —
/// Npgsql lives in Infrastructure and the architecture tests keep it there.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<Student> Students { get; }
    DbSet<Staff> Staff { get; }
    DbSet<MedicalProfile> MedicalProfiles { get; }
    DbSet<Appointment> Appointments { get; }
    DbSet<MedicalVisit> MedicalVisits { get; }
    DbSet<QueueEntry> QueueEntries { get; }
    DbSet<VitalSign> VitalSigns { get; }
    DbSet<Consultation> Consultations { get; }
    DbSet<Diagnosis> Diagnoses { get; }
    DbSet<Prescription> Prescriptions { get; }
    DbSet<PrescriptionItem> PrescriptionItems { get; }
    DbSet<Medicine> Medicines { get; }
    DbSet<MedicineBatch> MedicineBatches { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
