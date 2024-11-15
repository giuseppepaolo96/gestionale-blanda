using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Team.Command
{
    public class GetTeamCommand : ICommand<List<Entities.Team>>
    {
    }

    public class GetTeamCommandHandler(AppDbContext appDbContext ) : ICommandHandler<GetTeamCommand,List<Entities.Team>>
    {
        public async Task<List<Entities.Team>> ExecuteAsync(GetTeamCommand command,CancellationToken ct)
        {
            List<Entities.Team> teams = await appDbContext.Teams.OrderBy(t=>t.Name).ToListAsync(ct);
            return teams;
        }
    }
}
