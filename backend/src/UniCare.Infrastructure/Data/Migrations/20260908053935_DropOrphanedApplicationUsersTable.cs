using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniCare.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    /// <remarks>
    /// "ApplicationUsers" was never part of this codebase's tracked EF model — it
    /// came from an untracked migration (20260905044140_AddApplicationUser) applied
    /// directly to the shared dev database by work that never landed in this repo.
    /// It modelled sign-in with a hand-rolled BCrypt-hashed table, which this
    /// migration replaces with the ASP.NET Core Identity tables (AspNetUsers etc.)
    /// added in AddIdentityAuthAndDocumentTables. Hand-written, not generated: EF's
    /// model diff sees no change here because it never knew this table existed.
    /// </remarks>
    public partial class DropOrphanedApplicationUsersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """ALTER TABLE "Students" DROP CONSTRAINT IF EXISTS "FK_Students_ApplicationUsers_ApplicationUserId";""");
            migrationBuilder.Sql(
                """ALTER TABLE "Staff" DROP CONSTRAINT IF EXISTS "FK_Staff_ApplicationUsers_ApplicationUserId";""");
            migrationBuilder.Sql("""DROP TABLE IF EXISTS "ApplicationUsers";""");

            // Reconcile the ledger: this row recorded a migration that has no file in
            // this repo, for a table this migration now removes.
            migrationBuilder.Sql(
                """DELETE FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260905044140_AddApplicationUser';""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Deliberately irreversible: ApplicationUsers was drift from a migration
            // this repo never had, not a tracked part of the model. There is nothing
            // for EF to recreate it from.
            throw new NotSupportedException(
                "DropOrphanedApplicationUsersTable cannot be reverted — ApplicationUsers " +
                "predates this repo's tracked model and its shape is not recorded anywhere.");
        }
    }
}
