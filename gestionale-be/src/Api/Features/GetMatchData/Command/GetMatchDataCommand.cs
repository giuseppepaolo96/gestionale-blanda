using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.GetMatchData.Command
{
    public class GetMatchDataCommand : ICommand<List<Entities.MatchData>>
    {
    }
    public class GetMatchDataCommandHandler (AppDbContext appDbContext) : ICommandHandler<GetMatchDataCommand, List<Entities.MatchData>>
    {
        public async Task<List<Entities.MatchData>> ExecuteAsync(GetMatchDataCommand command , CancellationToken ct)
        {
            List<Entities.MatchData> matchDatas = await appDbContext.MatchData.OrderBy(d =>d.MatchNumber).ToListAsync(ct);
            return matchDatas;
        }
    }
}
