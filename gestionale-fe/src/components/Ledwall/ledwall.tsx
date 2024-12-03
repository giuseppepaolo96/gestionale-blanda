import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import logoOspite from '../../assets/images/CERIGNOLA.jpg';
import logoCasa from '../../assets/images/FAAM MATESE.jpg';
import logoSponsor1 from '../../assets/images/faam_spa_logo-senza-sfondo.png';
import logoSponsor2 from '../../assets/images/SPONSOR_CARBAT.png';
import './ledwall.scss';
import axios from 'axios';
import { LABEL_CONSTANT } from "constants/label_costant";
import { getMatchData, MatchDataResponse } from 'services/UserService';

export interface SponsorResponse {
    name: string;
    logoBase64: string;
}

interface ImageType {
    id: string | number;
    src: string;
    name: string;
}

interface SetData {
    setNumber: number;
    score: number[];
    effectiveTime: string;
}

export default function Ledwall() {
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [setScores, setSetScores] = useState<number[][]>([[], [], [], [], []]);
    const [homeTeam, setHomeTeam] = useState("");
    const [awayTeam, setAwayTeam] = useState("");
    const [day, setDay] = useState("");
    const [matchNumber, setMatchNumber] = useState("");
    const [matchDate, setMatchDate] = useState("");
    const [matchData, setMatchData] = useState<MatchDataResponse | null>(null);
    const [set, setCompleteSet] = useState(0);
    const [setsCount, setSetsCount] = useState(1);
    const [sponsors, setSponsors] = useState<SponsorResponse[]>([]);
    const [currentSponsorIndex, setCurrentSponsorIndex] = useState(0);
    const [winSetHome, SetWinHome] = useState("");
    const [winSetAway, SetWinAway] = useState("");
    const [possession, setPossession] = useState<'home' | 'away' | null>(null); // Stato per il possesso
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeoutsHome, setTimeoutsHome] = useState(0);  // Numero di timeout ricevuti per la squadra di casa
    const [timeoutsAway, setTimeoutsAway] = useState(0);  // Numero di timeout ricevuti per la squadra ospite
    const [timeoutHomeFlags, setTimeoutHomeFlags] = useState<boolean[]>([]);  // Array per i timeout della squadra di casa
    const [timeoutAwayFlags, setTimeoutAwayFlags] = useState<boolean[]>([]);  // Array per i timeout della squadra ospite



    const connection = new signalR.HubConnectionBuilder()
        .withUrl("http://51.20.66.229:8080/scoreHub")
        .withAutomaticReconnect()
        .build();

    const fetchSponsors = async () => {
        try {
            const response = await axios.get<SponsorResponse[]>('http://51.20.66.229:8080/api/sponsor');
            console.log('Sponsors fetched:', response.data);
            setSponsors(response.data);
        } catch (error) {
            console.error('Error fetching sponsors:', error);
        }
    };

    const fetchMatchData = async (matchId: number) => {
        try {
            const data = await getMatchData();
            const match = data.find(m => m.id === matchId);
            if (match) {
                setHomeTeam(match.homeTeam);
                setAwayTeam(match.awayTeam);
                setHomeScore(0);
                setAwayScore(0);
                setSetScores([[], [], [], [], []]); // Resetta i punteggi dei set
            }
        } catch (error) {
            console.error('Failed to fetch match data', error);
        }
    };

    useEffect(() => {
        fetchSponsors();

        connection.start()
            .then(() => {
                console.log("Connessione SignalR stabilita");

                connection.on("ReceiveScoreUpdate", async (matchUpdate) => {
                    console.log("Dati ricevuti:", matchUpdate);

                    const { matchId, scoreCasa, scoreOspite, set: currentSet, possessoCasa, possessoOspite, timeoutHome, timeoutAway , matchWinner } = matchUpdate;

                    await fetchMatchData(matchId);

                    if (scoreCasa !== undefined && scoreOspite !== undefined) {
                        setHomeScore(scoreCasa);
                        setAwayScore(scoreOspite);
                    }

                    if (currentSet !== undefined) {
                        setSetsCount(currentSet);
                        setCompleteSet(currentSet);

                        setSetScores((prevSetScores) => {
                            const newSetScores = [...prevSetScores];
                            if (!newSetScores[currentSet - 1]) {
                                newSetScores[currentSet - 1] = [0, 0];
                            }
                            newSetScores[currentSet - 1] = [scoreCasa || 0, scoreOspite || 0];
                            return newSetScores;
                        });


                    }

                    if (matchWinner) {
                        // Aggiungi il vincitore dell'ultimo set
                        const winningTeam = matchWinner === "home" ? homeTeam : awayTeam;
                        const lastSetIndex = setScores.length - 1;
    
                        if (setScores[lastSetIndex].length === 2) {
                            // Se l'ultimo set è completato, visualizza il vincitore
                            if (matchWinner === "home") {
                                SetWinHome((prev) => (parseInt(prev) + 1).toString());
                            } else {
                                SetWinAway((prev) => (parseInt(prev) + 1).toString());
                            }
                        }
                    }

                    if (timeoutHome && timeoutsHome < 2) {
                        setTimeoutHomeFlags(prev => [...prev, true]);  // Aggiungi il flag a true
                        setTimeoutsHome(prev => prev + 1);  // Incrementa il conteggio dei timeout
                    }

                    // Gestisce il timeout per la squadra ospite
                    if (timeoutAway && timeoutsAway < 2) {
                        setTimeoutAwayFlags(prev => [...prev, true]);  // Aggiungi il flag a true
                        setTimeoutsAway(prev => prev + 1);  // Incrementa il conteggio dei timeout
                    }
                    // Imposta il possesso corrente
                    if (possessoCasa) {
                        setPossession('home'); // La squadra di casa ha il possesso
                    } else if (possessoOspite) {
                        setPossession('away'); // La squadra ospite ha il possesso
                    } else {
                        setPossession(null); // Nessuna squadra ha il possesso
                    }
                });
            })
            .catch(err => {
                console.error("Error starting SignalR connection: ", err);
            });

        return () => {
            connection.stop();
        };
    }, []);

    useEffect(() => {
        if (set > 0) {
            setTimeoutHomeFlags([]);  // Rimuovi i timeout della squadra di casa
            setTimeoutAwayFlags([]);  // Rimuovi i timeout della squadra ospite
            setTimeoutsHome(0);  // Resetta il conteggio dei timeout
            setTimeoutsAway(0);  // Resetta il conteggio dei timeout
        }
    }, [set]);



    useEffect(() => {
        const interval = setInterval(() => {
            // Incrementa l'indice per passare al prossimo sponsor
            setCurrentIndex(prevIndex => (prevIndex + 1) % sponsors.length);
        }, 9000); // Intervallo di 3 secondi (puoi modificare questo valore)

        return () => clearInterval(interval); // Pulisce l'intervallo al termine del ciclo di vita del componente
    }, [sponsors.length]);

    useEffect(() => {
        // Calcola i set vinti dalla squadra di casa
        const homeWins = setScores.reduce((wins, set) => {
            if (
                set.length === 2 && // Assicura che ci siano entrambi i punteggi
                set[0] >= 25 && // La squadra di casa ha raggiunto il punteggio minimo
                set[0] - set[1] >= 2 // Scarto minimo di 2 punti
            ) {
                return wins + 1;
            }
            return wins;
        }, 0);

        // Aggiorna il valore di winSetHome
        SetWinHome(homeWins.toString());
    }, [setScores]);

    


    useEffect(() => {
        // Calcola i set vinti dalla squadra ospite
        const awayWins = setScores.reduce((wins, set) => {
            if (
                set.length === 2 && // Assicura che ci siano entrambi i punteggi
                set[1] >= 25 && // La squadra ospite ha raggiunto il punteggio minimo
                set[1] - set[0] >= 2 // Scarto minimo di 2 punti
            ) {
                return wins + 1;
            }
            return wins;
        }, 0);

        // Aggiorna il valore di winSetAway
        SetWinAway(awayWins.toString());
    }, [setScores]);



    return (
        <div className="scoreboard-ledwall">
            <div className="match-info">
                <h1>
                    {LABEL_CONSTANT.categoria} FEMMINILE {/* {matchData?.female ? LABEL_CONSTANT.femminile : LABEL_CONSTANT.maschile} */}
                </h1>
                <h1>
                    {/* {day} */} 7 {LABEL_CONSTANT.giornata} - sabato 23 novembre 2024 - {LABEL_CONSTANT.numero} {/* {matchNumber} */} 11305
                </h1>
            </div>
            <div className="score-section">
                <div className="team">
                    <div className="logo-score">
                    {[...Array(timeoutsHome)].map((_, index) => (
                            <div key={index} className="timeout-icon-home">
                                <i className="pi pi-stopwatch"></i>
                            </div>
                        ))}
                        <span className="team-score">{winSetHome}</span>
                        <img src={logoCasa} alt="Logo Squadra di Casa" className="team-logo" />
                    </div>
                    <span className="team-name-prima">{homeTeam} FAAM MATESE CE</span>
                </div>
                <div className="score">
                    <span className="score-value">{homeScore}</span>
                    <span className="versus">{LABEL_CONSTANT.vs}</span>
                    <span className="score-value">{awayScore}</span>
                </div>
                <div className="team">
                    <div className="logo-score">
                    {[...Array(timeoutsAway)].map((_, index) => (
                            <div key={index} className="timeout-icon-away">
                                <i className="pi pi-stopwatch"></i>
                            </div>
                        ))}
                        <img src={logoOspite} alt="Logo Squadra Ospite" className="team-logo" />
                        <span className="team-score">{winSetAway}</span>
                    </div>
                    <span className="team-name-seconda">{awayTeam} MANDWINERY CERIGNOLA</span>
                </div>
            </div>
            <div className="stripes-section">
                {setScores.map((set, index) => {
                    // Verifica se il set è completato
                    const isSetCompleted =
                        set.length === 2 &&
                        Math.max(set[0], set[1]) >= 25 && // Uno dei due punteggi raggiunge il valore minimo
                        Math.abs(set[0] - set[1]) >= 2;  // La differenza è di almeno 2 punti

                    return (
                        isSetCompleted && (
                            <div key={index} className="stripe">
                                <span className="stripe-background">
                                    <div className="label-set">{LABEL_CONSTANT.set} {index + 1}</div>
                                </span>
                                <div className="stripe-values">
                                    {/* Punteggi della squadra di casa e ospite */}
                                    <span className="stripe-value">{set[0]}</span>
                                    <span className="stripe-value">{set[1]}</span>
                                </div>
                            </div>
                        )
                    );
                })}
            </div>

            <div className="carousel-container-ledwall">
                <div className="carousel-scroll">
                    {sponsors.length > 0 ? (
                        sponsors.map((sponsor, index) => (
                            <div
                                key={index}
                                className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
                                style={{
                                    display: index === currentIndex ? 'block' : 'none',
                                }}
                            >
                                <img
                                    src={sponsor.logoBase64.startsWith('data:image/png;base64,')
                                        ? sponsor.logoBase64
                                        : `data:image/png;base64,${sponsor.logoBase64}`}
                                    alt={sponsor.name}
                                    style={{ width: '100%', height: '100%', borderRadius: '5px' }}
                                />
                            </div>
                        ))
                    ) : null}
                </div>
               
            </div>
             {/* Logo Sponsor */}
             <div className="logo-container-ledwall-primo">
                <img src={logoSponsor1} alt="Logo Sponsor" className="header-logo" />
            </div>
            {/* Logo Sponsor */}
            <div className="logo-container-ledwall-secondo">
                <img src={logoSponsor2} alt="Logo Sponsor" className="header-logo" />
            </div>
        </div>


    );
}
