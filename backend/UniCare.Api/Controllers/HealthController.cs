using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniCare.Api.Data;

namespace UniCare.Api.Controllers;

/// <summary>
/// Liveness probe for the API and its Neon PostgreSQL connection.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController(
    UniCareDbContext db,
    IWebHostEnvironment environment,
    ILogger<HealthController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var databaseReachable = false;

        try
        {
            databaseReachable = await db.Database.CanConnectAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Health check could not reach the database.");
        }

        var payload = new
        {
            status = databaseReachable ? "ok" : "degraded",
            database = databaseReachable ? "connected" : "unreachable",
            environment = environment.EnvironmentName,
            timestamp = DateTimeOffset.UtcNow
        };

        return databaseReachable
            ? Ok(payload)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, payload);
    }
}
