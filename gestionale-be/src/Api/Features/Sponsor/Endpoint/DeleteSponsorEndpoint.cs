using Api.Features.Sponsor.Command;
using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Sponsor.Endpoint
{
    public class DeleteSponsorEndpoint : Endpoint<DeleteSponsorCommand>
    {
        private readonly AppDbContext _dbContext;

        public DeleteSponsorEndpoint(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public override void Configure()
        {
            Delete("/sponsor/{SponsorId}");
                AllowAnonymous();
        }
         
        public override async Task HandleAsync(DeleteSponsorCommand command, CancellationToken ct)
        {
            Console.WriteLine($"Received SponsorId:{command.SponsorId}");

            var sponsor = await _dbContext.Sponsors
                .FirstOrDefaultAsync(t => t.Id == command.SponsorId, ct);

            if (sponsor == null)
            {
                throw new Exception("Sponsor non presente");
            }

            _dbContext.Sponsors.Remove(sponsor);
            await _dbContext.SaveChangesAsync(ct);

            await SendOkAsync();

        }
    }
}

