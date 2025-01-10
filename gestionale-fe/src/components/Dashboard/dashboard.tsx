import { LABEL_CONSTANT } from "constants/label_costant";
import { useNavigate } from "react-router-dom";
import Navbar from "views/Navbar/navbar";
import './dashboard.scss';
import { useEffect, useState } from "react";
import { getMatchData, MatchDataResponse } from "services/UserService";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { HubConnectionBuilder } from "@microsoft/signalr";
import { Panel } from "primereact/panel";

export type MatchUpdate = {
  MatchId?: string | number;
  ScoreCasa?: number;
  ScoreOspite?: number;
  ResetMatch?: boolean;
  ResetScore?: boolean;
  PossessoCasa?: boolean | null;
  PossessoOspite?: boolean | null;
  Set?: number;
  TimeoutHome?: boolean;
  TimeoutAway?: boolean;
  Timer?: number;
  RedCardCasa?: number;
  RedCardOspite?: number;
  MatchWinner?: string | null;
};

const connection = new HubConnectionBuilder() 
/*  .withUrl('http://51.20.66.229:8080/scorehub') 
 */ .withUrl('http://localhost:8080/scorehub')
  .build();



export default function Dashboard() {
  const navigate = useNavigate();

  const [matchData, setMatchData] = useState<MatchDataResponse[]>([]);
  const [filteredData, setFilteredData] = useState<MatchDataResponse[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchDataResponse | null>(null);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  useEffect(() => {
    const startConnection = async () => {
      try {
        await connection.start();
        console.log('Connesso a SignalR!');
      } catch (err) {
        console.error('Errore di connessione a SignalR:', err);
        setTimeout(startConnection, 5000); // Riprova la connessione dopo 5 secondi
      }
    };

    startConnection();

    connection.onclose(() => {
      console.log('Connessione WebSocket chiusa');
    });

    return () => {
      connection.stop();
    };
  }, []);

  const UpdateScore = (matchUpdate: MatchUpdate) => {
    if (connection.state !== 'Connected') {
      console.log('Connessione non disponibile. Impossibile inviare l\'aggiornamento del punteggio.');
  
      // Riprova a connettersi se la connessione è chiusa
      const reconnect = async () => {
        try {
          console.log("Riprovo a connettermi...");
          await connection.start();
          console.log('Connesso a SignalR!');
          // Una volta connesso, invia l'aggiornamento del punteggio
          connection.invoke('UpdateScore', matchUpdate)
            .then(() => {
              console.log('Punteggio inviato con successo');
            })
            .catch((err) => {
              console.error('Errore durante l\'invio dell\'aggiornamento del punteggio:', err);
            });
        } catch (err) {
          console.error('Errore di connessione a SignalR:', err);
          setTimeout(reconnect, 5000); // Riprova a connetterti dopo 5 secondi
        }
      };
  
      reconnect(); // Chiama la funzione per riconnettersi e inviare il punteggio
      return;
    }
  
    console.log('Invio aggiornamento punteggio:', matchUpdate);
    connection.invoke('UpdateScore', matchUpdate)
      .then(() => {
        console.log('Punteggio inviato con successo');
      })
      .catch((err) => {
        console.error('Errore durante l\'invio dell\'aggiornamento del punteggio:', err);
      });
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMatchData();
        setMatchData(data);
        setFilteredData(data);
      } catch (error) {
        console.error('Errore durante il recupero dei dati delle partite:', error);
      }
    };
    fetchData();
  }, []);

  const handleManageScore = (matchNumber: number) => {
    // Trova la partita selezionata
    const selected = matchData.find(match => match.matchNumber === matchNumber);
    setSelectedMatch(selected || null);

    // Mostra il dialogo di conferma
    setShowDialog(true);
  };

  const confirmManageScore = () => {
    if (selectedMatch) {
      // Invia il MatchId tramite WebSocket
      UpdateScore({ MatchId: selectedMatch.matchNumber });

      // Naviga alla pagina di gestione punteggi con il matchNumber come parametro
      navigate(`/gestione/${selectedMatch.matchNumber}`);
    }

    // Chiudi il dialogo
    setShowDialog(false);
  };

  const cancelManageScore = () => {
    setShowDialog(false); // Chiudi il dialogo senza fare nulla
  };


  const handleSponsor = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    navigate('/gestione-sponsor');
  };

  const handleGestioneGenerale = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    navigate('/gestione-generale');
  };



  return (
    <div className="dashboard">
      <Navbar />
      <div className="login-container">
        <div className="generale">
          <div className="title-generale">
            {matchData.length > 0 ? LABEL_CONSTANT.cosa_vuoi_fare : ''}
          </div>
        </div>
        {matchData.length > 0 && (
          <Panel header="Calendario" className="table">
            <DataTable
              value={filteredData.map((match) => ({
                ...match,
                homeTeamName: match.homeTeam?.name || "N/A", // Assegna il nome della squadra di casa
                awayTeamName: match.awayTeam?.name || "N/A", // Assegna il nome della squadra ospite
              }))}
              scrollable
              scrollHeight="400px"
              virtualScrollerOptions={{ itemSize: 46 }}
              tableStyle={{ minWidth: '50rem' }}
            >
              <Column field="day" header="Giornata" className="column" />
              <Column field="outwardReturn" header="A/R" className="column" />
              <Column field="matchNumber" header="Numero Gara" className="column" />
              <Column
                field="matchDate"
                header="Data gara"
                body={(rowData) => formatDate(new Date(rowData.matchDate))}
                style={{ width: '20%' }}
              />
              <Column field="dayOfWeek" header="Giorno settimana" className="column" />
              <Column field="time" header="Time" className="column" />
              <Column field="location" header="Luogo" className="column" />
              <Column field="homeTeamName" header="Squadra casa" className="column" />
              <Column field="awayTeamName" header="Squadra ospite" className="column" />
              <Column
                header="Actions"
                body={(rowData) => (
                  <Button
                    icon="pi pi-eye"
                    label="Gestisci Punteggi"
                    onClick={() => handleManageScore(rowData.matchNumber)} // Passa matchNumber alla funzione
                    className="p-button-secondary"
                  />
                )}
                style={{ width: '10%' }}
              />
            </DataTable>
            <Dialog
              header="Conferma Gestione"
              visible={showDialog}
              style={{ width: '400px' }}
              onHide={() => setShowDialog(false)}
              footer={
                <>
                  <Button label="Annulla" icon="pi pi-times" onClick={cancelManageScore} className="p-button-text" />
                  <Button label="Conferma" icon="pi pi-check" onClick={confirmManageScore} autoFocus />
                </>
              }
            >
              {LABEL_CONSTANT.dialog_conferma_gestione}
              {selectedMatch ? `numero: ${selectedMatch.matchNumber}` : ''}
              {' '}
              {LABEL_CONSTANT.tra}
              {' '}
              {selectedMatch ? selectedMatch.homeTeam?.name : ''}
              {' '} {/* Aggiunge uno spazio tra le squadre */}
              {LABEL_CONSTANT.e}
              {' '} {/* Aggiunge uno spazio tra "e" e la squadra ospite */}
              {selectedMatch ? selectedMatch.awayTeam?.name : ''}
              ?
            </Dialog>
          </Panel>
        )}

        <div className="row-container">
          <Panel header="Gestisci il punteggio" style={{ marginBottom: '20px' }}>
            <div className="box-dash-punteggio">
              <div className="title-dashboard">{LABEL_CONSTANT.title_punteggio}</div>
              <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_punteggio}</div>
              <button
                type="button"
                onClick={() => navigate('/gestione')}
                className="button-panel"
              >
                {LABEL_CONSTANT.accedi}
              </button>
            </div>
          </Panel>

          {/* Visualizza Ledwall */}
          <Panel header="Visualizza Ledwall" style={{ marginBottom: '20px' }}>
            <div className="box-dash-ledwall">
              <div className="title-dashboard">{LABEL_CONSTANT.visualizza_ledwall}</div>
              <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_ledwall}</div>
              <button
                type="button"
                onClick={() => navigate('/ledwall')}
                className="button-panel"
              >
                {LABEL_CONSTANT.accedi}
              </button>
            </div>
          </Panel>

          {/* Visualizza Diretta */}
          <Panel header="Visualizza Diretta" style={{ marginBottom: '20px' }}>
            <div className="box-dash-diretta">
              <div className="title-dashboard">{LABEL_CONSTANT.visualizza_diretta}</div>
              <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_diretta}</div>
              <button
                type="button"
                onClick={() => navigate('/diretta')}
                className="button-panel"
              >
                {LABEL_CONSTANT.accedi}
              </button>
            </div>
          </Panel>
        </div>
        <div className="row-container">
          {/* Gestione Sponsor */}
          <Panel header="Gestione Sponsor" style={{ marginBottom: '20px' }}>
            <div className="box-dash-ledwall">
              <div className="title-dashboard">{LABEL_CONSTANT.title_sponsor}</div>
              <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_sponsor}</div>
              <button
                type="button"
                onClick={handleSponsor}
                className="button-panel"
              >
                {LABEL_CONSTANT.accedi}
              </button>
            </div>
          </Panel>

          {/* Gestisci Calendario e Loghi */}
          <Panel header="Gestisci Calendario e Loghi" style={{ marginBottom: '20px' }}>
            <div className="box-dash-ledwall">
              <div className="title-dashboard">{LABEL_CONSTANT.title_generale}</div>
              <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_generale}</div>
              <button
                type="button"
                onClick={handleGestioneGenerale}
                className="button-panel"
              >
                {LABEL_CONSTANT.accedi}
              </button>
            </div>
          </Panel>
        </div>

      </div>
    </div>
  );
}
