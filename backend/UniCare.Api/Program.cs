using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using UniCare.Api.Configuration;
using UniCare.Api.Data;

// Load backend/UniCare.Api/.env into the environment before configuration is read.
// The file is gitignored; see .env.example for the expected keys.
Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "frontend";

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// The connection string is never committed. Set DATABASE_URL in .env for local work, or
// supply DATABASE_URL / ConnectionStrings__DefaultConnection as an environment variable
// in deployed environments.
var rawConnectionString =
    Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "No database connection string found. Copy backend/UniCare.Api/.env.example to .env " +
        "and set DATABASE_URL to your Neon connection string.");

var connectionString = NeonConnectionString.FromUri(rawConnectionString);

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
