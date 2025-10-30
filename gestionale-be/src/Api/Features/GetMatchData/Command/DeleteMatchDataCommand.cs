using Api.Entities;
using Api.Infrastructure.Data;
using Api.Services;
using FastEndpoints;

namespace Api.Features.GetMatchData.Command
{
    public class DeleteMatchDataCommand : ICommand
    {
    }

    public class DeleteMatchDataCommandHandler : ICommandHandler<DeleteMatchDataCommand>
    {
        private readonly AppDbContext _dbContext;
        private readonly DeleteService _deleteService;

        public DeleteMatchDataCommandHandler(DeleteService deleteService)
        {
            _deleteService = deleteService;
        }

        public async Task ExecuteAsync(DeleteMatchDataCommand command,CancellationToken ct)
        { 
            // Invio chiamata al servizio della delete
            await _deleteService.DeleteAllEntitiesAsync <MatchData> (ct);
        }
    }
}
