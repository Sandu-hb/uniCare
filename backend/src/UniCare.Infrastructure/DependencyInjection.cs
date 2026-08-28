using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UniCare.Infrastructure.Data;

namespace UniCare.Infrastructure;

/// <summary>
/// Every layer exposes one extension method that registers its own services, so
/// Program.cs stays a list of layer names instead of a wall of configuration.
/// This is also what keeps EF Core out of the Api project entirely.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Never committed. Set DATABASE_URL in src/UniCare.Api/.env for local work, or
        // as a real environment variable in deployed environments.
        var rawConnectionString =
            Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "No database connection string found. Copy src/UniCare.Api/.env.example " +
                "to .env and set DATABASE_URL to your Neon connection string.");

        var connectionString = NeonConnectionString.FromUri(rawConnectionString);

        // Scoped lifetime: one DbContext per HTTP request. It is not thread-safe and
        // it tracks changes, so a singleton would leak entities between users.
        services.AddDbContext<UniCareDbContext>(options =>
            options.UseNpgsql(connectionString));

        return services;
    }
}
