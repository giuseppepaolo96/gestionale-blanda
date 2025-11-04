using Api.Features.WebSocket;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;


public class ScoreHub : Hub
{
    // Metodo per inviare un aggiornamento completo del punteggio e delle informazioni del match

    private static readonly ConcurrentDictionary<string, MatchUpdate> _latestUpdates = new();
    public async Task UpdateScore(MatchUpdate matchUpdate) 
    {
        if (string.IsNullOrEmpty(matchUpdate.MatchId))
            return;

        // Recupera l'ultima versione inviata
        if (_latestUpdates.TryGetValue(matchUpdate.MatchId, out var lastUpdate))
        {
            // Se questo aggiornamento è più vecchio → ignoralo
            if (matchUpdate.Version <= lastUpdate.Version)
                return;
        }

        _latestUpdates[matchUpdate.MatchId] = matchUpdate;


        // Invia a tutti i client connessi l'aggiornamento completo
        await Clients.All.SendAsync("ReceiveScoreUpdate", matchUpdate);
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
