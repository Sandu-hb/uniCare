using UniCare.Domain.Common;
using UniCare.Domain.Enums;

namespace UniCare.Domain.Entities;

/// <summary>
/// A hospital-issued document a student uploaded. The file itself lives in
/// storage; this row is the record of it.
/// </summary>
public class MedicalDocument : AuditableEntity
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    /// <summary>
    /// The name the student's file had. Display only — never used to build a path.
    /// A filename from a client can contain "../" or a null byte, so treating it
    /// as a path is a directory-traversal vulnerability.
    /// </summary>
    public required string OriginalFileName { get; set; }

    /// <summary>The name we generated. This is what storage is keyed by.</summary>
    public required string StorageKey { get; set; }

    public required string ContentType { get; set; }

    /// <summary>long, not int — int caps at ~2 GB.</summary>
    public long SizeBytes { get; set; }

    public DocumentType DocumentType { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Uploaded;

    public DateTimeOffset UploadedAt { get; set; }

    /// <summary>Null until the AI pipeline has processed it.</summary>
    public DocumentExtraction? Extraction { get; set; }
}
