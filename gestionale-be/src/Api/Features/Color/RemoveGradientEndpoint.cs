//using Api.Features.Color;
//using FastEndpoints;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.SignalR;

//public class RemoveGradientEndpoint : Endpoint<RemoveGradientRequest>
//{
//    private readonly ColorGradientService _colorGradientService;
//    private readonly IHubContext<ScoreHub> _hubContext;

//    public RemoveGradientEndpoint(ColorGradientService colorGradientService, IHubContext<ScoreHub> hubContext)
//    {
//        _colorGradientService = colorGradientService;
//        _hubContext = hubContext;
//    }

//    public override void Configure()
//    {
//        Delete("/api/gradients");
//    }

//    public override async Task HandleAsync(RemoveGradientRequest request, CancellationToken ct)
//    {
//        _colorGradientService.RemoveGradient(request.GradientId);
//        await _hubContext.Clients.All.SendAsync("ReceiveColorUpdate",
//            new { Colors = _colorGradientService.GetColors(), Gradients = _colorGradientService.GetGradients() });
//        await SendOkAsync(cancellation: ct);
//    }
//}
