using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AddColumnSponsorLogo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "sponsor",
                table: "Sponsors");

            migrationBuilder.AddColumn<byte[]>(
                name: "SponsorLogo",
                table: "Sponsors",
                type: "longblob",
                nullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SponsorLogo",
                table: "Sponsors");

            migrationBuilder.AddColumn<string>(
                name: "sponsor",
                table: "Sponsors",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
