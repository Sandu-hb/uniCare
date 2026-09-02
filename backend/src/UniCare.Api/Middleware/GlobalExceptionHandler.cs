using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using UniCare.Application.Exceptions;

namespace UniCare.Api.Middleware;

/// <summary>
/// Translates domain exceptions into ProblemDetails responses. This is the only
/// place that knows both about NotFoundException and about HTTP status codes —
/// which is what lets services stay transport-agnostic.
/// </summary>
public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (status, title) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Resource not found"),
            ConflictException => (StatusCodes.Status409Conflict, "Conflict"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred"),
        };

        if (status == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception on {Path}", httpContext.Request.Path);
        }

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            // Deliberate: an unexpected exception's message may contain connection
            // strings, SQL or file paths. Expected exceptions are safe to surface.
            Detail = status == StatusCodes.Status500InternalServerError ? null : exception.Message,
            Instance = httpContext.Request.Path,
        };

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
