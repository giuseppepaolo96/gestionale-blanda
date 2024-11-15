using Api.Features.GetMatchData.Command;
using Api.Features.Logo.Command;
using FastEndpoints;

namespace Api.Features.Logo.Endpoint
{
    public class GetTeamLogoEndpoint : EndpointWithoutRequest<List<Entities.Team>>
        {
        public override void Configure()
        {
            Get("/api/logo");
            AllowAnonymous();
        }

        public override async Task<List<Entities.Team>> ExecuteAsync(CancellationToken ct)
        {
            var result = await new GetTeamLogoCommand().ExecuteAsync(ct);
            return result;
        }

    }
}

