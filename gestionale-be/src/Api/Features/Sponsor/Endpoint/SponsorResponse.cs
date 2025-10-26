namespace Api.Features.Sponsor.Endpoint
{
    public class SponsorResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } // Nome dello sponsor
        public string LogoBase64 { get; set; } // Logo in formato Base64
    }
}
