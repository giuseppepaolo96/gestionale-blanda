using Api.Infrastructure.Data;
using Api.Services;
using FastEndpoints;

namespace Api.Features.Sponsor.Command
{
    public class DeleteSponsorCommand : ICommand
    {
       public int SponsorId { get; set; }
    }

    public class DeleteSponsorCommandHandler : ICommandHandler<DeleteSponsorCommand>
    {
        private readonly AppDbContext _dbContext;
        private readonly DeleteService _deleteService;


        public DeleteSponsorCommandHandler(DeleteService deleteService)
        {
            _deleteService = deleteService;
        }
         
        public async Task ExecuteAsync(DeleteSponsorCommand command,CancellationToken ct)
        {
            await _deleteService.DeleteSponsorAsync(command.SponsorId, ct);
        }
    }
}
