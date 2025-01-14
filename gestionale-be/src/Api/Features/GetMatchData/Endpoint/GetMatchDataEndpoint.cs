using Api.Features.GetMatchData.Command;
using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.GetMatchData.Endpoint
{
    public class GetMatchDataRequest
    {
        public int? MatchNumber { get; set; }
    }

    public class GetMatchDataEndpoint : Endpoint<GetMatchDataRequest, List<Entities.MatchData>>
    {
        private readonly AppDbContext _appDbContext;

        // Iniezione di AppDbContext
        public GetMatchDataEndpoint(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public override void Configure()
        {
            // URL con parametro opzionale
            Get("/api/match-data/");
            AllowAnonymous();
        }

        public override async Task<List<Entities.MatchData>> ExecuteAsync(GetMatchDataRequest request, CancellationToken ct)
        {
            // Passa il parametro matchNumber (che potrebbe essere nullo) al comando
            var command = new GetMatchDataCommand { MatchNumber = request.MatchNumber };

            // Esegui il comando con AppDbContext
            var result = await new GetMatchDataCommandHandler(_appDbContext).ExecuteAsync(command, ct);
            return result;
        }
    }
}
