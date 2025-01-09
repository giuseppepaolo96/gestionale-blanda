using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.File.Command
{
    public class GetFileCommand : ICommand<List<Entities.FileRecord>>
    {
    }

    public class GetFileCommandHandler (AppDbContext appDbContext) : ICommandHandler<GetFileCommand , List<Entities.FileRecord>>
    {
        public async Task<List<Entities.FileRecord>> ExecuteAsync (GetFileCommand command , CancellationToken ct)
        {
            List<Entities.FileRecord> records = await appDbContext.FileRecords.OrderBy(f => f.Id).ToListAsync(ct);
            return records;
        }
    }
    
}


