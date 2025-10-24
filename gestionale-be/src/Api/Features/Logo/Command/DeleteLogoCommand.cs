using Api.Infrastructure.Data;
using Api.Services;
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
    public class DeleteLogoCommandHandler : ICommandHandler<DeleteLogoCommand>
    {
        private readonly AppDbContext _dbContext;

        private readonly DeleteService _deletionService;


        // Iniettare il servizio

        public DeleteLogoCommandHandler(DeleteService deletionService)
        {
            _deletionService = deletionService;
        }

        // Gestisce il comando, rimuovendo il logo dal team
        public async Task ExecuteAsync(DeleteLogoCommand command, CancellationToken ct)
        {
            // Recupera la squadra dal database
            await _deletionService.DeleteLogoAsync(command.TeamId, ct);
        }
    }
}
