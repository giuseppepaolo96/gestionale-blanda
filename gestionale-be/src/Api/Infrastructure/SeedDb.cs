using Api.Entities;
using Api.Infrastructure.Data;
using Newtonsoft.Json;

namespace Api.Infrastructure
{
    public class SeedDb(AppDbContext _dbContext)
    {
        public async Task SeedDataAsync()
        {
            if (!_dbContext.Categorie.Any())
            {
                var categoria = JsonConvert.DeserializeObject<List<Categoria>>(File.ReadAllText("Infrastructure/Resources/Categoria.json"))!;
                _dbContext.Categorie.AddRange(categoria);
                await _dbContext.SaveChangesAsync();
            }

            if (!_dbContext.Roles.Any())
            {
                var role = JsonConvert.DeserializeObject<List<Role>>(File.ReadAllText("Infrastructure/Resources/Role.json"))!;
                _dbContext.Roles.AddRange(role);
                await _dbContext.SaveChangesAsync();
            }
        }
    }
}
