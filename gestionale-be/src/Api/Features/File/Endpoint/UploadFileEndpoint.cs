using Api.Features.UploadFile.Command;
using FastEndpoints;

namespace Api.Features.File.Endpoint
{
    public class UploadFileEndpointpublic  : Endpoint<UploadFileCommand, IResult>
    {
        public override void Configure()
        {
            Post("file/upload-file");
            AllowFileUploads();
            AllowAnonymous();

        }
        public async override Task<IResult> ExecuteAsync(UploadFileCommand req, CancellationToken ct)
        {
            return await req.ExecuteAsync(ct);
        }
    }
}
