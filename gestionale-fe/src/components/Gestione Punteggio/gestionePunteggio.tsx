import React, { useState, useEffect } from 'react';
import './gestionePunteggio.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { LABEL_CONSTANT } from 'constants/label_costant';
import Navbar from 'views/Navbar/navbar';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { getMatchData, MatchDataResponse, Team } from 'services/UserService';

const connection = new HubConnectionBuilder()
  /* .withUrl('http://51.20.66.229:8080/scorehub') */
  .withUrl('http://localhost:8080/scorehub')
  .build();

export type MatchUpdate = {
  MatchId?: string;
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



export default function GestionePunteggio() {
  const { matchId } = useParams();
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [matchCode, setMatchCode] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const navigate = useNavigate();
  const [homeRedCards, setHomeRedCards] = useState(0);
  const [awayRedCards, setAwayRedCards] = useState(0);
  const [setWaitTime, setSetWaitTime] = useState(0); // Timer per l'attesa
  const [isSetWaiting, setIsSetWaiting] = useState(false); // Stato per verificare se stiamo aspettando
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [selectedSet, setSelectedSet] = useState(1);
  const [possession, setPossession] = useState<string | null>(null);  
  const [timeoutHome, setTimeoutHomeState] = useState(false);
  const [timeoutAway, setTimeoutAwayState] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [lastTimerValue, setLastTimerValue] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [match, setMatch] = useState<MatchDataResponse[]>([]);
  const [matchData, setMatchData] = useState<MatchDataResponse[]>([]);
  const [timerStarted, setTimerStarted] = useState(false);
  const MAX_TIMEOUTS = 2;
  const MAX_SCORE = selectedSet === 5 ? 15 : 25;
  const WINNING_DIFF = 2;
  const [timeoutHomeCount, setTimeoutHomeCount] = useState(0); // Numero di timeout per la squadra di casa
  const [timeoutAwayCount, setTimeoutAwayCount] = useState(0); // Numero di timeout per la squadra ospite


  const openTwoTabs = () => {
    window.open('/ledwall', '_blank');
    window.open('/diretta', '_blank');
  };

  const [setScores, setSetScores] = useState<{ home: number; away: number }[]>([
    { home: 0, away: 0 },
    { home: 0, away: 0 },
    { home: 0, away: 0 },
    { home: 0, away: 0 },
    { home: 0, away: 0 },
  ]);

  const [homeSetsWon, setHomeSetsWon] = useState(0);
  const [awaySetsWon, setAwaySetsWon] = useState(0);
  const [matchWinner, setMatchWinner] = useState<string | null>(null);

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
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (!isTimerRunning && interval !== null) {
      clearInterval(interval);
    }

    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning]);

  useEffect(() => {
    // Recupera i dati delle partite
    const fetchMatchData = async () => {
      try {
        const data = await getMatchData(); // Chiamata API
        setMatch(data); // Aggiorna lo stato con i dati ricevuti
      } catch (error) {
        console.error('Errore durante il recupero dei dati delle partite:', error);
      }
    };

    fetchMatchData();

    // Connessione SignalR
    connection.start()
      .then(() => console.log('Connesso a SignalR!'))
      .catch((err) => console.error('Errore di connessione a SignalR:', err));

    return () => {
      connection.stop();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d+$/.test(matchCode)) {
      return;
    }
  };

  const increaseHomeScore = () => {
    if (matchWinner) return;
  
    const newHomeScore = homeScore + 1;
    console.log(`Punteggio casa: ${newHomeScore} - Punteggio ospite: ${awayScore}`);
    console.log(`Differenza di punteggio: ${newHomeScore - awayScore}`);
  
    // Prima aggiorna il punteggio
    setHomeScore(newHomeScore);
  
    // Verifica subito se il set è finito
    if (newHomeScore >= MAX_SCORE && (newHomeScore - awayScore) >= WINNING_DIFF) {
      console.log("Il set è finito, vittoria per casa");
      handleSetEnd('home');
      return; // Il set è terminato, non fare altre modifiche
    }
  
    // Se il set non è finito, continua a inviare il punteggio aggiornato
    console.log(`Punteggio aggiornato: Casa - ${newHomeScore}, Ospite - ${awayScore}`);
  
    let updatedPossession = possession;
    if (updatedPossession === null) {
      updatedPossession = 'home';
    }
  
    const matchUpdate: MatchUpdate = {
      ScoreCasa: newHomeScore,  // Usa il punteggio appena calcolato
      ScoreOspite: awayScore,
      Set: selectedSet,
      ResetMatch: false,
      ResetScore: false,
      PossessoCasa: updatedPossession === 'home',
      PossessoOspite: updatedPossession === 'away',
      TimeoutHome: timeoutHome,
      TimeoutAway: timeoutAway,
      Timer: timer,
      RedCardCasa: homeRedCards,
      RedCardOspite: awayRedCards,
      MatchWinner: matchWinner, 
    };
  
    console.log("Aggiornamento del match:", matchUpdate);
  
    // Aggiorniamo il punteggio solo quando lo stato è effettivamente cambiato
    UpdateScore(matchUpdate);
  };
  
  // Usa `useEffect` per inviare il punteggio dopo che `homeScore` è stato aggiornato
  useEffect(() => {
    if (homeScore !== 0) { // Se il punteggio della casa non è 0
      console.log(`Punteggio finale casa: ${homeScore}`);
      const matchUpdate: MatchUpdate = {
        ScoreCasa: homeScore,
        ScoreOspite: awayScore,
        Set: selectedSet,
        ResetMatch: false,
        ResetScore: false,
        PossessoCasa: possession === 'home',
        PossessoOspite: possession === 'away',
        TimeoutHome: timeoutHome,
        TimeoutAway: timeoutAway,
        Timer: timer,
        RedCardCasa: homeRedCards,
        RedCardOspite: awayRedCards,
        MatchWinner: matchWinner,
      };
      console.log("Aggiornamento finale inviato:", matchUpdate);
      UpdateScore(matchUpdate);
    }
  }, [homeScore]);
  
  const increaseAwayScore = () => {
    if (matchWinner) return; // Blocca l'incremento se c'è già un vincitore
  
    const newAwayScore = awayScore + 1;
    console.log(`Punteggio casa: ${homeScore} - Punteggio ospite: ${newAwayScore}`);
    console.log(`Differenza di punteggio: ${newAwayScore - homeScore}`);
  
    // Prima aggiorna il punteggio
    setAwayScore(newAwayScore);
  
    // Verifica subito se il set è finito
    if (newAwayScore >= MAX_SCORE && (newAwayScore - homeScore) >= WINNING_DIFF) {
      console.log("Il set è finito, vittoria per ospite");
      handleSetEnd('away');
      return; // Il set è terminato, non fare altre modifiche
    }
  
    // Se il set non è finito, continua a inviare il punteggio aggiornato
    console.log(`Punteggio aggiornato: Casa - ${homeScore}, Ospite - ${newAwayScore}`);
  
    let updatedPossession = possession;
    if (updatedPossession === null) {
      updatedPossession = 'away';
    }
  
    const matchUpdate: MatchUpdate = {
      ScoreCasa: homeScore,  // Usa il punteggio esistente per la casa
      ScoreOspite: newAwayScore,  // Usa il punteggio appena calcolato per gli ospiti
      Set: selectedSet,
      ResetMatch: false,
      ResetScore: false,
      PossessoCasa: updatedPossession === 'home',
      PossessoOspite: updatedPossession === 'away',
      TimeoutHome: timeoutHome,
      TimeoutAway: timeoutAway,
      Timer: timer,
      RedCardCasa: homeRedCards,
      RedCardOspite: awayRedCards,
      MatchWinner: matchWinner,
    };
  
    console.log("Aggiornamento del match:", matchUpdate);
  
    // Aggiorniamo il punteggio solo quando lo stato è effettivamente cambiato
    UpdateScore(matchUpdate);
  };
  
  // Usa `useEffect` per inviare il punteggio dopo che `awayScore` è stato aggiornato
  useEffect(() => {
    if (awayScore !== 0) { // Se il punteggio degli ospiti non è 0
      console.log(`Punteggio finale ospite: ${awayScore}`);
      const matchUpdate: MatchUpdate = {
        ScoreCasa: homeScore,
        ScoreOspite: awayScore,
        Set: selectedSet,
        ResetMatch: false,
        ResetScore: false,
        PossessoCasa: possession === 'home',
        PossessoOspite: possession === 'away',
        TimeoutHome: timeoutHome,
        TimeoutAway: timeoutAway,
        Timer: timer,
        RedCardCasa: homeRedCards,
        RedCardOspite: awayRedCards,
        MatchWinner: matchWinner,
      };
      console.log("Aggiornamento finale inviato:", matchUpdate);
      UpdateScore(matchUpdate);
    }
  }, [awayScore]);
   
  useEffect(() => {
    // Quando selectedSet cambia, resettiamo i conteggi dei timeout
    setTimeoutHomeCount(0);
    setTimeoutAwayCount(0);
  }, [selectedSet]);
  
  const handleTimeoutHome = () => {
    // Verifica che la squadra di casa non abbia già usato 2 timeout
    if (timeoutHomeCount < 2) {
      const newTimeoutHome = !timeoutHome; // Inverte lo stato del timeout
      setTimeoutHomeState(newTimeoutHome);
      setIsTimerRunning(!newTimeoutHome); // Se il timeout è attivo, ferma il timer
  
      // Incrementa il conteggio dei timeout per la squadra di casa
      if (!newTimeoutHome) {  // Se il timeout è appena stato fermato, non incrementarlo
        setTimeoutHomeCount(timeoutHomeCount + 1);
      }
  
      const matchUpdate: MatchUpdate = {
        ScoreCasa: homeScore,
        ScoreOspite: awayScore,
        Set: selectedSet,
        ResetMatch: false,
        ResetScore: false,
        PossessoCasa: possession === 'home',
        PossessoOspite: possession === 'away',
        TimeoutHome: newTimeoutHome,
        Timer: timer,
        RedCardCasa: homeRedCards,
        RedCardOspite: awayRedCards,
        MatchWinner: matchWinner,
      };
  
      // Invia l'aggiornamento al server
      UpdateScore(matchUpdate);
    }
  };
  
  const handleTimeoutAway = () => {
    // Verifica che la squadra ospite non abbia già usato 2 timeout
    if (timeoutAwayCount < 2) {
      const newTimeoutAway = !timeoutAway;
      setTimeoutAwayState(newTimeoutAway);
      setIsTimerRunning(!newTimeoutAway);
  
      // Incrementa il conteggio dei timeout per la squadra ospite
      if (!newTimeoutAway) {  // Se il timeout è appena stato fermato, non incrementarlo
        setTimeoutAwayCount(timeoutAwayCount + 1);
      }
  
      const matchUpdate: MatchUpdate = {
        ScoreCasa: homeScore,
        ScoreOspite: awayScore,
        Set: selectedSet,
        ResetMatch: false,
        ResetScore: false,
        PossessoCasa: possession === 'home',
        PossessoOspite: possession === 'away',
        TimeoutAway: newTimeoutAway, // Aggiorna lo stato del timeout
        Timer: timer,
        RedCardCasa: homeRedCards,
        RedCardOspite: awayRedCards,
        MatchWinner: matchWinner,
      };
  
      UpdateScore(matchUpdate);
    }
  };
  

  const startTimer = () => {
    setTimer(0);
    setIsTimerRunning(true); // Avvia il timer
    setTimerStarted(true);

    const matchUpdate: MatchUpdate = {
      ScoreCasa: homeScore,
      ScoreOspite: awayScore,
      Set: selectedSet,
      ResetMatch: false,
      ResetScore: false,
      PossessoCasa: possession === 'home',
      PossessoOspite: possession === 'away',
      TimeoutHome: timeoutHome,
      TimeoutAway: timeoutAway,
      Timer: timer,
      RedCardCasa: homeRedCards,
      RedCardOspite: awayRedCards,
      MatchWinner: matchWinner,
    };

    // Invia l'aggiornamento al server
    UpdateScore(matchUpdate);
  };

  const resetTimer = () => {
    setTimer(0);
    setLastTimerValue(0);
    setIsTimerRunning(false); // Ferma il timer

    const matchUpdate: MatchUpdate = {
      ScoreCasa: homeScore,
      ScoreOspite: awayScore,
      Set: selectedSet,
      ResetMatch: false,
      ResetScore: false,
      PossessoCasa: possession === 'home',
      PossessoOspite: possession === 'away',
      TimeoutHome: timeoutHome,
      TimeoutAway: timeoutAway,
      Timer: 0, // Resetta il timer
      RedCardCasa: homeRedCards,
      RedCardOspite: awayRedCards,
      MatchWinner: matchWinner,
    };

    // Invia l'aggiornamento al server
    UpdateScore(matchUpdate);
  };


  const togglePossession = () => {
    const newPossession = possession === 'home' ? 'away' : 'home';
    setPossession(newPossession); // Cambia il possesso
    const matchUpdate: MatchUpdate = {
      ScoreCasa: homeScore,
      ScoreOspite: awayScore,
      Set: selectedSet,
      ResetMatch: false,
      ResetScore: false,
      PossessoCasa: newPossession === 'home',
      PossessoOspite: newPossession === 'away',
      TimeoutHome: timeoutHome,
      TimeoutAway: timeoutAway,
      Timer: timer,
      RedCardCasa: homeRedCards,
      RedCardOspite: awayRedCards,
      MatchWinner: matchWinner,
    };

    // Invia l'aggiornamento al server
    UpdateScore(matchUpdate);
  };


  const formatTimer = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const isBothButtonsDisabled = (homeScore >= MAX_SCORE && awayScore >= MAX_SCORE && (homeScore - awayScore >= WINNING_DIFF)) ||
    (homeScore >= MAX_SCORE && (homeScore - awayScore >= WINNING_DIFF)) ||
    (awayScore >= MAX_SCORE && (awayScore - homeScore >= WINNING_DIFF)) ||
    !!matchWinner;

  const isHomeButtonDisabled = isBothButtonsDisabled;
  const isAwayButtonDisabled = isBothButtonsDisabled;

  const handleSetEnd = (winningTeam: 'home' | 'away') => {
    // Invia il punteggio definitivo
    const finalMatchUpdate: MatchUpdate = {
      ScoreCasa: homeScore,
      ScoreOspite: awayScore,
      Set: selectedSet,
      ResetMatch: false,
      ResetScore: false, // Non resettare ancora
      PossessoCasa: null,
      PossessoOspite: null,
      TimeoutHome: timeoutHome,
      TimeoutAway: timeoutAway,
      Timer: timer,
      RedCardCasa: homeRedCards,
      RedCardOspite: awayRedCards,
      MatchWinner: winningTeam === 'home' ? (homeTeam?.name || 'Casa') : (awayTeam?.name || 'Ospite'),
    };
  
    // Invia aggiornamento punteggio
    UpdateScore(finalMatchUpdate);
  
    // Aggiorna lo stato dei set
    const newSetScores = [...setScores];
    newSetScores[selectedSet - 1] = { home: homeScore, away: awayScore };
    setSetScores(newSetScores);
  
    // Aggiorna il conteggio dei set vinti
    if (winningTeam === 'home') {
      setHomeSetsWon((prev) => prev + 1);
      if (homeSetsWon + 1 === 3) {
        setMatchWinner(homeTeam?.name || 'Casa');

      }
    } else {
      setAwaySetsWon((prev) => prev + 1);
      if (awaySetsWon + 1 === 3) {
        setMatchWinner(awayTeam?.name || 'Ospite');
      }
    }
  
    // Aspetta l'invio e poi resetta
    setTimeout(() => {
      resetScores(); // Reset dei punteggi
      setSelectedSet((prevSet) => (prevSet < 5 ? prevSet + 1 : 5));
      setPossession(null);
    }, 500); // Assicurati che l'aggiornamento avvenga prima del reset
  };
    
  const resetScores = () => {
    setHomeScore(0);
    setAwayScore(0);
  };



  const resetMatch = () => {
    setHomeScore(0);
    setAwayScore(0);
    setHomeSetsWon(0);
    setAwaySetsWon(0);
    setMatchWinner(null);
    setSetScores([
      { home: 0, away: 0 },
      { home: 0, away: 0 },
      { home: 0, away: 0 },
      { home: 0, away: 0 },
      { home: 0, away: 0 },
    ]);
    setSelectedSet(1);
  };
  const handleRedCard = (team: 'home' | 'away') => {
    if (team === 'home') {
      setHomeScore(prevScore => Math.max(prevScore - 1, 0)); // Riduce il punteggio della squadra di casa
      setHomeRedCards(prev => prev + 1); // Aumenta i cartellini rossi per la squadra di casa
      setPossession('away'); // Passa il possesso alla squadra ospite
    } else {
      setAwayScore(prevScore => Math.max(prevScore - 1, 0)); // Riduce il punteggio della squadra ospite
      setAwayRedCards(prev => prev + 1); // Aumenta i cartellini rossi per la squadra ospite
      setPossession('home'); // Passa il possesso alla squadra di casa
    }
    // Creiamo l'oggetto MatchUpdate da inviare via WebSocket
    const matchUpdate: MatchUpdate = {
      ScoreCasa: homeScore,
      ScoreOspite: awayScore,
      Set: selectedSet,
      ResetMatch: false,
      ResetScore: false,
      PossessoCasa: possession === 'home',
      PossessoOspite: possession === 'away',
      TimeoutHome: timeoutHome,
      TimeoutAway: timeoutAway,
      Timer: timer,
      RedCardCasa: homeRedCards,
      RedCardOspite: awayRedCards,
    };

    // Invia l'aggiornamento al server
    UpdateScore(matchUpdate);
  };
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchData: MatchDataResponse[] = await getMatchData();
        
        // Verifica che matchId sia definito e numerico prima di usarlo
        if (matchId) {
          const match = matchData.find(m => m.id === parseInt(matchId, 10));
  
          if (match) {
            // Imposta le squadre di casa e ospite
            setHomeTeam(match.homeTeam);
            setAwayTeam(match.awayTeam);
          } else {
            console.error('Partita non trovata');
          }
        } else {
          console.error('matchId non definito');
        }
      } catch (error) {
        console.error("Errore durante il caricamento delle squadre:", error);
      }
    };
  
    if (matchId) {
      fetchMatch();  // Esegui il recupero dei dati solo se matchId è presente
    }
  }, [matchId]);  // Esegui quando matchId cambia
  

  return (
    <div className="dashboard">
      <Navbar />
      <div className="login-container">
        <div className="box-dash">
          <form onSubmit={handleSubmit} className="form">
            <div className="title">{LABEL_CONSTANT.punteggio}</div>
            <div className="input-group form-row">
            <div className="title-dash">{homeTeam?.name || 'Casa'}: {homeScore} {homeScore >= MAX_SCORE && '(Max)'}</div>
            <button type="button" onClick={increaseHomeScore} className="dash-button" disabled={isHomeButtonDisabled}>
                {LABEL_CONSTANT.aggiungi_casa}
              </button>
              <div className="title-dash">{awayTeam?.name || 'Ospite'}: {awayScore} {awayScore >= MAX_SCORE && '(Max)'}</div>
              <button type="button" onClick={increaseAwayScore} className="dash-button" disabled={isAwayButtonDisabled}>
                {LABEL_CONSTANT.aggiungi_ospite}
              </button>
            </div>
            <div>
              <button type="button" onClick={matchWinner ? resetMatch : resetScores} className="dash-button-res">{LABEL_CONSTANT.reset_punteggio}</button>
            </div>

            <div className="input-group form-row">
              <label className="title-dash">{LABEL_CONSTANT.numero_set}</label>
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(Number(e.target.value))}
                className="set"
                disabled={!!matchWinner}
              >
                <option value={1}>{LABEL_CONSTANT.primo_set}</option>
                <option value={2}>{LABEL_CONSTANT.secondo_set}</option>
                <option value={3}>{LABEL_CONSTANT.terzo_set}</option>
                <option value={4}>{LABEL_CONSTANT.quarto_set}</option>
                <option value={5}>{LABEL_CONSTANT.quinto_set}</option>
              </select>
            </div>

            <div className="input-group form-row">
              <div className="title-dash">{LABEL_CONSTANT.possesso_palla}</div>
              <div className={`team-possession ${possession}`}>{possession === 'home' ? 'Casa' : 'Ospite'}</div>
              <button type="button" onClick={togglePossession} className="dash-button">{LABEL_CONSTANT.possesso}</button>
            </div>

            <div className="input-group form-row">
              <div className="title-dash">{LABEL_CONSTANT.timeout_casa}</div>
              <div className="timeout-status">{timeoutHome ? 'Attivo' : 'Non attivo'}</div>
              <button type="button" onClick={handleTimeoutHome} className="dash-button" disabled={(!isTimerRunning && !timerStarted) || timeoutHomeCount >= 2 || (timeoutAway && !timeoutHome)} >
                {timeoutHome ? 'Ferma Timeout' : 'Avvia Timeout'}
                
              </button>
              <div className="title-dash">{LABEL_CONSTANT.timeout_ospite}</div>
              <div className="timeout-status">{timeoutAway ? 'Attivo' : 'Non attivo'}</div>
              <button type="button" onClick={handleTimeoutAway} className="dash-button" disabled={(!isTimerRunning && !timerStarted) || timeoutAwayCount >= 2 || (timeoutHome && !timeoutAway) }>
                {timeoutAway ? 'Ferma Timeout' : 'Avvia Timeout'}
              </button>
              </div>
              <div className="input-group form-row">
              <p className="timer-text">{LABEL_CONSTANT.timer}: {formatTimer(timer)}</p>
              <button type="button" onClick={startTimer} className="dash-button">
                {LABEL_CONSTANT.set_timer}
              </button>
              <button type="button" onClick={resetTimer} className="dash-button">
                {LABEL_CONSTANT.reset_timer}
              </button>
            </div>

            <div className="input-group form-row">
              <div className="title-dash">{LABEL_CONSTANT.punteggio_set}</div>
              {setScores.map((set, index) => (
                <div key={index} className="set-score">
                  <span>{`Set ${index + 1}: ${homeTeam || 'Casa'} ${set.home} - ${awayTeam || 'Ospite'} ${set.away}`}</span>
                </div>
              ))}
            </div>

            <div className="input-group form-row">
              <button type="button" onClick={() => handleRedCard('home')} className="dash-button" disabled={areButtonsDisabled}>
                {LABEL_CONSTANT.cartellino_rosso_casa}
              </button>
              <button type="button" onClick={() => handleRedCard('away')} className="dash-button" disabled={areButtonsDisabled}>
                {LABEL_CONSTANT.cartellino_rosso_ospite}
              </button>
            </div>
            <div className="waiting-timer">
              <span>{`Attesa tra i set: ${formatTimer(setWaitTime)}`}</span>
            </div>

            {matchWinner && (
              <div className="winner">
                <h2>{`${matchWinner} ha vinto la partita!`}</h2>
              </div>
            )}
            <div className="input-group form-row">
              <button type="button" onClick={openTwoTabs} className="dash-button-res">{LABEL_CONSTANT.visualizza_nuove_schede}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


