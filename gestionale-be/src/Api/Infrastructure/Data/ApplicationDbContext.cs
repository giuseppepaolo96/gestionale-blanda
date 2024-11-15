using Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public DbSet<FileRecord> FileRecords => Set<FileRecord>();

    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Sponsor> Sponsors => Set<Sponsor>();

    public DbSet<MatchData> MatchData { get; set; }


    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { 

    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configura la relazione tra MatchData e Team
        modelBuilder.Entity<MatchData>()
            .HasOne(m => m.HomeTeam)
            .WithMany()
            .HasForeignKey(m => m.HomeTeamId)
            .OnDelete(DeleteBehavior.Restrict); // Configura la delete, se necessario

        modelBuilder.Entity<MatchData>()
            .HasOne(m => m.AwayTeam)
            .WithMany()
            .HasForeignKey(m => m.AwayTeamId)
            .OnDelete(DeleteBehavior.Restrict); // Configura la delete, se necessario
    }


}
