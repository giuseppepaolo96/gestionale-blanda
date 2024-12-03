using FastEndpoints;

namespace Api.Features.Color
{
    public class GetColorsEndpoint : EndpointWithoutRequest<List<string>>
    {
        private readonly ColorGradientService _colorGradientService;

        public GetColorsEndpoint(ColorGradientService colorGradientService)
        {
            _colorGradientService = colorGradientService;
        }

        public override void Configure()
        {
            Get("/api/colors");
            AllowAnonymous();
        }

        public override Task HandleAsync(CancellationToken ct)
        {
            var colors = _colorGradientService.GetColors();
            return SendAsync(colors, cancellation: ct);
        }
    }
}
