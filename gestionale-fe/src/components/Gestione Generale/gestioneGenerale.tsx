import { LABEL_CONSTANT } from "constants/label_costant";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileResponse, FileTypeEnum, getFiles, getTeams, Team, uploadFile } from "services/UserService";
import Navbar from "views/Navbar/navbar";
import './gestioneGenerale.scss';
import * as signalR from "@microsoft/signalr";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
export default function GestioneGenerale() {
    interface Toast {
        message: string;
        type: 'success' | 'error';
    }
    interface ImageType {
        id: number;
        src: string;
        name: string;
        size: number;
        type: string;
        file: File;
    }

    const connection = new signalR.HubConnectionBuilder()
        /* .withUrl("http://51.20.66.229:8080/scoreHub") */
        .withUrl("http://localhost:8080/scoreHub")
        .withAutomaticReconnect()
        .build();


    const navigate = useNavigate();
    // Stati per Loghi Squadre
    const [logoImages, setLogoImages] = useState<ImageType[]>([]);
    const [logoFileNames, setLogoFileNames] = useState<string[]>([]);
    const [logoSelectedFiles, setLogoSelectedFiles] = useState<string[]>([]);
    const [logoSelectAll, setLogoSelectAll] = useState(false);
    // Stati per Calendario Partite
    const [calendarFiles, setCalendarFiles] = useState<File[]>([]);
    const [calendarSelectedFiles, setCalendarSelectedFiles] = useState<string[]>([]);
    const [calendarSelectAll, setCalendarSelectAll] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
    const [maleFilter, setMaleFilter] = useState<boolean>(false); // Filtro per maschile
    const [femaleFilter, setFemaleFilter] = useState<boolean>(false); // Filtro per femminile
    const [colors, setColors] = useState<string[]>([]);
    const [gradients, setGradients] = useState<{ GradientId: number, GradientStyle: string }[]>([]);
    const [value, setValue] = useState<string>('');
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [delectedFile, setDeletedFile] = useState<FileResponse>();
    const [tempFilterValue, setTempFilterValue] = useState<Date | null>(null);
    const [fileData, setFileData] = useState<FileResponse[]>([]);
    const [filteredData, setFilteredData] = useState<FileResponse[]>([]);

    useEffect(() => {
        const fetchFile = async () => {
            try {
                const data = await getFiles();
                setFileData(data);
                setFilteredData(data);
            } catch (error) {
                console.error('Errore durante il recupero dei dati delle partite:', error);
            }
        };
        fetchFile();
    }, []);

    const [filters, setFilters] = useState<{
        UploadDate: { value: Date | null; dateFile: string };
    }>({
        UploadDate: { value: null, dateFile: 'custom' },
    });

    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day} - ${month} - ${year}`;
    };


    const dateFilter = (value: string | number | Date, UploadDate: { value: string | number | Date }) => {
        if (!UploadDate || !UploadDate.value) {
            return true; // Mostra tutti i record se non c'è un filtro
        }

        const filterDate = new Date(UploadDate.value).setHours(0, 0, 0, 0); // Normalizza a mezzanotte
        const recordDate = new Date(value).setHours(0, 0, 0, 0); // Normalizza la data del record
        return recordDate === filterDate;
    };


    const applyFilter = () => {
        setFilters({
            ...filters,
            UploadDate: { value: tempFilterValue, dateFile: 'custom' },
        });
    };

    const clearFilter = () => {
        setTempFilterValue(null); // Resetta il valore del calendario
        setFilters({
            ...filters,
            UploadDate: { value: null, dateFile: 'custom' },
        });
    };

    // Gestione dei file duplicati
    const isDuplicateFile = (file: File, fileType: "logo" | "calendar") => {
        const fileArray = fileType === "logo" ? logoImages : calendarFiles;
        return fileArray.some(
            (img: any) => img.name === file.name && img.size === file.size && img.type === file.type
        );
    };
    // Controllo del formato del file
    const isValidFileFormat = (file: File, fileType: "logo" | "calendar") => {
        if (fileType === "logo") {
            const validTypes = ["image/jpeg", "image/png", "image/svg+xml"];
            const validExtensions = ['jpeg', 'jpg', 'png', 'svg'];
            const isValidType = validTypes.includes(file.type);
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            const isValidExtension = fileExtension ? validExtensions.includes(fileExtension) : false;
            return isValidType && isValidExtension;
        } else if (fileType === "calendar") {
            // Formati validi per il calendario: CSV e PDF
            const validExtensions = ['csv', 'pdf'];
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            return validExtensions.includes(fileExtension || '');
        }
        return false;
    };
    // Caricamento dei loghi
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newImages: ImageType[] = [];
            const newFileNames: string[] = [];
            const fileArray = Array.from(files);
            for (const file of fileArray) {
                if (!isValidFileFormat(file, "logo")) {
                    setToast({
                        message: `Il formato del file ${file.name} non è supportato. Formati validi: PNG, JPEG, JPG, SVG.`,
                        type: 'error',
                    });
                    continue;
                }

                if (isDuplicateFile(file, "logo")) {
                    setToast({
                        message: `Il file ${file.name} è già stato caricato.`,
                        type: 'error',
                    });
                    continue;
                }

                newImages.push({
                    id: logoImages.length + newImages.length + 1,
                    src: URL.createObjectURL(file),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file: file,
                });

                newFileNames.push(file.name);
            }

            setLogoImages(prevImages => [...prevImages, ...newImages]);
            setLogoFileNames(prevFileNames => [...prevFileNames, ...newFileNames]);
        }
    };
    // Caricamento dei calendari
    const handleCalendarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);

            for (const file of newFiles) {
                if (!isValidFileFormat(file, "calendar")) {
                    setToast({
                        message: `Il formato del file ${file.name} non è supportato. Formati validi: CSV, PDF.`,
                        type: 'error',
                    });
                    continue;
                }
                if (isDuplicateFile(file, "calendar")) {
                    setToast({
                        message: `Il file ${file.name} è già stato caricato.`,
                        type: 'error',
                    });
                    continue;
                }
                setCalendarFiles(prevFiles => [...prevFiles, file]);
            }
        }
    };
    // Gestione selezione multipla per loghi
    const handleLogoSelectAllChange = () => {
        if (logoSelectAll) {
            setLogoSelectedFiles([]);
        } else {
            setLogoSelectedFiles([...logoFileNames]);
        }
        setLogoSelectAll(prev => !prev);
    };
    // Gestione selezione singola per loghi 
    const handleLogoCheckboxChange = (fileName: string) => {
        setLogoSelectedFiles(prevSelected =>
            prevSelected.includes(fileName)
                ? prevSelected.filter(name => name !== fileName)
                : [...prevSelected, fileName]
        );
    };
    // Gestione selezione multipla per calendari
    const handleCalendarSelectAllChange = () => {
        if (calendarSelectAll) {
            setCalendarSelectedFiles([]);
        } else {
            setCalendarSelectedFiles([...calendarFiles.map(file => file.name)]);
        }
        setCalendarSelectAll(prev => !prev);
    };
    // Gestione selezione singola per calendari
    const handleCalendarCheckboxChange = (fileName: string) => {
        setCalendarSelectedFiles(prevSelected =>
            prevSelected.includes(fileName)
                ? prevSelected.filter(name => name !== fileName)
                : [...prevSelected, fileName]
        );
    };
    // Rimozione dei file selezionati
    const handleRemoveSelected = (fileType: "logo" | "calendar") => {
        if (fileType === "logo") {
            const remainingImages = logoImages.filter(img => !logoSelectedFiles.includes(img.name));
            setLogoImages(remainingImages);
            setLogoFileNames(logoFileNames.filter(name => !logoSelectedFiles.includes(name)));
            setLogoSelectedFiles([]);
            setLogoSelectAll(false);
        } else if (fileType === "calendar") {
            setCalendarFiles(calendarFiles.filter(file => !calendarSelectedFiles.includes(file.name)));
            setCalendarSelectedFiles([]);
            setCalendarSelectAll(false);
        }
    };
    // Funzione di invio per i loghi
    const handleLogoSubmit = async () => {
        try {
            const filesToUpload = logoImages.map(img => img.file);
            const response = await uploadFile(filesToUpload, FileTypeEnum.PNG);
            console.log('Loghi caricati con successo:', response);
            setLogoImages([]);
            setLogoFileNames([]);
            setToast({
                message: "Loghi caricati con successo.",
                type: 'success',
            });
        } catch (error) {
            console.error('Errore durante il caricamento dei loghi:', error);
            setToast({
                message: 'Errore durante il caricamento dei loghi.',
                type: 'error',
            });
        }
    };
    // Funzione di invio per il calendario
    const handleCalendarSubmit = async () => {
        try {
            const filesToUpload = calendarFiles;
            // Determina dinamicamente il tipo di file in base all'estensione
            const fileType = calendarFiles.every(file => file.name.toLowerCase().endsWith('.csv'))
                ? FileTypeEnum.CSV
                : FileTypeEnum.PDF;
            const response = await uploadFile(filesToUpload, fileType); // Passa il tipo corretto
            console.log('Calendario caricato con successo:', response);
            setCalendarFiles([]); // Pulisci i file caricati
            setToast({
                message: "Calendario caricato con successo.",
                type: 'success',
            });
        } catch (error) {
            console.error('Errore durante il caricamento del calendario:', error);
            setToast({
                message: 'Errore durante il caricamento del calendario.',
                type: 'error',
            });
        }
    };
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const teamData: Team[] = await getTeams();
                // Mappa i dati ricevuti nel formato corretto per Team
                const mappedTeams: Team[] = teamData.map((team, index) => ({
                    id: index + 1, // Assegna un ID univoco (qui usa l'indice come esempio)
                    name: team.name,
                    logo: team.logo,
                }));
                setTeams(mappedTeams); // Aggiorna lo stato con le squadre mappate
            } catch (error) {
                console.error("Errore durante il caricamento delle squadre:", error);
            }
        };
        fetchTeams();
    }, []);
    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const teamId = parseInt(e.target.value, 10);
        setSelectedTeam(teamId);
    };
    useEffect(() => {
        connection.start()
            .then(() => {
                console.log("Connessione SignalR stabilita");
                // Ascolta gli aggiornamenti dei colori e gradienti
                connection.on("ReceiveColorUpdate", async (colorUpdate: { Colors: string[], Gradients: { GradientId: number, GradientStyle: string }[] }) => {
                    console.log("Aggiornamento colori ricevuto:", colorUpdate);
                    const { Colors, Gradients } = colorUpdate;
                    // Esempio: Imposta i colori e i gradienti ricevuti nel tuo stato
                    if (Colors) {
                        setColors(Colors); // Ad esempio, imposta i colori nel tuo stato
                    }

                    if (Gradients) {
                        setGradients(Gradients); // Imposta i gradienti nel tuo stato
                    }

                    // Puoi aggiungere qui altre logiche per aggiornare altre variabili di stato
                });
            })
            .catch(err => {
                console.error("Errore nell'avvio della connessione SignalR: ", err);
            });
        return () => {
            connection.stop();
        };
    }, []);

    const handleDialogClose = () => {
        setIsDialogVisible(false);
    };

    const handleDeleteFile = (file: FileResponse) => {
        setDeletedFile(file);
    }

    return (
        <div className="dashboard">
            <Navbar />
            <div className="login-container">
                <Panel header="Elenco calendari" className="panel-header">
                    <div className="title">{LABEL_CONSTANT.lista_calendario}</div>
                    <div className="subtitle-dashboard">{LABEL_CONSTANT.lista_calendari}</div>
                    <button className="aggiungi" onClick={() => setIsDialogVisible(true)} >
                        {LABEL_CONSTANT.carica_calendario}
                    </button>
                    <DataTable
                        value={filteredData
                            .filter((file) => file.uploadDate)
                            .map((file) => ({
                                ...file,
                                fileName: file.fileName ?? "N/A", // Nome file predefinito
                                uploadDate: file.uploadDate ?? "N/A", // Data caricamento predefinita
                            }))}
                        scrollable
                        scrollHeight="400px"
                        tableStyle={{ minWidth: '50rem' }}
                    >
                        <Column field="fileName" header="Nome file" className="column" />
                        <Column
                            field="uploadDate"
                            header="Data caricamento"
                            body={(rowData) => formatDate(new Date(rowData.uploadDate))}
                            style={{ width: '20%' }}
                            filter
                            filterField="uploadDate" // Nome corretto del campo
                            filterMatchMode="custom" // Modalità filtro personalizzata
                            filterFunction={dateFilter} // Funzione filtro personalizzata
                            filterElement={(options) => (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar
                                        value={tempFilterValue}
                                        onChange={(e) => setTempFilterValue(e.value || null)} // Gestione dello stato
                                        dateFormat="dd/mm/yy" // Formato della data
                                        placeholder="Seleziona una data"
                                        icon="pi pi-calendar"
                                        showIcon
                                    />
                                </div>
                            )}
                        />
                        <Column
                            header="Azione"
                            className="column"
                            body={(file) => (
                                <Button
                                    icon="pi pi-trash"
                                    label="Elimina"
                                    onClick={() => handleDeleteFile(file)}
                                    className="p-button-secondary"
                                />
                            )}
                            style={{ width: '10%' }}
                        ></Column>
                    </DataTable>
                </Panel>
                <Dialog
                    header="Carica il calendario"
                    visible={isDialogVisible}
                    style={{ width: '50vw' }}
                    modal
                    onHide={handleDialogClose}
                >
                    <div className="title">{LABEL_CONSTANT.carica_calendario}</div>
                    <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_calendario}</div>
                    <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_sport}</div>
                    <select
                        value={selectedTeam ?? ""}
                        onChange={handleTeamChange}
                        className="team-select"
                    >
                        <option value="" disabled>
                            {LABEL_CONSTANT.seleziona_sport}
                        </option>
                        {teams.map(team => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                    <div className="subtitle-dashboard">{LABEL_CONSTANT.inserisci_categoria}</div>
                    <InputText
                        value={value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                        className="team-select"
                    />
                    <div className="subtitle-dashboard">{LABEL_CONSTANT.inserisci_girone}</div>
                    <InputText
                        value={value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                        className="team-select"
                    />
                    <input
                        className="upload"
                        type="file"
                        accept=".csv, .pdf"
                        multiple
                        onChange={handleCalendarUpload}
                    />

                    <div className="select-all-container">
                        {calendarFiles.length > 0 && (
                            <>
                                <input
                                    className="upload"
                                    type="checkbox"
                                    checked={calendarSelectAll}
                                    onChange={handleCalendarSelectAllChange}
                                />
                                {LABEL_CONSTANT.selezione_multipla}
                            </>
                        )}
                    </div>
                    <div className="file-names-list">
                        {calendarFiles.slice(0, 4).map((file, index) => (
                            <div key={index} className="file-name-container">
                                <input
                                    className="upload"
                                    type="checkbox"
                                    id={`calendar-checkbox-${file.name}`}
                                    checked={calendarSelectedFiles.includes(file.name)}
                                    onChange={() => handleCalendarCheckboxChange(file.name)}
                                />
                                <label htmlFor={`calendar-checkbox-${file.name}`} className="file-name">
                                    {file.name}
                                </label>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleCalendarSubmit}
                        disabled={calendarFiles.length === 0}
                    >
                        {LABEL_CONSTANT.carica_calendario}
                    </button>
                </Dialog>

                <Panel header="Carica i loghi" style={{ marginBottom: '20px' }}>
                    <div className="title">{LABEL_CONSTANT.carica_logo}</div>
                    <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_loghi}</div>
                    <input className="upload"
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml"
                        multiple
                        onChange={handleLogoUpload}
                    />
                    <div className="select-all-container">
                        <select
                            value={selectedTeam ?? ""}
                            onChange={handleTeamChange}
                            className="team-select"
                        >
                            <option value="" disabled>
                                {LABEL_CONSTANT.seleziona_squadra}
                            </option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                        {logoFileNames.length > 0 && (
                            <>
                                <input className="upload"
                                    type="checkbox"
                                    checked={logoSelectAll}
                                    onChange={handleLogoSelectAllChange}
                                />
                                {LABEL_CONSTANT.selezione_multipla}
                            </>
                        )}
                    </div>

                    <div className="file-names-list">
                        {logoFileNames.slice(0, 4).map((file, index) => (
                            <div key={index} className="file-name-container">
                                <input className="upload"
                                    type="checkbox"
                                    id={`logo-checkbox-${file}`}
                                    checked={logoSelectedFiles.includes(file)}
                                    onChange={() => handleLogoCheckboxChange(file)}
                                />
                                <label htmlFor={`logo-checkbox-${file}`} className="file-name">
                                    {file}
                                </label>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleLogoSubmit} disabled={logoImages.length === 0}>
                        {LABEL_CONSTANT.carica_logo}
                    </button>

                </Panel>
                {toast && (
                    <div className={`toast ${toast.type}`}>
                        {toast.message}
                    </div>
                )}
            </div>
        </div>
    );
}
