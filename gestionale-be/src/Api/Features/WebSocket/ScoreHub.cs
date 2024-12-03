using Api.Features.WebSocket;
using Microsoft.AspNetCore.SignalR;


public class ScoreHub : Hub
{
    // Metodo per inviare un aggiornamento completo del punteggio e delle informazioni del match
    public async Task UpdateScore(MatchUpdate matchUpdate) 
    {
        // Invia a tutti i client connessi l'aggiornamento completo
        await Clients.All.SendAsync("ReceiveScoreUpdate", matchUpdate);
    }

    public async Task UpdateColors(List<string> colors)
    {
        var colorUpdate = new
        {
            Colors = colors,
            Gradients = colors.Select((color, index) => new
            {
                GradientId = index + 1,
                GradientStyle = $"linear-gradient(to right, {color}, #FFFFFF)"
            }).ToList()
        };

        await Clients.All.SendAsync("ReceiveColorUpdate", colorUpdate);
    }
    // Metodo per notificare i client quando un nuovo utente si connette
    public override async Task OnConnectedAsync()
    {
        // Invia una notifica di connessione riuscita al client che si è appena connesso
        await Clients.Caller.SendAsync("ConnectionEstablished", "Connesso al server SignalR!");
        await base.OnConnectedAsync();

    }

    // Metodo per gestire la disconnessione
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Aggiungi logica per la disconnessione se necessario
        await base.OnDisconnectedAsync(exception);
    }
}
