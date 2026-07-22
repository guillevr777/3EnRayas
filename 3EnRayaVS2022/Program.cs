using _3EnRaya.Domain.Interfaces;
using _3EnRaya.Hubs;
using _3EnRaya.UseCases;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IGestionJuegoUseCase, GestionJuegoUseCase>();
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("OpenCors", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseWebSockets();
app.UseStaticFiles();
app.UseRouting();

app.UseCors("OpenCors");

app.MapHub<JuegoHub>("/juegoHub");

app.Run();