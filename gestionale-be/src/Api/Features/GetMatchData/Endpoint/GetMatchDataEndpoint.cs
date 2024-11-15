using Api.Features.GetMatchData.Command;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.GetMatchData.Endpoint
{
    public class GetMatchDataEndpoint : EndpointWithoutRequest<List<Entities.MatchData>>
    {
        public override void Configure()
        {
            Get("/api/match-data");
            AllowAnonymous();
        }
        public override async Task<List<Entities.MatchData>> ExecuteAsync(CancellationToken ct)
        {
            var result = await new GetMatchDataCommand().ExecuteAsync(ct);
            return result;
        }
    }

}