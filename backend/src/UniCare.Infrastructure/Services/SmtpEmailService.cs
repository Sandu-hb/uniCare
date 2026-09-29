using System.Net;
using System.Net.Mail;
using UniCare.Application.Abstractions;

namespace UniCare.Infrastructure.Services;

/// <summary>
/// Plain SMTP. Configuration is read lazily, per send, rather than in a
/// constructor — SMTP_* is optional at startup, so an unconfigured environment
/// doesn't break every feature that happens to depend on IEmailService (e.g.
/// StaffService, which needs to keep working even if nobody has set up email
/// yet). Only the send itself fails, and callers decide how much that matters.
/// </summary>
public class SmtpEmailService : IEmailService
{
    public async Task SendAsync(
        string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var host = Environment.GetEnvironmentVariable("SMTP_HOST")
            ?? throw new InvalidOperationException(
                "SMTP_HOST is not set. Copy src/UniCare.Api/.env.example to .env and fill in the SMTP_* keys.");
        var port = int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT"), out var p) ? p : 587;
        var username = Environment.GetEnvironmentVariable("SMTP_USERNAME");
        var password = Environment.GetEnvironmentVariable("SMTP_PASSWORD");
        var useSsl = Environment.GetEnvironmentVariable("SMTP_USE_SSL") != "false";
        var fromEmail = Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL") ?? username
            ?? throw new InvalidOperationException("SMTP_FROM_EMAIL (or SMTP_USERNAME) is not set.");
        var fromName = Environment.GetEnvironmentVariable("SMTP_FROM_NAME") ?? "UniCare Medical Centre";

        using var client = new SmtpClient(host, port) { EnableSsl = useSsl };
        if (!string.IsNullOrEmpty(username))
        {
            client.Credentials = new NetworkCredential(username, password);
        }

        using var message = new MailMessage
        {
            From = new MailAddress(fromEmail, fromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
        };
        message.To.Add(toEmail);

        try
        {
            await client.SendMailAsync(message, cancellationToken);
        }
        catch (SmtpException ex)
        {
            throw new InvalidOperationException($"Failed to send email to {toEmail}: {ex.Message}", ex);
        }
    }
}
