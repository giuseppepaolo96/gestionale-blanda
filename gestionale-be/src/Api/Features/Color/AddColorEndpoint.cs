//using FastEndpoints;
//using Microsoft.AspNetCore.SignalR;

//namespace Api.Features.Color
//{
//    public class AddColorEndpoint : Endpoint<string>
//    {
//        private readonly ColorGradientService _colorGradientService;
//        private readonly IHubContext<ScoreHub> _hubContext;

//        public AddColorEndpoint(ColorGradientService colorGradientService, IHubContext<ScoreHub> hubContext)
//        {
//            _colorGradientService = colorGradientService;
//            _hubContext = hubContext;
//        }

//        public override void Configure()
//        {
//            Post("/api/colors");
//        }

//        public override async Task HandleAsync(string color, CancellationToken ct)
//        {
//            _colorGradientService.AddColor(color);
//            await _hubContext.Clients.All.SendAsync("ReceiveColorUpdate",
//                new { Colors = _colorGradientService.GetColors(), Gradients = _colorGradientService.GetGradients() });
//            await SendOkAsync(cancellation: ct);
//        }
//    }
//}