using Npgsql;

namespace UniCare.Infrastructure.Persistence;

/// <summary>
/// Neon hands out connection strings as URIs (postgresql://user:pass@host/db?sslmode=require),
/// but Npgsql expects semicolon-delimited key/value pairs. This converts between the two so the
/// value in .env can be pasted straight from the Neon console.
/// </summary>
public static class NeonConnectionString
{
    public static string FromUri(string value)
    {
        // Already in Npgsql key/value form — pass it through untouched.
        if (!value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return value;
        }

        var uri = new Uri(value);
        var userInfo = uri.UserInfo.Split(':', 2);

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Database = uri.AbsolutePath.Trim('/'),
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
            // Neon requires TLS. Npgsql's Require mode encrypts without demanding a chain the
            // client can verify locally, which is what Neon's proxy expects.
            SslMode = SslMode.Require
        };

        return builder.ConnectionString;
    }
}
