using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using UniCare.Application.Abstractions;
using UniCare.Application.Features.Auth;
using UniCare.Infrastructure.Authentication;
using UniCare.Infrastructure.Data;
using UniCare.Infrastructure.Data.Interceptors;
using UniCare.Infrastructure.Services;


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

        services.AddScoped<IFileStorage, CloudinaryFileStorage>();

        // Scoped lifetime: one DbContext per HTTP request. It is not thread-safe and
        // it tracks changes, so a singleton would leak entities between users.
        services.AddScoped<AuditingInterceptor>();

        services.AddDbContext<UniCareDbContext>((sp, options) =>
            options.UseNpgsql(connectionString)
                   .AddInterceptors(sp.GetRequiredService<AuditingInterceptor>()));

        // Hand Application the SAME context instance already registered above.
        // Writing AddScoped<IApplicationDbContext, UniCareDbContext>() instead would
        // create a second context per request — changes tracked on one would not be
        // saved by the other.
        services.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<UniCareDbContext>());

        // AddIdentityCore rather than AddIdentity: this is a JSON API with no cookie
        // sign-in or scaffolded UI, so only the pieces that manage users, roles and
        // passwords are needed.
        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.Password.RequiredLength = 8;
                options.Password.RequireNonAlphanumeric = false;
                options.User.RequireUniqueEmail = true;
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<UniCareDbContext>()
            .AddSignInManager();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<JwtTokenGenerator>();

        // Same pattern as DATABASE_URL: real value in src/UniCare.Api/.env locally,
        // a real environment variable once deployed. Never committed — see .env.example.
        var jwtOptions = new JwtOptions
        {
            Secret = Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? throw new InvalidOperationException(
                    "JWT_SECRET is not set. Copy src/UniCare.Api/.env.example to .env and fill it in."),
            Issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "UniCare",
            Audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "UniCareClient",
            ExpiryMinutes = int.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRY_MINUTES"), out var minutes)
                ? minutes
                : 60,
        };

        services.AddSingleton(Microsoft.Extensions.Options.Options.Create(jwtOptions));

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                };
            });

        services.AddAuthorization();

        return services;
    }
}
