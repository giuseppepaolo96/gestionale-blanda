using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;


namespace Api.Features.Logo.Command
{
    // Il comando che rappresenta la richiesta di eliminazione del logo
    public class DeleteLogoCommand : ICommand
    {
        public int TeamId { get; set; }
    }

    // Handler che esegue la logica per eliminare il logo
    public class RemoveTeamLogoCommandHandler : ICommandHandler<DeleteLogoCommand>
    {
        private readonly AppDbContext _dbContext;

        // Iniettare il contesto per interagire con il database
        public RemoveTeamLogoCommandHandler(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Gestisce il comando, rimuovendo il logo dal team
        public async Task ExecuteAsync(DeleteLogoCommand command, CancellationToken ct)
        {
            // Recupera la squadra dal database
            var team = await _dbContext.Teams.FirstOrDefaultAsync(t => t.Id == command.TeamId, ct);
            if (team == null)
            {
                throw new Exception("La squadra non esiste");
            }

            // Se il logo non esiste, lancia un errore
            if (team.Logo == null)
            {
                throw new Exception("Non è presente nessun logo da eliminare");
            }

            // Rimuove il logo (impostandolo a null)
            team.Logo = null;

            // Salva le modifiche nel database
            await _dbContext.SaveChangesAsync(ct);
        }
    }
}
