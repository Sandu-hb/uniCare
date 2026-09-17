using Npgsql;

namespace UniCare.Infrastructure.Data;

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
        var isLocal = uri.Host is "localhost" or "127.0.0.1" or "::1";

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Database = uri.AbsolutePath.Trim('/'),
            Username = userInfo.Length > 0 && !string.IsNullOrEmpty(userInfo[0]) ? Uri.UnescapeDataString(userInfo[0]) : null,
            Password = userInfo.Length > 1 && !string.IsNullOrEmpty(userInfo[1]) ? Uri.UnescapeDataString(userInfo[1]) : null,
            // Neon requires TLS. Local Postgres typically uses Prefer/Disable.
            SslMode = isLocal ? SslMode.Prefer : SslMode.Require,
            Timeout = isLocal ? 15 : 60,
            CommandTimeout = isLocal ? 15 : 60
        };

        return builder.ConnectionString;
    }
}
