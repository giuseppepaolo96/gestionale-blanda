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
            Delete("/team/{TeamId}/logo");
            AllowAnonymous(); 
        }

        public override async Task HandleAsync(DeleteLogoCommand command, CancellationToken ct)
        {
            // Log per vedere il valore ricevuto del TeamId
            Console.WriteLine($"Received TeamId: {command.TeamId}");

            
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

            await SendOkAsync();
        }
    }
}
