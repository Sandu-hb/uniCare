namespace UniCare.Application.Abstractions;

public record WellnessAssistantReply
{
    public required string Reply { get; init; }

    /// <summary>
    /// True the moment this reply's underlying model judged the conversation
    /// showed crisis indicators (self-harm, suicidal ideation, or similar).
    /// The caller — CounselingService — is responsible for what happens next
    /// (surfacing crisis resources, flagging the session for staff); this
    /// interface only reports the judgment.
    /// </summary>
    public required bool CrisisFlagged { get; init; }
}

public record WellnessAssistantMessage(bool IsFromStudent, string Content);

/// <summary>
/// A wellness/first-line-support chat assistant, kept independent of any
/// particular provider — Gemini today, potentially something else later,
/// with no change to anything that calls this interface. This is explicitly
/// not a diagnostic or clinical tool; see the system prompt in the Gemini
/// implementation for the actual behavioral constraints.
/// </summary>
public interface IWellnessAssistant
{
    /// <summary>
    /// history excludes the new message — the caller passes the prior turns,
    /// then the message just sent, separately, so this interface never needs
    /// to guess where the conversation "currently" is.
    /// </summary>
    Task<WellnessAssistantReply> SendMessageAsync(
        IReadOnlyList<WellnessAssistantMessage> history,
        string newMessage,
        CancellationToken cancellationToken = default);
}
