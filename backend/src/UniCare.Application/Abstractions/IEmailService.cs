namespace UniCare.Application.Abstractions;

/// <summary>
/// Outbound transactional email, kept independent of any particular provider —
/// SMTP today, potentially something else later, with no change to anything
/// that calls this interface.
/// </summary>
public interface IEmailService
{
    /// <exception cref="InvalidOperationException">No provider is configured, or the send failed.</exception>
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);
}
