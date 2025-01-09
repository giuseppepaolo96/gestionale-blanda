//using Api.Features.Color;
//using Api.Features.WebSocket;
//using FastEndpoints;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.SignalR;

//public class AddGradientEndpoint : Endpoint<Gradient>
//{
//    private readonly ColorGradientService _colorGradientService;
//    private readonly IHubContext<ScoreHub> _hubContext;

//    public AddGradientEndpoint(ColorGradientService colorGradientService, IHubContext<ScoreHub> hubContext)
//    {
//        _colorGradientService = colorGradientService;
//        _hubContext = hubContext;
//    }

//    public override void Configure()
//    {
//        Post("/api/gradients");
//    }

//    public override async Task HandleAsync(Gradient gradient, CancellationToken ct)
//    {
//        _colorGradientService.AddGradient(gradient);
//        await _hubContext.Clients.All.SendAsync("ReceiveColorUpdate",
//            new { Colors = _colorGradientService.GetColors(), Gradients = _colorGradientService.GetGradients() });
//        await SendOkAsync(cancellation: ct);
//    }
//}
