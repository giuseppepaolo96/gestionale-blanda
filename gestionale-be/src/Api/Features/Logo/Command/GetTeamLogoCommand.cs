using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;
namespace Api.Features.Logo.Command
{
    public class GetTeamLogoCommand : ICommand<List<Entities.Team>>
    {
        public string? NameFilter { get; set; } // Filtro opzionale per il nome della squadra
    }

    public class GetTeamLogoCommandHandler : ICommandHandler<GetTeamLogoCommand, List<Entities.Team>>
    {
        private readonly AppDbContext _appDbContext;

        public GetTeamLogoCommandHandler(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public async Task<List<Entities.Team>> ExecuteAsync(GetTeamLogoCommand command, CancellationToken ct)
        {
            var query = _appDbContext.Teams.AsQueryable();

            if (!string.IsNullOrEmpty(command.NameFilter))
            {
                query = query.Where(t => t.Name.Contains(command.NameFilter));
            }

            List<Entities.Team> teams = await query
                .OrderBy(t => t.Name)
                .Select(t => new Entities.Team
                {
                    Id = t.Id,
                    Name = t.Name,
                    Logo = t.Logo // Solo il logo e il nome
                })
                .ToListAsync(ct);

            return teams;
        }
    }
}
