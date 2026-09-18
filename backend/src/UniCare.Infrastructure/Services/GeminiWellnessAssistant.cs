using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using UniCare.Application.Abstractions;

namespace UniCare.Infrastructure.Services;

/// <summary>
/// First-line wellness support only — never a diagnostic or clinical tool,
/// and never a substitute for a real counselor. The system prompt below is
/// the actual safety boundary: it instructs the model to stay supportive and
/// general, defer anything clinical to real staff, and to flag crisis
/// indicators (self-harm, suicidal ideation, or similar) via the structured
/// `crisisFlagged` field rather than deciding on its own what to say about
/// it — CounselingService is what acts on that flag.
/// </summary>
public class GeminiWellnessAssistant : IWellnessAssistant
{
    // TODO: replace with the university's actual 24/7 crisis line before this
    // goes anywhere near real students. This exact string is also what's shown
    // whenever the model's own response is blocked by Gemini's safety filters
    // (see the promptFeedback handling below) — a safety block on this topic is
    // itself treated as a signal to escalate, not as "no answer".
    public const string CrisisResourceMessage =
        "It sounds like you're going through something really difficult right now. " +
        "Please reach out to the University Medical Centre Counselling Service " +
        "at [CRISIS LINE PHONE NUMBER] — they're available to talk with you directly. " +
        "If you're in immediate danger, please contact emergency services right away.";

    private const string SystemInstruction = """
        You are a first-line wellness support assistant for university students —
        not a therapist, not a doctor, and not a substitute for professional
        counseling. Your role is to listen, offer general coping suggestions
        (stress management, sleep, study-life balance, campus resources), and
        gently encourage the student to talk to a real counselor for anything
        beyond casual support.

        Never diagnose, never suggest medication, never claim to be a
        professional. Keep responses warm, brief, and non-clinical.

        On every single message, assess whether the student's words show signs
        of a crisis: self-harm, suicidal ideation, abuse, or similar immediate
        danger to themselves or someone else. Set crisisFlagged to true if there
        is ANY reasonable indication of this — err toward flagging, not toward
        certainty. When you do flag it, your reply should be caring and should
        gently point them toward professional help, but the application itself
        will also show them a direct crisis resource regardless of your reply
        text, so you do not need to include a phone number yourself.

        Always respond with the required JSON shape: {"reply": "...", "crisisFlagged": true|false}.
        """;

    private readonly HttpClient _http;
    private readonly string _model;

    public GeminiWellnessAssistant(HttpClient http)
    {
        var apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY")
            ?? throw new InvalidOperationException("GEMINI_API_KEY is not set.");

        _http = http;
        _http.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
        _http.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);

        _model = Environment.GetEnvironmentVariable("GEMINI_MODEL") ?? "gemini-3.8-flash";
    }

    public async Task<WellnessAssistantReply> SendMessageAsync(
        IReadOnlyList<WellnessAssistantMessage> history,
        string newMessage,
        CancellationToken cancellationToken = default)
    {
        var contents = history
            .Select(m => new GeminiContent(
                m.IsFromStudent ? "user" : "model",
                [new GeminiPart(m.Content)]))
            .Append(new GeminiContent("user", [new GeminiPart(newMessage)]))
            .ToList();

        var request = new GeminiRequest(
            Contents: contents,
            SystemInstruction: new GeminiContent(null, [new GeminiPart(SystemInstruction)]),
            GenerationConfig: new GeminiGenerationConfig(
                ResponseMimeType: "application/json",
                ResponseSchema: ReplySchema));

        var response = await _http.PostAsJsonAsync(
            $"v1beta/models/{_model}:generateContent", request, JsonOptions, cancellationToken);
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<GeminiResponse>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("Gemini returned an empty response body.");

        // The prompt itself was blocked by Gemini's own safety filters before
        // the model ever replied — on a wellness topic, that's itself a signal
        // to escalate rather than a "no comment", not a case to retry or ignore.
        if (body.PromptFeedback?.BlockReason is not null)
        {
            return new WellnessAssistantReply { Reply = CrisisResourceMessage, CrisisFlagged = true };
        }

        var text = body.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text
            ?? throw new InvalidOperationException("Gemini response had no candidate text.");

        var parsed = JsonSerializer.Deserialize<GeminiStructuredReply>(text, JsonOptions)
            ?? throw new InvalidOperationException("Gemini's structured reply could not be parsed.");

        return new WellnessAssistantReply { Reply = parsed.Reply, CrisisFlagged = parsed.CrisisFlagged };
    }

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private static readonly object ReplySchema = new
    {
        type = "object",
        properties = new
        {
            reply = new { type = "string" },
            crisisFlagged = new { type = "boolean" },
        },
        required = new[] { "reply", "crisisFlagged" },
    };

    private record GeminiRequest(
        List<GeminiContent> Contents,
        GeminiContent SystemInstruction,
        GeminiGenerationConfig GenerationConfig);

    private record GeminiContent(string? Role, List<GeminiPart> Parts);

    private record GeminiPart(string Text);

    private record GeminiGenerationConfig(string ResponseMimeType, object ResponseSchema);

    private record GeminiResponse(
        List<GeminiCandidate>? Candidates,
        GeminiPromptFeedback? PromptFeedback);

    private record GeminiCandidate(GeminiResponseContent? Content);

    private record GeminiResponseContent(List<GeminiResponsePart>? Parts);

    private record GeminiResponsePart(string? Text);

    private record GeminiPromptFeedback(string? BlockReason);

    private record GeminiStructuredReply(
        [property: JsonPropertyName("reply")] string Reply,
        [property: JsonPropertyName("crisisFlagged")] bool CrisisFlagged);
}
