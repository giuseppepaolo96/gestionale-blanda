import './diretta.scss';
import logoSponsor from '../../assets/images/faam_spa_logo-removebg-preview.jpg';
import image1 from '../../assets/images/DREAMVOLLEY NARDO.jpg';
import image2 from '../../assets/images/FAAM MATESE.jpg';
import { useEffect, useState } from 'react';
import * as signalR from "@microsoft/signalr";
import { getMatchData, getSponsors, MatchDataResponse } from 'services/UserService';
import axios from 'axios';
import 'primeicons/primeicons.css'; // Import PrimeIcons

export interface SponsorResponse {
    name: string;
    logoBase64: string;
}

export default function Diretta() {
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [setScores, setSetScores] = useState<number[][]>([[], [], [], [], []]); // Inizializza 5 set vuoti
    const [setsCount, setSetsCount] = useState(1);  // Numero di set
    const [set, setCompleteSet] = useState(1); // Indice del set corrente, inizia da 1
    const [homeTeam, setHomeTeam] = useState("");
    const [awayTeam, setAwayTeam] = useState("");
    const [sponsors, setSponsors] = useState<SponsorResponse[]>([]);
    const [possession, setPossession] = useState<'home' | 'away' | null>(null); // Stato per il possesso
    const [currentIndex, setCurrentIndex] = useState(0);

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

                    const { matchId, scoreCasa, scoreOspite, set: currentSet, possessoCasa, possessoOspite } = matchUpdate;

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

    // Funzione per determinare le classi in base alla lunghezza dei nomi
    /*    const getTeamClasses = (homeTeam: string, awayTeam: string) => {
           // Confronta la lunghezza dei nomi delle squadre solo quando sono stati caricati
           if (homeTeam.length > awayTeam.length) {
               return {
                   homeClass: 'team-name-long', // La squadra di casa ha il nome più lungo
                   awayClass: 'team-name-short' // La squadra ospite ha il nome più corto
               };
           } else if (awayTeam.length > homeTeam.length) {
               return {
                   homeClass: 'team-name-short', // La squadra di casa ha il nome più corto
                   awayClass: 'team-name-long' // La squadra ospite ha il nome più lungo
               };
           } else {
               // Se i nomi sono uguali, possiamo gestirlo come preferisci
               return {
                   homeClass: 'team-name-short', // In caso di parità, assegniamo la classe breve
                   awayClass: 'team-name-short' // Anche all'ospite
               };
           }
       }; */

    /*     // Calcoliamo le classi per casa e ospite
        const { homeClass, awayClass } = getTeamClasses(homeTeam, awayTeam); */


    useEffect(() => {
        const interval = setInterval(() => {
            // Incrementa l'indice per passare al prossimo sponsor
            setCurrentIndex(prevIndex => (prevIndex + 1) % sponsors.length);
        }, 9000); // Intervallo di 3 secondi (puoi modificare questo valore)

        return () => clearInterval(interval); // Pulisce l'intervallo al termine del ciclo di vita del componente
    }, [sponsors.length]);

    return (
        <div className="scoreboard">
            <div className="diretta">
                <div className="teams-container">
                    {/* Squadra Casa */}
                    <div className="team">
                        <div className="team-logo-container">
                            <div className="team-logo-container">
                                <div className="color-strip home"></div>
                                <img src={image1} alt="Logo Squadra Casa" className="team-logo" />
                            </div>
                            <div className="team-info">
                                <div className="team-name-container">
                                    <h2 className="team-name-long">{homeTeam || "DREAM VOLLEY 2011 ASD"}</h2>
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
                                                            <i
                                                                className="pi pi-circle-fill set-icon"
                                                            ></i>
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
                            <div className="color-strip away"></div>
                            <img src={image2} alt="Logo Squadra Ospite" className="team-logo" />
                        </div>
                        <div className="team-info">
                            <div className="team-name-container">
                                <h2 className="team-name-short">{awayTeam || "POLISPORTIVA MATESE"}</h2>
                            </div>
                            <div className="set-info">
                                {Array.from({ length: set }).map((_, i) => {
                                    const setNumber = i + 1;
                                    return (
                                        <div key={setNumber} className="set-container">
                                            <div className="set-scores">
                                                {setScores[setNumber - 1]?.[1] || 0}
                                                {/* Mostra il cerchio se la squadra ospite ha il possesso */}
                                                {setNumber === set && possession === 'away' && (
                                                    <i
                                                        className="pi pi-circle-fill set-icon"
                                                    ></i>
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
