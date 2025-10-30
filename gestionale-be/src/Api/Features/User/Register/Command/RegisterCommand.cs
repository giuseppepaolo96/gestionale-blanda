using Api.Entities;
using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.User.Register.Command
{
    public class RegisterCommand : ICommand<IResult>
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }

        public List<CategoriaDto> Categorias { get; set; } = new List<CategoriaDto>();


        public class CategoriaDto
        {
            public Guid Id { get; set; }
            public string Nome { get; set; }
        }
    }

    public class RegisterCommandHandler : ICommandHandler<RegisterCommand, IResult>
    {
        private readonly UserManager<Entities.User> _userManager;
        private readonly SignInManager<Entities.User> _signInManager;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<RegisterCommandHandler> _logger;

        public RegisterCommandHandler(
            UserManager<Entities.User> userManager,
            SignInManager<Entities.User> signInManager,
            AppDbContext dbContext,
            ILogger<RegisterCommandHandler> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<IResult> ExecuteAsync (RegisterCommand command,CancellationToken ct)
        {
            _logger.LogInformation("Esecuzione del comando di registrazione per l'email: {Email}", command.Email);
            _logger.LogInformation("Payload ricevuto: {@Command}", command);

            if (string.IsNullOrEmpty(command.Email) )
            {
                _logger.LogError("Email mancante");
                return Results.BadRequest("Email obbligatoria.");
            }

            var userInDB = await _userManager.FindByEmailAsync(command.Email);
            if (userInDB != null)
            {
                _logger.LogWarning("Registrazione fallita. Utente con email {Email} già registrato.", command.Email);
                return Results.Conflict("Registrazione fallita. Utente già registrato.");
            }

            var tempPassword = Guid.NewGuid().ToString().Substring(0, 10);

            if (!command.Categorias.Any())
            {
                _logger.LogError("Nessun ID categoria fornito");
                return Results.BadRequest("ID categoria non valido.");
            }

            var categoria = await _dbContext.Categorie.FindAsync(command.Categorias.First().Id);
            if (categoria == null)
            {
                _logger.LogError("Categoria con ID {CategoriaId} non trovata", command.Categorias.First().Id);
                return Results.NotFound("Categoria con questo ID non esiste");
            }

            var user = new Entities.User
            {
                UserName = command.Email,
                Email = command.Email,
                EmailTokenIssue = DateTime.UtcNow,
                EmailToken = Guid.NewGuid(),
                IsEmailConfirmed = false,
                IsActivated = false,
                Profile = new Profile
                {
                    FirstName = command.FirstName,
                    LastName = command.LastName,
                    RoleId = Guid.NewGuid(),
                    Categorias = command.Categorias.Select(c => new Api.Entities.Categoria
                    {
                        Id = c.Id,
                        Nome = c.Nome
                    }).ToList()
                }
            };
        
            _logger.LogInformation("Utente da creare: {@User}", user);

            var createResult = await _userManager.CreateAsync(user, tempPassword);
            if (!createResult.Succeeded)
            {
                _logger.LogError("Errore durante la creazione dell'utente: {Errors}", string.Join(", ", createResult.Errors.Select(e => e.Description)));
                return Results.BadRequest(createResult.Errors.Select(e => e.Description));
            }

            _logger.LogInformation("Utente creato con successo: {Email}", command.Email);
            return Results.Ok("Registrazione avvenuta con successo");
        }
    }
}
