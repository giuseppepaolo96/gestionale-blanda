using Api.Features.Logo.Command;
using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Logo.Endpoint
{
    public class DeleteLogoEndpoint : Endpoint<DeleteLogoCommand>
    {
        private readonly AppDbContext _dbContext;

        public DeleteLogoEndpoint(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Configura il percorso dell'endpoint
        public override void Configure()
        {
            // Cambia il nome del parametro URL in {TeamId} (perché nel comando si chiama TeamId)
            Delete("/teams/{TeamId}/logo");
            AllowAnonymous(); // Facoltativo, se vuoi consentire accesso anonimo
        }

        // Gestisci la richiesta DELETE
        public override async Task HandleAsync(DeleteLogoCommand command, CancellationToken ct)
        {
            // Log per vedere il valore ricevuto del TeamId
            Console.WriteLine($"Received TeamId: {command.TeamId}");

            // Recupera la squadra dal database usando TeamId (che ora è il parametro dell'URL)
            var team = await _dbContext.Teams
                .FirstOrDefaultAsync(t => t.Id == command.TeamId, ct);

            // Se non trovi la squadra
            if (team == null)
            {
                throw new Exception("Squadra non presente");
            }

            // Se il logo non è presente
            if (team.Logo == null)
            {
                throw new Exception("Logo non presente");
            }

            // Rimuovi il logo
            team.Logo = null;
            await _dbContext.SaveChangesAsync(ct);

            // Restituisci un OK se l'operazione è riuscita
            await SendOkAsync();
        }
    }
}
