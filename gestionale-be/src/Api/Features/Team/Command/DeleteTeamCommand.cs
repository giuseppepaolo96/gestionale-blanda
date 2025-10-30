

using Api.Infrastructure.Data;
using Api.Services;
using FastEndpoints;

namespace Api.Features.Team.Command
{
    public class DeleteTeamCommand : ICommand
    {
        public int TeamId { get; set; }
    }

    public class DeleteTeamCommandHandler : ICommandHandler<DeleteTeamCommand> 
    {
        private readonly AppDbContext _dbContext;
        private readonly DeleteService _deleteService;

        public DeleteTeamCommandHandler (DeleteService deleteService)
        {
            _deleteService = deleteService;
        } 

        public async Task ExecuteAsync(DeleteTeamCommand command,CancellationToken ct)
        {
            await _deleteService.DeleteTeamAsync(command.TeamId,ct);
        }
    }
}
