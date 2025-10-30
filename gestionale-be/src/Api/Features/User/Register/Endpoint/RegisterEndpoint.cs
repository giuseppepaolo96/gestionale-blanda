using Api.Features.User.Register.Command;
using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.AspNetCore.Identity;

namespace Api.Features.User.Register.Endpoint
{
    public class RegisterEndpoint : Endpoint<RegisterCommand, IResult>
    {
        private readonly UserManager<Entities.User> _userManager;
        private readonly SignInManager<Entities.User> _signInManager;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<RegisterCommandHandler> _logger;

        public RegisterEndpoint(UserManager<Entities.User> userManager, SignInManager<Entities.User> signInManager, AppDbContext dbContext, ILogger<RegisterCommandHandler> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _dbContext = dbContext;
            _logger = logger;
        }
        public override void Configure()
        {
            Post("/api/register");
            AllowAnonymous();
        }

        public override async Task<IResult> HandleAsync(RegisterCommand command, CancellationToken ct)
        {
            var result = await new RegisterCommandHandler(_userManager, _signInManager, _dbContext , _logger).ExecuteAsync(command, ct);
            return result;
        }
    }
}
