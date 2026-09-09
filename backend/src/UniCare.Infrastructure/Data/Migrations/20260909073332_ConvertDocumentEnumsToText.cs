using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniCare.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ConvertDocumentEnumsToText : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // A plain type change would let Postgres implicitly cast integer to text
            // (0 -> "0"), not the enum member name. USING maps each stored ordinal to
            // the name EF now expects.
            migrationBuilder.Sql(
                """
                ALTER TABLE "MedicalDocuments"
                ALTER COLUMN "Status" TYPE character varying(32)
                USING (CASE "Status"
                    WHEN 0 THEN 'Uploaded'
                END);
                """);

            migrationBuilder.Sql(
                """
                ALTER TABLE "MedicalDocuments"
                ALTER COLUMN "DocumentType" TYPE character varying(32)
                USING (CASE "DocumentType"
                    WHEN 0 THEN 'HospitalReport'
                    WHEN 1 THEN 'LabReport'
                    WHEN 2 THEN 'VaccinationRecord'
                    WHEN 3 THEN 'DentalReport'
                    WHEN 4 THEN 'Other'
                END);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE "MedicalDocuments"
                ALTER COLUMN "DocumentType" TYPE integer
                USING (CASE "DocumentType"
                    WHEN 'HospitalReport' THEN 0
                    WHEN 'LabReport' THEN 1
                    WHEN 'VaccinationRecord' THEN 2
                    WHEN 'DentalReport' THEN 3
                    WHEN 'Other' THEN 4
                END);
                """);

            migrationBuilder.Sql(
                """
                ALTER TABLE "MedicalDocuments"
                ALTER COLUMN "Status" TYPE integer
                USING (CASE "Status"
                    WHEN 'Uploaded' THEN 0
                END);
                """);
        }
    }
}
