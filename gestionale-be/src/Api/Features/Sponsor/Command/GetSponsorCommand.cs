using Api.Features.Sponsor.Endpoint;
using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;


namespace Api.Features.Sponsor.Command
{
    public class GetSponsorCommand : ICommand<List<SponsorResponse>> 
        { }

// Handler
public class GetSponsorCommandHandler : ICommandHandler<GetSponsorCommand, List<SponsorResponse>>
{
    private readonly AppDbContext _appDbContext;

    // Iniezione del contesto del database
    public GetSponsorCommandHandler(AppDbContext appDbContext)
    {
        _appDbContext = appDbContext;
    }

    // Esegui il comando
    public async Task<List<SponsorResponse>> ExecuteAsync(GetSponsorCommand command, CancellationToken ct)
    {
        // Recupera gli sponsor dal database
        var sponsors = await _appDbContext.Sponsors
            .OrderBy(s => s.Id)
            .ToListAsync(ct);

        // Mappa ogni sponsor a un DTO, convertendo il logo in Base64
        var sponsorDtos = sponsors.Select(s => new SponsorResponse
        {
            Id = s.Id,
            Name = s.Name,
            LogoBase64 = s.SponsorLogo != null
                        ? $"data:image/png;base64,{Convert.ToBase64String(s.SponsorLogo)}"
                        : null // Se non esiste il logo, lasciamo null
        }).ToList();

        return sponsorDtos; // Restituisci la lista di sponsor DTO
    }
}
}