using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.GetMatchData.Command
{
    public class GetMatchDataCommand : ICommand<List<Entities.MatchData>>
    {
        public int? MatchNumber { get; set; }  // MatchNumber è opzionale
    }

    public class GetMatchDataCommandHandler : ICommandHandler<GetMatchDataCommand, List<Entities.MatchData>>
    {
        private readonly AppDbContext _appDbContext;

        // Iniezione di AppDbContext nel costruttore
        public GetMatchDataCommandHandler(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public async Task<List<Entities.MatchData>> ExecuteAsync(GetMatchDataCommand command, CancellationToken ct)
        {
            // Iniziamo la query senza filtri
            IQueryable<Entities.MatchData> query = _appDbContext.MatchData
                .Include(md => md.HomeTeam)  // Include il riferimento alla squadra di casa
                .Include(md => md.AwayTeam)  // Include il riferimento alla squadra ospite
                .OrderBy(md => md.MatchNumber); // Ordina per MatchNumber

            // Se MatchNumber è presente, filtra per quel valore
            if (command.MatchNumber.HasValue)
            {
                query = query.Where(md => md.MatchNumber == command.MatchNumber.Value);
            }

            // Esegui la query
            List<Entities.MatchData> matchDatas = await query.ToListAsync(ct);

            // Elaborazione dei dati (opzionale)
            foreach (var match in matchDatas)
            {
                if (match.HomeTeam != null)
                {
                    match.HomeTeam.Name = match.HomeTeam.Name;  // Nome squadra di casa
                }
                if (match.AwayTeam != null)
                {
                    match.AwayTeam.Name = match.AwayTeam.Name;  // Nome squadra ospite
                }
            }

            return matchDatas;
        }
    }
}
