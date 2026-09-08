using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using UniCare.Infrastructure.Data;

#nullable disable

namespace UniCare.Infrastructure.Data.Migrations;

[DbContext(typeof(UniCareDbContext))]
[Migration("20260908100000_RemoveDuplicateDocumentTables")]
public partial class RemoveDuplicateDocumentTables : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            DO $$
            BEGIN
                IF to_regclass('"DocumentExtractions"') IS NOT NULL
                   AND EXISTS (SELECT 1 FROM "DocumentExtractions") THEN
                    RAISE EXCEPTION 'Duplicate table DocumentExtractions contains data; migrate it before removing it.';
                END IF;

                IF to_regclass('"MedicalDocuments"') IS NOT NULL
                   AND EXISTS (SELECT 1 FROM "MedicalDocuments") THEN
                    RAISE EXCEPTION 'Duplicate table MedicalDocuments contains data; migrate it before removing it.';
                END IF;

                DROP TABLE IF EXISTS "DocumentExtractions";
                DROP TABLE IF EXISTS "MedicalDocuments";
            END $$;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // The duplicate tables were not part of the tracked EF model and cannot be restored safely.
    }
}