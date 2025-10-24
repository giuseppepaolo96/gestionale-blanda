using Api.Entities;
using Api.Features.GetMatchData.Command;
using Api.Infrastructure.Data;
using Api.Services;
using FastEndpoints;

namespace Api.Features.GetMatchData.Endpoint
{
    public class DeleteMatchDataEndpoint : EndpointWithoutRequest
    {
        private readonly DeleteService _deleteService;

        public DeleteMatchDataEndpoint(DeleteService deleteService)
        {
            _deleteService = deleteService;
        }

        public override void Configure()
        {
            Delete("/matchData");
            AllowAnonymous();

        }

        public override async Task HandleAsync(CancellationToken ct)
        {
            await _deleteService.DeleteAllEntitiesAsync<MatchData>(ct);

            await SendOkAsync("Tabella MatchData svuotata correttamente.");
        }
    }
    
}
