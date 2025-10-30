using Api.Features.Team.Command;
using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Team.Endpoint
{
    public class DeleteTeamEndpoint : Endpoint<DeleteTeamCommand>
    {
        private readonly AppDbContext _dbContext;
    

    public DeleteTeamEndpoint(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public override void Configure()
        {
            Delete("/team/{TeamId}");
            AllowAnonymous();
        }
         
        public override async Task HandleAsync(DeleteTeamCommand command, CancellationToken ct)
        {
            Console.WriteLine($"Received TeamId:{command.TeamId}");

            var team = await _dbContext.Teams
                .FirstOrDefaultAsync(t => t.Id == command.TeamId, ct);
            if (team == null)
            {
                throw new Exception("Team non presente");
            }

            _dbContext.Teams.Remove(team);
            await _dbContext.SaveChangesAsync(ct);

            await SendOkAsync();
        }
    }
}


   
