using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;


namespace Api.Features.Sponsor.Command
{
    public class GetSponsorCommand : ICommand<List<Entities.Sponsor>>
    {
    }

    public class GetSponsorCommandHandler (AppDbContext appDbContext) : ICommandHandler<GetSponsorCommand,List<Entities.Sponsor>>
    {
        public async Task<List<Entities.Sponsor>> ExecuteAsync(GetSponsorCommand command , CancellationToken ct)
        {
            List<Entities.Sponsor> sponsors = await appDbContext.Sponsors.OrderBy(s=>s.Id).ToListAsync();
            return sponsors;
        }
    }
    

}