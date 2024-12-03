using Api.Features.Color;
using FastEndpoints;
using Microsoft.AspNetCore.SignalR;

public class RemoveColorEndpoint : Endpoint<string>
{
    private readonly ColorGradientService _colorGradientService;
    private readonly IHubContext<ScoreHub> _hubContext;

    public RemoveColorEndpoint(ColorGradientService colorGradientService, IHubContext<ScoreHub> hubContext)
    {
        _colorGradientService = colorGradientService;
        _hubContext = hubContext;
    }

    public override void Configure()
    {
        Delete("/api/colors");
    }

    public override async Task HandleAsync(string color, CancellationToken ct)
    {
        _colorGradientService.RemoveColor(color);
        await _hubContext.Clients.All.SendAsync("ReceiveColorUpdate",
            new { Colors = _colorGradientService.GetColors(), Gradients = _colorGradientService.GetGradients() });
        await SendOkAsync(cancellation: ct);
    }
}
