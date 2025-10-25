using Api.Infrastructure.Data;
using Api.Services;
using FastEndpoints;

namespace Api.Features.File.Command
{
    public class DeleteFileCommand : ICommand
    {
        public int FileRecordsId { get; set; }
    }

    public class DeleteFileCommandHandler : ICommandHandler<DeleteFileCommand>
    {
        private readonly AppDbContext _dbContext;
        private readonly DeleteService _deleteService;

        public DeleteFileCommandHandler (DeleteService deleteService)
        {
            _deleteService = deleteService;
        }

        public async Task ExecuteAsync(DeleteFileCommand command,CancellationToken ct)
        {
            await _deleteService.DeleteFileAsync(command.FileRecordsId, ct);
        }
    }
}
