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

export type MatchUpdate = {
  MatchId?: string | number;
  ScoreCasa?: number;
  ScoreOspite?: number;
  ResetMatch?: boolean;
  ResetScore?: boolean;
  PossessoCasa?: boolean | null;
  PossessoOspite?: boolean| null;
  Set?: number;
  TimeoutHome?: boolean;
  TimeoutAway?: boolean;
  Timer?: number;
  RedCardCasa?: number;
  RedCardOspite?: number;
  MatchWinner?: string | null;
};

const connection = new HubConnectionBuilder()
  .withUrl('http://51.20.66.229:8080/scorehub')
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
    // Inizia la connessione senza ascoltare gli aggiornamenti
    connection.start()
      .then(() => console.log('Connesso a SignalR!'))
      .catch((err) => console.error('Errore di connessione a SignalR:', err));

    // Nessun handler per gli aggiornamenti del punteggio (solo invio dei dati)
    return () => {
      connection.stop();
    };
  }, []);
  const UpdateScore = (matchUpdate: MatchUpdate) => {
    if (connection.state !== 'Connected') {
      console.log('Connessione non disponibile. Impossibile inviare l\'aggiornamento del punteggio.');
      return;
    }
  
    console.log('Invio aggiornamento punteggio:', matchUpdate);  // Log per debug
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

  const handleManageScore = (match: MatchDataResponse) => {
    setSelectedMatch(match);
    setShowDialog(true);
  };

  const confirmManageScore = () => {
    if (selectedMatch) {
      // Usa MatchId anziché matchNumber
      UpdateScore({ MatchId: selectedMatch.id });
  
      // Naviga alla pagina di gestione punteggio
      navigate(`/gestione/`);
    }
    setShowDialog(false);
  };

  const cancelManageScore = () => {
    setShowDialog(false);
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
        <div className="row-container">
          <div className="box-dash-punteggio">
            <div className="title-dashboard ">{LABEL_CONSTANT.title_punteggio}</div>
            <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_punteggio}</div>
            <button type="button" onClick={() => navigate('/gestione')} className="dash-button">{LABEL_CONSTANT.accedi}</button>
          </div>
        </div>
        <div className="row-container">
          <div className="box-dash-ledwall">
            <div className="title-dashboard ">{LABEL_CONSTANT.visualizza_ledwall}</div>
            <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_ledwall}</div>
            <button type="button" onClick={() => navigate('/ledwall')} className="dash-button">{LABEL_CONSTANT.accedi}</button>
          </div>
          <div className="box-dash-diretta">
            <div className="title-dashboard ">{LABEL_CONSTANT.visualizza_diretta}</div>
            <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_diretta}</div>
            <button type="button" onClick={() => navigate('/diretta')} className="dash-button">{LABEL_CONSTANT.accedi}</button>
          </div>
        </div>
        <div className="row-container">
          <div className="box-dash-ledwall">
            <div className="title-dashboard ">{LABEL_CONSTANT.title_sponsor}</div>
            <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_sponsor}</div>
            <button type="button" onClick={handleSponsor} className="dash-button">{LABEL_CONSTANT.accedi}</button>
          </div>
          <div className="box-dash-ledwall">
            <div className="title-dashboard ">{LABEL_CONSTANT.title_generale}</div>
            <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_generale}</div>
            <button type="button" onClick={handleGestioneGenerale} className="dash-button">{LABEL_CONSTANT.accedi}</button>
          </div>
        </div>
        <div className="card">
          <DataTable value={filteredData} scrollable scrollHeight="400px" virtualScrollerOptions={{ itemSize: 46 }} tableStyle={{ minWidth: '50rem' }}>
            <Column field="id" header="Id" style={{ width: '10%' }}></Column>
            <Column field="homeTeam" header="Home Team" style={{ width: '20%' }}></Column>
            <Column field="awayTeam" header="Away Team" style={{ width: '20%' }}></Column>
            <Column field="matchDate" header="Match Date" body={(rowData) => formatDate(new Date(rowData.matchDate))} style={{ width: '20%' }} />
            <Column field="location" header="Location" style={{ width: '20%' }}></Column>
            <Column field="time" header="Time" style={{ width: '10%' }}></Column>
            <Column field="female" header="Female" body={(rowData) => rowData.female ? 'Yes' : 'No'} style={{ width: '10%' }}></Column>
            <Column field="male" header="Male" body={(rowData) => rowData.male ? 'Yes' : 'No'} style={{ width: '10%' }}></Column>
            <Column header="Actions" body={(rowData) => (
              <Button 
                icon="pi pi-eye"
                label="Gestisci Punteggi" 
                onClick={() => handleManageScore(rowData)} 
                className="p-button-secondary"
              />
            )} style={{ width: '10%' }}></Column>
          </DataTable>
        </div>
      </div>

      {/* Pop-up di conferma */}
      <Dialog 
        visible={showDialog} 
        style={{ width: '400px' }} 
        header="Gestione Punteggi" 
        modal 
        onHide={cancelManageScore}
      >
        <div>
          <p>Vuoi gestire i punteggi della partita {selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}?</p>
          <Button label="Conferma" icon="pi pi-check" onClick={confirmManageScore} />
          <Button label="Annulla" icon="pi pi-times" onClick={cancelManageScore} className="p-button-secondary" />
        </div>
      </Dialog>
    </div>
  );
}
