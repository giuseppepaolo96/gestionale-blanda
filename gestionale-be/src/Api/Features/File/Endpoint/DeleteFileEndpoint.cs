using Api.Features.File.Command;
using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.File.Endpoint
{
    public class DeleteFileEndpoint : Endpoint<DeleteFileCommand>
    {

        //Connessione al db
        private readonly AppDbContext _dbContext;

        public DeleteFileEndpoint(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public override void Configure()
        {
            Delete("/file/{FileRecordsId}");
            AllowAnonymous();
        }

        public override async Task HandleAsync(DeleteFileCommand command, CancellationToken ct)
        {
            Console.WriteLine($"Received FileRecordsId:{command.FileRecordsId}");
            var fileRecord = await _dbContext.FileRecords
                .FirstOrDefaultAsync(t => t.Id == command.FileRecordsId, ct);
            if (fileRecord == null)
            {
                throw new Exception("File non presente");
            }

            _dbContext.FileRecords.Remove(fileRecord);
            await _dbContext.SaveChangesAsync(ct);

            await SendOkAsync();
        }
    }
}
