//using Api.Features.GetMatchData.Command;
//using Api.Features.Logo.Command;
//using Api.Features.Sponsor.Command;
//using Api.Features.UploadFile.Command;
//using Api.Infrastructure;
//using Api.Infrastructure.Data;
//using Api.Infrastructure.Data.Interceptors;
//using Api.Services;
//using FastEndpoints;
//using FastEndpoints.Swagger;
//using Microsoft.AspNetCore.Http.Features;
//using Microsoft.AspNetCore.Identity;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore.Diagnostics;
//using System.Net.Sockets;


//var builder = WebApplication.CreateBuilder(args);


//builder.Services.AddAuthentication(options =>
//{
//    options.DefaultAuthenticateScheme = "YourScheme";
//    options.DefaultChallengeScheme = "YourScheme";
//})
//.AddCookie("YourScheme", options =>
//{
//    options.LoginPath = "/login"; // Imposta il percorso per la login
//    options.LogoutPath = "/logout"; // Imposta il percorso per il logout
//});

//// Registrazione dei servizi CORS
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowSpecificOrigins", policyBuilder =>
//    {
//        policyBuilder
//            .WithOrigins("http://13.60.136.85", "http://localhost:3001")
//            .AllowAnyHeader()
//            .AllowAnyMethod()
//            .AllowCredentials()
//            .WithExposedHeaders("Authorization");
//    });
//});

//// Configurazione delle dimensioni massime per i file
//builder.Services.Configure<FormOptions>(options =>
//{
//    options.MultipartBodyLengthLimit = 104857600; // 100 MB
//});

//builder.Services.AddHttpContextAccessor();
//builder.Services.AddAuthorization();

//builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();

//builder.Services.AddDbContext<AppDbContext>((sp, options) =>
//{
//    var connectionString = builder.Configuration.GetConnectionString("MariaDbConnection");
//    if (string.IsNullOrEmpty(connectionString))
//    {
//        throw new ArgumentNullException("La stringa di connessione al database è mancante.");
//    }

//    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
//           .AddInterceptors(sp.GetRequiredService<ISaveChangesInterceptor>());
//});

//builder.Services.AddIdentity<Api.Entities.User, IdentityRole>(options =>
//{
//    // configurazioni opzionali password, lockout, ecc.
//})
//.AddEntityFrameworkStores<AppDbContext>()
//.AddDefaultTokenProviders();


//builder.Services.AddTransient<IUser, CurrentUser>();
//builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
//builder.Services.AddFastEndpoints().SwaggerDocument();
//// servizio SignalR per il websocket
//builder.Services.AddSignalR();


//builder.Services.AddTransient<GetTeamLogoCommand>();
//builder.Services.AddTransient<UploadFileCommand>();
//builder.Services.AddTransient<GetMatchDataCommand>();
//builder.Services.AddTransient<GetSponsorCommand>();
//builder.Services.AddTransient<GetSponsorCommandHandler>();





//var app = builder.Build();

//// Applica la policy CORS


//using (var scope = app.Services.CreateScope())
//{
//    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//    dbContext.Database.Migrate();
//}

//app.UseRouting();
//app.UseCors("AllowSpecificOrigins");
//app.UseAuthentication();
//app.UseAuthorization();

//app.UseFastEndpoints();

//app.UseSwaggerGen();
//app.UseEndpoints(endpoints =>
//{
//    endpoints.MapHub<ScoreHub>("/scoreHub");
//});
//app.UseDeveloperExceptionPage();

//app.Run("http://0.0.0.0:8080");


using Api.Features.GetMatchData.Command;
using Api.Features.Logo.Command;
using Api.Features.Sponsor.Command;
using Api.Features.UploadFile.Command;
using Api.Infrastructure;
using Api.Infrastructure.Data;
using Api.Infrastructure.Data.Interceptors;
using Api.Services;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
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
    options.LoginPath = "/login";
    options.LogoutPath = "/logout";
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactDev", policyBuilder =>
    {
        policyBuilder
            .WithOrigins("http://13.60.136.85","http://localhost:3001", "http://127.0.0.1:3001")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithExposedHeaders("Authorization");
    });
});


builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100MB
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthorization();

builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
builder.Services.AddScoped<DeleteService>();
builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    var connectionString = builder.Configuration.GetConnectionString("MariaDbConnection")
        ?? throw new ArgumentNullException("La stringa di connessione al database è mancante.");
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
           .AddInterceptors(sp.GetRequiredService<ISaveChangesInterceptor>());
});

builder.Services.AddIdentity<Api.Entities.User, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddTransient<IUser, CurrentUser>();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddFastEndpoints().SwaggerDocument();
builder.Services.AddSignalR(options =>
{
    options.KeepAliveInterval = TimeSpan.FromSeconds(10);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});


builder.Services.AddTransient<GetTeamLogoCommand>();
builder.Services.AddTransient<UploadFileCommand>();
builder.Services.AddTransient<GetMatchDataCommand>();
builder.Services.AddTransient<GetSponsorCommand>();
builder.Services.AddTransient<GetSponsorCommandHandler>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    //dbContext.Database.Migrate();

    var seeder = new SeedDb(dbContext);
    await seeder.SeedDataAsync();
}

app.UseDeveloperExceptionPage();


app.UseRouting();

app.UseCors("AllowReactDev"); 

app.UseAuthentication();
app.UseAuthorization();

app.UseFastEndpoints();

app.UseSwaggerGen();

app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<ScoreHub>("/scoreHub");
});

app.Run("http://0.0.0.0:8080");
