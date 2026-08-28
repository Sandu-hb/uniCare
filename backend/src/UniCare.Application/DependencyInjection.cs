using Microsoft.Extensions.DependencyInjection;

namespace UniCare.Application;

/// <summary>
/// Registers the Application layer's own services. Mirrors
/// UniCare.Infrastructure.DependencyInjection so Program.cs reads as one line
/// per layer rather than a wall of registrations.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Feature services are registered here as they are written, e.g.
        //   services.AddScoped<IStudentService, StudentService>();
        //
        // FluentValidation validators will be picked up with
        //   services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}
