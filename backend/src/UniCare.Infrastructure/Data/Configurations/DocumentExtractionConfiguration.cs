using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniCare.Domain.Entities;

namespace UniCare.Infrastructure.Data.Configurations;

public class DocumentExtractionConfiguration : IEntityTypeConfiguration<DocumentExtraction>
{
    public void Configure(EntityTypeBuilder<DocumentExtraction> builder)
    {
        // Unique makes this one-to-one: one extraction per document.
        builder.HasIndex(e => e.MedicalDocumentId).IsUnique();

        // Unbounded: OCR output has no sensible length limit, and this overrides
        // the global 256-char string convention in ConfigureConventions.
        builder.Property(e => e.RawText).HasColumnType("text").Metadata.SetMaxLength(null);

        // jsonb rather than text: PostgreSQL parses and indexes it, so the extracted
        // fields stay queryable. Provider-specific, which is exactly why it belongs
        // in Infrastructure rather than on the entity.
        builder.Property(e => e.ExtractedFieldsJson).HasColumnType("jsonb").Metadata.SetMaxLength(null);

        builder.Property(e => e.Provider).HasMaxLength(128);
        builder.Property(e => e.ErrorMessage).HasMaxLength(2000);
        builder.Property(e => e.OverallConfidence).HasPrecision(4, 3);
    }
}
