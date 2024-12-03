using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

public class Middleware
{
    private readonly RequestDelegate _next;

    public Middleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var origin = context.Request.Headers["Origin"].ToString();

        // Verifica se l'header Origin contiene la porta 4203
        if (origin.Contains(":4203"))
        {
            context.Response.Headers.Add("Access-Control-Allow-Origin", origin);
            context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Signalr-User-Agent");
            context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
        }

        // Se la richiesta è di tipo OPTIONS (pre-flight), rispondi immediatamente
        if (context.Request.Method == "OPTIONS")
        {
            context.Response.StatusCode = 204; // No Content
            return;
        }

        // Passa al prossimo middleware
        await _next(context);
    }
}
