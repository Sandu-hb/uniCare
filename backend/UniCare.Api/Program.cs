using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using UniCare.Api.Data;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "frontend";

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// The connection string is never committed. Supply it locally with:
//   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<Neon connection string>"
// and in deployed environments with the ConnectionStrings__DefaultConnection env var.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' is not configured. " +
        "Run: dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" \"<Neon connection string>\"");

builder.Services.AddDbContext<UniCareDbContext>(options =>
    options.UseNpgsql(connectionString));

// In development the Vite dev server proxies /api to this process, so requests are
// same-origin and CORS never applies. This policy is for deployed environments where
// the SPA is served from a different origin.
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
else
{
    // Only redirect in deployed environments; the local http profile has no TLS listener.
    app.UseHttpsRedirection();
}

app.UseCors(FrontendCorsPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();
