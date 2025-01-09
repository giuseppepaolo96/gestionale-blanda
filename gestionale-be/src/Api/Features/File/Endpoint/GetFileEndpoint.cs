using Api.Features.File.Command;
using FastEndpoints;

namespace Api.Features.File.Endpoint
{
    public class GetFileEndpoint : EndpointWithoutRequest<List<Entities.FileRecord>>
    {
        public override void Configure()
        {
            Get("api/get-file");
            AllowAnonymous();
        }

        public override async Task<List<Entities.FileRecord>> ExecuteAsync (CancellationToken ct)
        {
            var result = await new GetFileCommand().ExecuteAsync(ct);
            return result;
        }
    }
}



