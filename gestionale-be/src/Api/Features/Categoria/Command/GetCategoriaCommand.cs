using Api.Infrastructure.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Categoria.Command
{
    public class GetCategoriaCommand : ICommand<List<Entities.Categoria>>
    {
    }

    public class GetCategoriaCommandHandler(AppDbContext dbContext) : ICommandHandler<GetCategoriaCommand, List<Entities.Categoria>>
    {

        public async Task<List<Entities.Categoria>> ExecuteAsync(GetCategoriaCommand command, CancellationToken ct)
        {
            List<Entities.Categoria> categorias = await dbContext.Categorie.OrderBy(c => c.Nome).ToListAsync(ct);
            return categorias;
        }
    }
}
