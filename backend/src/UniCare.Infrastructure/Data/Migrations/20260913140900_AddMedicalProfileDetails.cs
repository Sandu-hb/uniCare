using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniCare.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMedicalProfileDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Disability",
                table: "MedicalProfiles",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FamilyMedicalHistory",
                table: "MedicalProfiles",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GeneralExamination",
                table: "MedicalProfiles",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PastMedicalHistory",
                table: "MedicalProfiles",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VaccinationDetails",
                table: "MedicalProfiles",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Disability",
                table: "MedicalProfiles");

            migrationBuilder.DropColumn(
                name: "FamilyMedicalHistory",
                table: "MedicalProfiles");

            migrationBuilder.DropColumn(
                name: "GeneralExamination",
                table: "MedicalProfiles");

            migrationBuilder.DropColumn(
                name: "PastMedicalHistory",
                table: "MedicalProfiles");

            migrationBuilder.DropColumn(
                name: "VaccinationDetails",
                table: "MedicalProfiles");
        }
    }
}
