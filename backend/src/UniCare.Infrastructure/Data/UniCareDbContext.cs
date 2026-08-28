using Microsoft.EntityFrameworkCore;

namespace UniCare.Infrastructure.Persistence;

/// <summary>
/// The EF Core context for UniCare. Lives in Infrastructure, not Domain — entities
/// must know nothing about how they are persisted.
/// </summary>
public class UniCareDbContext(DbContextOptions<UniCareDbContext> options)
    : DbContext(options)
{
    // A DbSet<T> per entity goes here as the domain model is written, e.g.
    //   public DbSet<Student> Students => Set<Student>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Picks up every IEntityTypeConfiguration<T> in this assembly, so adding a new
        // entity configuration never requires editing this method.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(UniCareDbContext).Assembly);
    }
}
