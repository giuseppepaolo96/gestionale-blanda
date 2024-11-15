using Api.Features.Sponsor.Command;
using FastEndpoints;

namespace Api.Features.Sponsor.Endpoint
{
    public class GetSponsorEndpoint : EndpointWithoutRequest<List<Entities.Sponsor>>
    {
        public override void Configure()
        {
           Get("/api/sponsor");
           AllowAnonymous();
        }

        public override async Task<List<Entities.Sponsor>> ExecuteAsync (CancellationToken ct)
        {
            var result = await new GetSponsorCommand().ExecuteAsync (ct);
            return result;
        }
    }
}
