using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using UniCare.Domain.Common;

namespace UniCare.Infrastructure.Data.Interceptors;

/// <summary>
/// Stamps audit timestamps immediately before EF writes. Services never set these
/// by hand — if you find yourself typing `CreatedAt =` in a service, this is missing.
/// </summary>
public class AuditingInterceptor : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        Stamp(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    // Both overloads are required: async is what the app uses, but EF tooling and
    // any synchronous SaveChanges() would bypass the async one entirely.
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        Stamp(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    private static void Stamp(DbContext? context)
    {
        if (context is null) return;

        // One timestamp for the whole save, so rows written together agree exactly.
        var now = DateTimeOffset.UtcNow;

        foreach (var entry in context.ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = now;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = now;
                    break;

                case EntityState.Deleted:
                    // Medical records are never physically removed. Turn the DELETE
                    // into an UPDATE that flags the row instead.
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedAt = now;
                    entry.Entity.UpdatedAt = now;
                    break;
            }
        }
    }
}
