import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import defaultLogo from '../../assets/images/default_white.png';
import logoSponsor1 from '../../assets/images/faam_spa_senza-sfondo.png';
import logoSponsor2 from '../../assets/images/SPONSOR_CARBAT-removebg-preview.png';
import './ledwall.scss';
import axios from 'axios';
import { LABEL_CONSTANT } from "constants/label_costant";
import { getMatchData, getTeamLogos, MatchDataResponse, Team } from 'services/UserService';
import { useParams } from "react-router-dom";

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
    const { matchId } = useParams();
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [setScores, setSetScores] = useState<number[][]>([[], [], [], [], []]);
    const [homeTeam, setHomeTeam] = useState<Team | null>(null); // Lo stato può essere un oggetto o null
    const [awayTeam, setAwayTeam] = useState<Team | null>(null);
    const [day, setDay] = useState("");
    const [matchNumber, setMatchNumber] = useState<number | null>(null);
    const [matchDate, setMatchDate] = useState("");
    const [dayOfWeek, setDayOffWeek] = useState("");
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
    const [homeTeamLogo, setHomeTeamLogo] = useState<string | null>(null);
    const [awayTeamLogo, setAwayTeamLogo] = useState<string | null>(null);
    const [isMale, setIsMale] = useState<boolean>(false);
    const [isFemale, setIsFemale] = useState<boolean>(false);
    const [winner, setMatchWinner] = useState<Team | null>(null);

    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${process.env.REACT_APP_API_BASE_URL}/scoreHub`)
        .withAutomaticReconnect([0, 2000, 5000, 10000]) // tentativi dopo 0s, 2s, 5s, 10s

        .build();
    connection.onreconnecting(() => console.warn('Tentativo di riconnessione...'));
    connection.onreconnected(() => console.log('Riconnesso a SignalR'));
    connection.onclose(() => console.error('Connessione chiusa, tentativo di riavvio...'));

    const fetchSponsors = async () => {
        try {
            // Recupera l'URL di base dalla variabile di ambiente
            const apiUrl = process.env.REACT_APP_API_BASE_URL;

            // Controlla che apiUrl sia definito
            if (!apiUrl) {
                console.error('API base URL is not defined!');
                return;
            }

            // Effettua la richiesta GET
            const response = await axios.get<SponsorResponse[]>(`${apiUrl}/api/sponsor`);
            console.log('Sponsors fetched:', response.data);

            // Filtra i risultati escludendo quelli che contengono 'CARBAT' nel nome (case-insensitive)
            const filteredSponsors = response.data.filter(sponsor =>
                !sponsor.name.toLowerCase().includes('carbat')
            );
            console.log('Filtered sponsors:', filteredSponsors);

            // Imposta lo stato con i risultati filtrati
            setSponsors(filteredSponsors);
        } catch (error) {
            console.error('Error fetching sponsors:', error);
        }
    };

    useEffect(() => {
        if (matchId) {
            const parsedMatchId = parseInt(matchId, 10);  // Parsiamo il matchId in numero
            if (!isNaN(parsedMatchId)) {
                fetchMatchData(parsedMatchId);  // Passa matchId alla funzione per recuperare i dati
            } else {
                console.error('matchId non valido');
            }
        }
    }, [matchId]);

    const fetchMatchData = async (matchId: number) => {
        try {
            const matchData = await getMatchData();
            const match = matchData.find(m => m.matchNumber === matchId); // Usa matchNumber per il confronto
            if (match) {
                setHomeTeam(match.homeTeam);
                setAwayTeam(match.awayTeam);
                setDay(match.day);
                setDayOffWeek(match.dayOfWeek);

                const date = new Date(match.matchDate);
                const day = date.getDate();
                const months = [
                    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
                    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"
                ];
                const month = months[date.getMonth()];
                const year = date.getFullYear();
                const formattedDate = `${day} ${month} ${year}`;

                setMatchDate(formattedDate); // Imposta la data formattata
                setMatchNumber(match.matchNumber);


                setHomeScore(0);
                setAwayScore(0);

                setSetScores([[], [], [], [], []]); // Resetta i punteggi dei set

                const isMaleFlag = match.male;
                const isFemaleFlag = match.female;

                // Impostiamo direttamente i valori booleani
                setIsMale(isMaleFlag || false); // default a false se undefined
                setIsFemale(isFemaleFlag || false); // default a false se undefined

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
                connection.onreconnecting(() => console.warn('Tentativo di riconnessione...'));
                connection.onreconnected(() => console.log('Riconnesso a SignalR'));
                connection.onclose(() => console.error('Connessione chiusa, tentativo di riavvio...'));
                connection.on("ReceiveScoreUpdate", async (matchUpdate) => {
                    console.log("Dati ricevuti:", matchUpdate);

                    if (matchId && matchUpdate.matchId && parseInt(matchId, 10) === Number(matchUpdate.matchId)) {
                        console.log("Aggiornamento ricevuto per il matchId corretto:", matchUpdate);
                        const { matchId, scoreCasa, scoreOspite, set: currentSet, possessoCasa, possessoOspite, timeoutHome, timeoutAway, matchWinner } = matchUpdate;


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

                        if (matchWinner) {
                            // Se matchWinner è il nome della squadra vincente, imposta direttamente il vincitore
                            setMatchWinner(matchWinner);
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
                    } else {
                        console.log("matchId non corrisponde, ignorando aggiornamento...");
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



    useEffect(() => {
        const fetchLogos = async () => {
            if (!homeTeam || !awayTeam) return;

            try {
                const teams = await getTeamLogos();  // Recupera tutte le squadre con i loghi

                // Trova il logo per la squadra di casa e la squadra ospite
                const homeTeamLogoBase64 = teams.find((team) => team.name.toLowerCase() === homeTeam.name.toLowerCase())?.logo || null;
                const awayTeamLogoBase64 = teams.find((team) => team.name.toLowerCase() === awayTeam.name.toLowerCase())?.logo || null;

                // Se il logo è in formato Base64
                const homeLogoUrl = homeTeamLogoBase64?.startsWith('data:image/png;base64,')
                    ? homeTeamLogoBase64
                    : `data:image/png;base64,${homeTeamLogoBase64}`;

                const awayLogoUrl = awayTeamLogoBase64?.startsWith('data:image/png;base64,')
                    ? awayTeamLogoBase64
                    : `data:image/png;base64,${awayTeamLogoBase64}`;

                // Imposta i loghi nelle variabili di stato
                setHomeTeamLogo(homeLogoUrl || defaultLogo);
                setAwayTeamLogo(awayLogoUrl || defaultLogo);
            } catch (error) {
                console.error("Errore durante il recupero dei loghi delle squadre:", error);
                setHomeTeamLogo(defaultLogo);  // Imposta un logo di default in caso di errore
                setAwayTeamLogo(defaultLogo);  // Imposta un logo di default in caso di errore
            }
        };

        fetchLogos();
    }, [homeTeam, awayTeam]);



    return (
        <div className="scoreboard-ledwall">
            <div className="match-info">
                <h1>
                    {LABEL_CONSTANT.campionato} {LABEL_CONSTANT.categoria_partita} {LABEL_CONSTANT.girone} {isFemale ? LABEL_CONSTANT.femminile : isMale ? LABEL_CONSTANT.maschile : ""}
                </h1>
                <h1>
                    {day}{LABEL_CONSTANT.giornata} - {dayOfWeek} {matchDate} - {LABEL_CONSTANT.numero} {matchNumber}
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
                        <img src={homeTeamLogo || defaultLogo} alt="Logo Squadra Ospite" className="team-logo" />

                    </div>
                    <span className="team-name-prima">{homeTeam ? homeTeam.name : ""}</span>
                </div>
                <div className="score">
                    {winner ? (
                        <div className="winner">
                            {LABEL_CONSTANT.winner + " " + winner} {/* Concatenando in una singola stringa */}
                        </div>
                    ) : (
                        <div className="score-container">
                            <span className="score-value">{homeScore}</span>
                            <span className="versus">{LABEL_CONSTANT.vs}</span>
                            <span className="score-value">{awayScore}</span>
                        </div>
                    )}
                </div>




                <div className="team">
                    <div className="logo-score">
                        {[...Array(timeoutsAway)].map((_, index) => (
                            <div key={index} className="timeout-icon-away">
                                <i className="pi pi-stopwatch"></i>
                            </div>
                        ))}
                        <img src={awayTeamLogo || defaultLogo} alt="Logo Squadra Ospite" className="team-logo" />
                        <span className="team-score">{winSetAway}</span>
                    </div>
                    <div className="team-name-seconda">{awayTeam ? awayTeam.name : ""}</div >
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
                                    <span className="stripe-value">{set[0]}</span>
                                    <span className="stripe-value-separator">-</span>
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
