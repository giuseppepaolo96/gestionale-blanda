import './diretta.scss';
import logoSponsor from '../../assets/images/faam_spa_senza-sfondo.png';
import defaultLogo from '../../assets/images/default-logo.png';
import { useEffect, useState } from 'react';
import * as signalR from "@microsoft/signalr";
import { getMatchData, getSponsors, getTeamLogos, MatchDataResponse, Team } from 'services/UserService';
import axios from 'axios';
import 'primeicons/primeicons.css'; // Import PrimeIcons
import { useParams } from 'react-router-dom';

export interface SponsorResponse {
    name: string;
    logoBase64: string;
}

export default function Diretta() {
    const { matchId } = useParams();
    console.log('matchId estratto da useParams:', matchId);
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [setScores, setSetScores] = useState<number[][]>([[], [], [], [], []]); // Inizializza 5 set vuoti
    const [setsCount, setSetsCount] = useState(1);  // Numero di set
    const [set, setCompleteSet] = useState(1); // Indice del set corrente, inizia da 1
    const [homeTeam, setHomeTeam] = useState<Team | null>(null); // Lo stato può essere un oggetto o null
    const [awayTeam, setAwayTeam] = useState<Team | null>(null);
    const [homeTeamLogo, setHomeTeamLogo] = useState<string | null>(null);
    const [awayTeamLogo, setAwayTeamLogo] = useState<string | null>(null);
    const [sponsors, setSponsors] = useState<SponsorResponse[]>([]);
    const [possession, setPossession] = useState<'home' | 'away' | null>(null); // Stato per il possesso
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reset, resetMatch] = useState(false);

    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${process.env.REACT_APP_API_BASE_URL}/scoreHub`)
        .withAutomaticReconnect()
        .build();

    const fetchSponsors = async () => {
        try {
            // Recupera l'URL di base dalla variabile di ambiente
            const apiUrl = process.env.REACT_APP_API_BASE_URL;

            // Controlla che apiUrl sia definito
            if (!apiUrl) {
                console.error('API base URL is not defined!');
                return;
            }

            // Usa la sintassi di template literals per concatenare
            const response = await axios.get<SponsorResponse[]>(`${apiUrl}/api/sponsor`);
            console.log('Sponsors fetched:', response.data);
            setSponsors(response.data);
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
    }, [matchId]);  // Esegui quando matchId cambia


    const fetchMatchData = async (matchId: number) => {
        try {
            const matchData: MatchDataResponse[] = await getMatchData();
            const match = matchData.find(m => m.matchNumber === matchId); // Usa matchNumber per il confronto
            if (match) {
                setHomeTeam(match.homeTeam);  // Imposta il team di casa
                setAwayTeam(match.awayTeam);  // Imposta il team ospite
                setHomeScore(0);              // Resetta il punteggio della squadra di casa
                setAwayScore(0);              // Resetta il punteggio della squadra ospite
                setSetScores([[], [], [], [], []]); // Resetta i punteggi dei set
            }
        } catch (error) {
            console.error('Failed to fetch match data', error);
        }
    };


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


    useEffect(() => {
        fetchSponsors();

        if (!matchId) {
            console.log("matchId non definito, non posso iniziare a ricevere aggiornamenti.");
            return; // Esci se matchId non è disponibile
        }

        connection.start()
            .then(() => {
                console.log("Connessione SignalR stabilita");

                connection.on("ReceiveScoreUpdate", async (matchUpdate) => {
                    console.log("Dati ricevuti:", matchUpdate);

                    // Blocco qualsiasi aggiornamento se i matchId non corrispondono
                     if (!matchId || !matchUpdate.matchId || parseInt(matchId, 10) !== Number(matchUpdate.matchId)) {
                        console.log(`Aggiornamento ignorato: ricevuto ${matchUpdate.matchId}, atteso ${matchId}.`);
                        return;
                    } 

                        if (!matchId || !matchUpdate.matchId || Number(matchId) !== Number(matchUpdate.matchId)) {
                            console.log(`Aggiornamento ignorato: ricevuto ${matchUpdate.matchId} (tipo: ${typeof matchUpdate.matchId}), atteso ${matchId} (tipo: ${typeof matchId}).`);
                            return;
                        }
                        

                    console.log(`matchId ricevuto: ${matchUpdate.matchId}, matchId attuale: ${matchId}`);

                    // Aggiorna i punteggi solo se sono definiti
                    if (matchUpdate.scoreCasa !== undefined && matchUpdate.scoreOspite !== undefined) {
                        console.log("Updating scores: ", matchUpdate.scoreCasa, matchUpdate.scoreOspite);
                        setHomeScore(matchUpdate.scoreCasa);
                        setAwayScore(matchUpdate.scoreOspite);
                    }

                    // Aggiorna i set se il set è definito
                    if (matchUpdate.set !== undefined) {
                        setSetsCount(matchUpdate.set);
                        setCompleteSet(matchUpdate.set);

                        setSetScores((prevSetScores) => {
                            const newSetScores = [...prevSetScores];
                            if (!newSetScores[matchUpdate.set - 1]) {
                                newSetScores[matchUpdate.set - 1] = [0, 0];
                            }
                            newSetScores[matchUpdate.set - 1] = [matchUpdate.scoreCasa || 0, matchUpdate.scoreOspite || 0];
                            return newSetScores;
                        });
                    }

                    // Imposta il possesso corrente
                    if (matchUpdate.possessoCasa === true && matchUpdate.possessoOspite === false) {
                        setPossession('home');
                        console.log("✔️ Possesso aggiornato: home");
                    } else if (matchUpdate.possessoCasa === false && matchUpdate.possessoOspite === true) {
                        setPossession('away');
                        console.log("✔️ Possesso aggiornato: away");
                    } else {
                        console.warn("⚠️ Stato del possesso non chiaro, nessun aggiornamento.");
                    }
                    
                    // Se è stato ricevuto un comando di reset, resettare il match
                    if (matchUpdate.ResetMatch) {
                        console.log("Ricevuto comando di reset del match");
                        resetMatch(true);
                    }
                });
            })
            .catch(err => {
                console.error("Error starting SignalR connection: ", err);
            });

        return () => {
            connection.stop();
        };
    }, [matchId]);



    useEffect(() => {
        const interval = setInterval(() => {
            // Incrementa l'indice per passare al prossimo sponsor
            setCurrentIndex(prevIndex => (prevIndex + 1) % sponsors.length);
        }, 9000); // Intervallo di 3 secondi (puoi modificare questo valore)

        return () => clearInterval(interval); // Pulisce l'intervallo al termine del ciclo di vita del componente
    }, [sponsors.length]);

    return (
        <div className="scoreboard-diretta">
            <div className="diretta">
                <div className="teams-container">
                    {/* Squadra Casa */}
                    <div className="team">
                        <div className="team-logo-container">
                            <div className="team-logo-container">
                                {/*  <div className="color-strip home"></div> */}

                                <img src={homeTeamLogo || defaultLogo} alt="Logo Squadra Ospite" className="team-logo" />

                                <div className="team-info">
                                    <div className="team-name-container">
                                        <div className="team-name">{homeTeam ? homeTeam.name : ""}</div>
                                    </div>
                                </div>
                                <div className="set-info">
                                    <div className="set-info">
                                        {Array.from({ length: set }).map((_, i) => {
                                            const setNumber = i + 1;
                                            return (
                                                <div key={setNumber} className="set-container">
                                                    <div className="set-label">Set</div>
                                                    <div className="set-number">{setNumber}°</div>
                                                    <div className="set-scores">
                                                        {setScores[setNumber - 1]?.[0] || 0}
                                                        {/* Mostra il cerchio se la squadra di casa ha il possesso */}
                                                        {setNumber === set && possession === 'home' && (
                                                            <div className="set-icon-container">
                                                                <i
                                                                    className="pi pi-circle-fill set-icon"
                                                                ></i>
                                                            </div>
                                                        )}


                                                    </div>
                                                </div>
                                            );
                                        })}

                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="divider"></div>

                    {/* Squadra Ospite */}
                    <div className="team">
                        <div className="team-logo-container">

                            {/*  <div className="color-strip away"></div> */}

                            <img src={awayTeamLogo || defaultLogo} alt="Logo Squadra Ospite" className="team-logo" />
                            <div className="team-info">
                                <div className="team-name-container">
                                    <div className="team-name">{awayTeam ? awayTeam.name : ""}</div>
                                </div>
                            </div>
                            <div className="set-info">
                                <div className="set-info">
                                    {Array.from({ length: set }).map((_, i) => {
                                        const setNumber = i + 1;
                                        return (
                                            <div key={setNumber} className="set-container">
                                                <div className="set-scores">
                                                    {setScores[setNumber - 1]?.[1] || 0}
                                                    {/* Mostra il cerchio se la squadra ospite ha il possesso */}
                                                    {setNumber === set && possession === 'away' && (
                                                        <div className="set-icon-container">
                                                            <i
                                                                className="pi pi-circle-fill set-icon"
                                                            ></i>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logo Sponsor */}
            <div className="logo-container-diretta">
                <img src={logoSponsor} alt="Logo Sponsor" className="header-logo" />
            </div>

            {/* Carousel */}
            <div className="carousel-container-dir">
                <div className="carousel-scroll-vert">
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


        </div>
    );
}


