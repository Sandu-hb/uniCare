using UniCare.Domain.Common;

namespace UniCare.Domain.Entities;

/// <summary>
/// What OCR and the extraction model produced for one document. Kept separate
/// from MedicalDocument so re-running extraction never risks the upload record,
/// and so the raw text is not loaded every time a document is listed.
/// </summary>
public class DocumentExtraction : AuditableEntity
{
    public Guid MedicalDocumentId { get; set; }
    public MedicalDocument MedicalDocument { get; set; } = null!;

    /// <summary>Everything OCR read, unmodified. Kept for auditing and debugging.</summary>
    public string? RawText { get; set; }

    /// <summary>
    /// The structured fields, as JSON — allergies, conditions, height and so on,
    /// each with its own confidence. JSON rather than columns because the shape
    /// will change as extraction improves, and a schema migration per change
    /// would be painful. Stored as PostgreSQL jsonb so it stays queryable.
    /// </summary>
    public string? ExtractedFieldsJson { get; set; }

    /// <summary>0–1. Null when the provider does not report one.</summary>
    public decimal? OverallConfidence { get; set; }

    /// <summary>Which service produced this, e.g. "AzureDocumentIntelligence".</summary>
    public string? Provider { get; set; }

    public DateTimeOffset? ProcessedAt { get; set; }

    /// <summary>Why extraction failed, when Status is Failed.</summary>
    public string? ErrorMessage { get; set; }
}
