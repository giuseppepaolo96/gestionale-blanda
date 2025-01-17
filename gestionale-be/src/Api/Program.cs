using Api.Features.GetMatchData.Command;
using Api.Features.Logo.Command;
using Api.Features.Sponsor.Command;
using Api.Features.UploadFile.Command;
using Api.Infrastructure.Data;
using Api.Infrastructure.Data.Interceptors;
using Api.Services;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "YourScheme";
    options.DefaultChallengeScheme = "YourScheme";
})
.AddCookie("YourScheme", options =>
{
    options.LoginPath = "/login"; // Imposta il percorso per la login
    options.LogoutPath = "/logout"; // Imposta il percorso per il logout
});

// Registrazione dei servizi CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policyBuilder =>
    {
        policyBuilder
            .WithOrigins("http://13.60.136.85", "http://localhost:3001")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithExposedHeaders("Authorization");
    });
});

// Configurazione delle dimensioni massime per i file
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100 MB
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthorization();

builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();

builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    var connectionString = builder.Configuration.GetConnectionString("MariaDbConnection");
    if (string.IsNullOrEmpty(connectionString))
    {
        throw new ArgumentNullException("La stringa di connessione al database è mancante.");
    }

    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
           .AddInterceptors(sp.GetRequiredService<ISaveChangesInterceptor>());
});

builder.Services.AddTransient<IUser, User>();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddFastEndpoints().SwaggerDocument();
// servizio SignalR per il websocket
builder.Services.AddSignalR();


builder.Services.AddTransient<GetTeamLogoCommand>();
builder.Services.AddTransient<UploadFileCommand>();
builder.Services.AddTransient<GetMatchDataCommand>();
builder.Services.AddTransient<GetSponsorCommand>();
builder.Services.AddTransient<GetSponsorCommandHandler>();



var app = builder.Build();

// Applica la policy CORS


using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // Applica le migrazioni
    dbContext.Database.Migrate();
}

app.UseCors("AllowSpecificOrigins");
app.UseAuthentication();
app.UseAuthorization();
app.UseRouting();
app.UseFastEndpoints();

app.UseSwaggerGen();
app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<ScoreHub>("/scoreHub");
});

app.Run("http://0.0.0.0:8080");
