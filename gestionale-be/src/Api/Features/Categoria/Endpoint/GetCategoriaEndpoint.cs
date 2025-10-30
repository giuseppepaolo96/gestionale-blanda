using Api.Features.Categoria.Command;
using FastEndpoints;

namespace Api.Features.Categoria.Endpoint
{
    public class GetCategoriaEndpoint : EndpointWithoutRequest<List<Entities.Categoria>>
    {
        public override void Configure()
        {
            Get("/api/categoria");
            AllowAnonymous();
        }

        public override async Task<List<Entities.Categoria>>ExecuteAsync(CancellationToken ct)
        {
            var result = await new GetCategoriaCommand().ExecuteAsync(ct);
            return result;
        }
    }
}
