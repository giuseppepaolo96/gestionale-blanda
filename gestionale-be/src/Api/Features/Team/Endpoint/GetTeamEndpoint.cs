using Api.Features.Team.Command;
using FastEndpoints;

namespace Api.Features.Team.Endpoint
{
    public class GetTeamEndpoint : EndpointWithoutRequest<List<Entities.Team>>
    {
        public override void Configure()
        {
            Get("/api/team");
            AllowAnonymous();
        }
        public override async Task<List<Entities.Team>> ExecuteAsync(CancellationToken ct)
        {
            var result = await new GetTeamCommand().ExecuteAsync(ct);
            return result;
        }
    }
}
