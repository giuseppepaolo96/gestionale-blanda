using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class ModifyTableTeams : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Teams",
                newName: "NameHomeTeam");

            migrationBuilder.AddColumn<string>(
                name: "NameAwayTeam",
                table: "Teams",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NameAwayTeam",
                table: "Teams");

            migrationBuilder.RenameColumn(
                name: "NameHomeTeam",
                table: "Teams",
                newName: "Name");
        }
    }
}
