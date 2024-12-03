using System.Security.Claims;

namespace Api.Services;

public class User : IUser
{
    private readonly IHttpContextAccessor _contextAccessor; 
    public User(IHttpContextAccessor contextAccessor)
    {
        _contextAccessor = contextAccessor;
    }
    
    public string? Id => _contextAccessor?.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
}