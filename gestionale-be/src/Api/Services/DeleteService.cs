using Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    public class DeleteService
    {
        private readonly AppDbContext _dbContext;
        private readonly ILogger<DeleteService> _logger;

        public DeleteService(AppDbContext dbContext, ILogger<DeleteService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        // 🔹 Elimina il logo di una squadra
        public async Task DeleteLogoAsync(int teamId, CancellationToken ct)
        {
            var team = await _dbContext.Teams.FirstOrDefaultAsync(t => t.Id == teamId, ct);
            if (team is null)
                throw new InvalidOperationException("Squadra non trovata.");

            if (team.Logo is null)
                throw new InvalidOperationException("Nessun logo presente da eliminare.");

            team.Logo = null;
            await _dbContext.SaveChangesAsync(ct);

            _logger.LogInformation("Logo della squadra {TeamId} eliminato correttamente.", teamId);
        }

        // 🔹 Elimina file generico dal database
        public async Task DeleteFileAsync(int fileId, CancellationToken ct)
        {
            var file = await _dbContext.FileRecords.FirstOrDefaultAsync(f => f.Id == fileId, ct);
            if (file is null)
                throw new InvalidOperationException("File non trovato.");

            _dbContext.FileRecords.Remove(file);
            await _dbContext.SaveChangesAsync(ct);

            _logger.LogInformation("File {FileName} (ID {FileId}) eliminato correttamente.", file.FileName, file.Id);
        }

        // 🔹 Elimina lo sponsor
        public async Task DeleteSponsorAsync(int sponsorId, CancellationToken ct)
        {
            var sponsor = await _dbContext.Sponsors
                .Include(t => t.Name)
                .FirstOrDefaultAsync(t => t.Id == sponsorId, ct);

            if (sponsor is null)
                throw new InvalidOperationException("Sponsor non trovato.");

            if (sponsor is null)
                throw new InvalidOperationException("Nessuno sponsor da eliminare.");

            sponsor.Name = null;
            await _dbContext.SaveChangesAsync(ct);

            _logger.LogInformation("Sponsor della squadra {TeamId} eliminato correttamente.", sponsorId);
        }

        public async Task DeleteTeamAsync(int teamId, CancellationToken ct)
        {
            var team = await _dbContext.Teams
                .Include(t => t.Name)
                .FirstOrDefaultAsync(t => t.Id == teamId, ct);

            if (team is null)
                throw new InvalidOperationException("Sponsor non trovato.");

            if (team is null)
                throw new InvalidOperationException("Nessuno sponsor da eliminare.");

            team.Name = null;
            await _dbContext.SaveChangesAsync(ct);

            _logger.LogInformation("Squadra {TeamId} eliminato correttamente.", teamId);
        }

        public async Task DeleteAllEntitiesAsync<TEntity>(CancellationToken ct) where TEntity : class
        {
            var entityType = _dbContext.Model.FindEntityType(typeof(TEntity));
            if (entityType == null)
                throw new Exception($"Tipo {typeof(TEntity).Name} non trovato nel DbContext.");

            var tableName = entityType.GetTableName();

            if (string.IsNullOrEmpty(tableName))
                throw new Exception($"Impossibile determinare il nome della tabella per {typeof(TEntity).Name}.");

            // TRUNCATE TABLE è più veloce, ma attenzione alle FK!
            await _dbContext.Database.ExecuteSqlRawAsync($"TRUNCATE TABLE `{tableName}`", ct);
        }

    }
}

