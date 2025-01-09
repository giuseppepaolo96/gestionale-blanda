//using Api.Features.WebSocket;
//using FastEndpoints;

//namespace Api.Features.Color
//{
//    public class GetGradientsEndpoint : EndpointWithoutRequest<List<Gradient>>
//    {
//        private readonly ColorGradientService _colorGradientService;

//        public GetGradientsEndpoint(ColorGradientService colorGradientService)
//        {
//            _colorGradientService = colorGradientService;
//        }

//        public override void Configure()
//        {
//            Get("/api/gradients");
//            AllowAnonymous();
//        }

//        public override Task HandleAsync(CancellationToken ct)
//        {
//            var gradients = _colorGradientService.GetGradients();
//            return SendAsync(gradients, cancellation: ct);
//        }
//    }
//}
