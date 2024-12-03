using Api.Features.Sponsor.Command;
using FastEndpoints;

namespace Api.Features.Sponsor.Endpoint
{
    public class GetSponsorEndpoint : EndpointWithoutRequest<List<SponsorResponse>>
    {
        private readonly GetSponsorCommandHandler _commandHandler;

        public GetSponsorEndpoint(GetSponsorCommandHandler commandHandler)
        {
            _commandHandler = commandHandler;
        }

        public override void Configure()
        {
           Get("/api/sponsor");
           AllowAnonymous();
        }

        public override async Task<List<SponsorResponse>> ExecuteAsync(CancellationToken ct)
        {
            // Esegui il comando per ottenere la lista degli sponsor
            var command = new GetSponsorCommand();
            var sponsors = await _commandHandler.ExecuteAsync(command, ct);

            return sponsors; // Restituisci la lista di sponsor
        }
    }
}
