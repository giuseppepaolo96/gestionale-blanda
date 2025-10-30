import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "views/Navbar/navbar";
import './sponsor.scss';
import SponsorCarousel from "components/Carousel/carousel";
import { LABEL_CONSTANT } from "constants/label_costant";
import { deleteSponsor, getSponsors, SponsorResponse, uploadFile } from "services/UserService"; // Cambia il nome del servizio per caricare più file
import { FileTypeEnum } from "services/UserService";
import { Panel } from "primereact/panel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

// Aggiungere un tipo per il toast
interface Toast {
    message: string;
    type: 'success' | 'error';
}

interface CarouselSettings {
    displayDuration: number;
    sequentialMode: boolean;
    scrollDirection: 'horizontal' | 'vertical' | 'both';
    singleImageMode: boolean;
    displayPosition: 'top' | 'bottom' | 'center';
    displayMode: 'diretta' | 'ledwall' | 'entrambi';
}

interface ImageType {
    id: number;
    src: string;
    name: string;
    size: number;
    type: string;
    file: File;
}

export default function Sponsor() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [images, setImages] = useState<ImageType[]>([]);
    const [fileNames, setFileNames] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);  // Stato per il toast
    const [sponsor, setSponsor] = useState<SponsorResponse[]>([]);
    const [isLogoDialogVisible, setSponsorDialogVisible] = useState(false);
    const [carouselSettings, setCarouselSettings] = useState<CarouselSettings>({
        displayDuration: 3000,
        sequentialMode: true,
        scrollDirection: 'horizontal',
        singleImageMode: false,
        displayPosition: 'top',
        displayMode: 'ledwall',
    });

    // Funzione per validare il formato del file
    const isValidFileFormat = (file: File) => {
        const validTypes = ["image/jpeg", "image/png", "image/svg+xml"];
        const validExtensions = ['jpeg', 'jpg', 'png', 'svg'];

        const isValidType = validTypes.includes(file.type);
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const isValidExtension = fileExtension ? validExtensions.includes(fileExtension) : false;

        return isValidType && isValidExtension;
    };

    // Funzione per controllare duplicati
    const isDuplicateFile = (file: File) => {
        return images.some(
            (img) => img.name === file.name && img.size === file.size && img.type === file.type
        );
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newImages: ImageType[] = [];
            const newFileNames: string[] = [];

            const fileArray = Array.from(files);

            for (const file of fileArray) {
                if (!isValidFileFormat(file)) {
                    setToast({
                        message: `Il formato del file ${file.name} non è supportato. Formati validi: PNG, JPEG, JPG, SVG.`,
                        type: 'error',
                    });
                    continue;
                }

                if (isDuplicateFile(file)) {
                    setToast({
                        message: `Il file ${file.name} è già stato caricato.`,
                        type: 'error',
                    });
                    continue;
                }

                newImages.push({
                    id: images.length + newImages.length + 1,
                    src: URL.createObjectURL(file),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file: file,
                });

                newFileNames.push(file.name);
            }

            setImages(prevImages => [...prevImages, ...newImages]);
            setFileNames(prevFileNames => [...prevFileNames, ...newFileNames]);
        }
    };

    const handleSubmit = async () => {
        try {
            const filesToUpload = images.map(img => img.file);

            const response = await uploadFile(filesToUpload, FileTypeEnum.PNG);

            console.log('Tutti i file sono stati caricati con successo:', response);

            setImages([]);
            setFileNames([]);
            setToast({
                message: "File caricati con successo.",
                type: 'success',
            });
        } catch (error) {
            console.error('Errore durante il caricamento dei file:', error);
            setToast({
                message: 'Errore durante il caricamento dei file.',
                type: 'error',
            });
        }
    };


    const handleDisplayModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedMode = e.target.value as 'diretta' | 'ledwall' | 'entrambi';
        setCarouselSettings(prevSettings => {
            const updatedSettings = {
                ...prevSettings,
                displayMode: selectedMode,
            };

            if (selectedMode === 'ledwall') {
                updatedSettings.scrollDirection = 'horizontal';
            } else if (selectedMode === 'diretta') {
                updatedSettings.scrollDirection = 'vertical';
            } else {
                updatedSettings.scrollDirection = 'both';
            }

            return updatedSettings;
        });
    };

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' && (e.target as HTMLInputElement).checked;

        setCarouselSettings(prevSettings => ({
            ...prevSettings,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFileClick = (fileName: string) => {
        const file = images.find(img => img.name === fileName);
        if (file) {
            window.open(file.src, "_blank");
        }
    };

    const handleCheckboxChange = (fileName: string) => {
        setSelectedFiles(prevSelected =>
            prevSelected.includes(fileName)
                ? prevSelected.filter(name => name !== fileName)
                : [...prevSelected, fileName]
        );
    };

    const handleSelectAllChange = () => {
        if (selectAll) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles([...fileNames]);
        }
        setSelectAll(prev => !prev);
    };

    const handleRemoveSelected = () => {
        const remainingImages = images.filter(img => !selectedFiles.includes(img.name));
        setImages(remainingImages);
        setFileNames(fileNames.filter(name => !selectedFiles.includes(name)));
        setSelectedFiles([]);
        setSelectAll(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleNavigateToLedwall = () => {
        console.log('Navigating to Ledwall with images:', images);
        navigate('/ledwall', { state: { images } });
    };

    const fetchSponsors = async () => {
        try {
            const data = await getSponsors();
            setSponsor(data);
        } catch (error) {
            console.error("Errore durante il caricamento degli sponsor:", error);
        }
    };

    useEffect(() => {
        fetchSponsors();
    }, []);

    const normalizeName = (name: string) =>
        name.toLowerCase()
            .replace(/^sponsor[_\s-]?/, '')   // rimuove prefisso "logo"
            .replace(/\.[a-z]+$/, '')      // rimuove estensione
            .replace(/[_-]+/g, ' ')      // rimuove spazi, underscore o trattino
            .toUpperCase();
    
    return (
        <div className="dashboard">
            <Navbar />
            <div className="login-container">
                <Panel header="Elenco sponsor" className="panel-header">
                    <div className="title">{LABEL_CONSTANT.lista_sponsor}</div>
                    <div className="subtitle-dashboard">{LABEL_CONSTANT.lista_sponsor_sub}</div>
                    <button className="aggiungi" onClick={() => setSponsorDialogVisible(true)} >
                        {LABEL_CONSTANT.carica_sponsor}
                    </button>
                    <DataTable
                        value={sponsor}
                        scrollable
                        scrollHeight="400px"
                        tableStyle={{ minWidth: '50rem' }}
                        emptyMessage="Nessun sponsor disponibile"
                        
                    >
                        <Column
                            field="name"
                            header="Nome sponsor"
                            className="column"
                            body={(rowData: SponsorResponse) => normalizeName(rowData.name)}
                        />

                        <Column
                            header="Azione"
                            className="column"
                            body={(rowData: SponsorResponse) => (
                                <Button
                                    icon="pi pi-trash"
                                    label="Elimina"
                                    onClick={async () => {
                                        try {
                                            if (!rowData.name) {
                                                console.error("ID sponsor non trovato:", rowData);
                                                return;
                                            }
                                            await deleteSponsor(rowData.id); // ora rowData.id è definito

                                            // Rimuovi dallo stato senza rifare la fetch completa
                                            setSponsor(prev => prev.filter(s => s.id !== rowData.id));
                                        } catch (error) {
                                            console.error("Errore durante l'eliminazione dello sponsor:", error);
                                        }
                                    }}
                                    className="p-button-secondary"
                                />
                            )}
                        />
                    </DataTable>
                </Panel>
                 <Dialog header="Carica gli sponsor"
                    visible={isLogoDialogVisible}
                    style={{ width: '50vw' }}
                    modal
                    onHide={() => setSponsorDialogVisible(false)}
                >
                    <div className="title">{LABEL_CONSTANT.upload_sponsor}</div>
                    <div className="subtitle-dashboard">{LABEL_CONSTANT.subtitle_sponsor_sub}</div>
                    <input
                        className="upload"
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml"
                        multiple
                        onChange={handleImageUpload}
                    />
                     <div className="select-all-container">
                        {fileNames.length > 0 && (
                            <>
                                <input
                                    className="upload"
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAllChange}
                                />
                                {LABEL_CONSTANT.selezione_multipla}
                            </>
                        )}
                    </div>
                    <div className="file-names-list">
                        {fileNames.slice(0, 4).map((name, index) => (
                            <div key={index} className="file-name-container">
                                <input
                                    className="upload"
                                    type="checkbox"
                                    id={`calendar-checkbox-${name}`}
                                    checked={selectedFiles.includes(name)}
                                    onChange={() => handleCheckboxChange(name)}
                                />
                                <label htmlFor={`calendar-checkbox-${name}`} className="file-name">
                                    {name}
                                </label>
                            </div>
                        ))}
                        {fileNames.length > 4 && (
                                <div className="file-name more-files" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                    {LABEL_CONSTANT.sponsor_all}
                                    {isDropdownOpen && (
                                        <div className="dropdown-menu">
                                            {fileNames.slice(4).map((name, index) => (
                                                <div key={index} className="file-name-container">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFiles.includes(name)}
                                                        onChange={() => handleCheckboxChange(name)}
                                                    />
                                                    <div className="dropdown-item" onClick={() => handleFileClick(name)}>
                                                        {name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                    </div>
                    
                    <button
                        onClick={handleSubmit}
                        disabled={fileNames.length === 0}
                    >
                        {LABEL_CONSTANT.carica_sponsor}
                    </button>
                    
                 </Dialog>
                {/* <div className="sponsor-management-container">
                    {LABEL_CONSTANT.title_sezione_sponsor}
                    <div className="upload-section">
                        <h3>Carica Sponsor</h3>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            ref={fileInputRef}
                        />
                        <div className="select-all-container">
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAllChange}
                            />
                            <span>Seleziona tutti</span>
                        </div>
                        <div className="file-names-list">
                            {fileNames.slice(0, 4).map((name, index) => (
                                <div key={index} className="file-name-container">
                                    <input
                                        type="checkbox"
                                        checked={selectedFiles.includes(name)}
                                        onChange={() => handleCheckboxChange(name)}
                                    />
                                    <span className="file-name" onClick={() => handleFileClick(name)}>
                                        {name}
                                    </span>
                                </div>
                            ))}
                            {fileNames.length > 4 && (
                                <span className="file-name more-files" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                    ... e altri
                                    {isDropdownOpen && (
                                        <div className="dropdown-menu">
                                            {fileNames.slice(4).map((name, index) => (
                                                <div key={index} className="file-name-container">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFiles.includes(name)}
                                                        onChange={() => handleCheckboxChange(name)}
                                                    />
                                                    <span className="dropdown-item" onClick={() => handleFileClick(name)}>
                                                        {name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </span>
                            )}
                        </div>
                        <button onClick={handleRemoveSelected} disabled={selectedFiles.length === 0}>
                            Rimuovi Selezionati
                        </button>
                    </div>
                    {toast && (
                        <div className={`toast ${toast.type}`}>
                            {toast.message}
                        </div>
                    )}
                    <div className="carousel-settings">
                        <h3>Impostazioni Carosello</h3>
                        <label>
                            Intervallo di visualizzazione (ms):
                            <input
                                type="number"
                                name="displayDuration"
                                value={carouselSettings.displayDuration}
                                onChange={handleSettingChange}
                            />
                        </label>
                    </div>
                    <button onClick={handleNavigateToLedwall}>Accedi al Ledwall</button>
                    <button onClick={handleSubmit}>Carica tutti i file</button>
                </div> */}
                
                <div className="carousel-preview">
                    <h3>Anteprima Carosello</h3>
                    {images.length > 0 ? (
                        <>
                            {carouselSettings.displayMode === 'ledwall' && (
                                <div className="carousel-section active">
                                    <h4>Visualizzazione su Ledwall</h4>
                                    <SponsorCarousel
                                        defaultImages={images}
                                        defaultDisplayDuration={carouselSettings.displayDuration}
                                        defaultSequentialMode={carouselSettings.sequentialMode}
                                        scrollDirection="horizontal"
                                    />
                                </div>
                            )}
                            {carouselSettings.displayMode === 'diretta' && (
                                <div className="carousel-section active">
                                    <h4>Visualizzazione su Diretta</h4>
                                    <SponsorCarousel
                                        defaultImages={images}
                                        defaultDisplayDuration={carouselSettings.displayDuration}
                                        defaultSequentialMode={carouselSettings.sequentialMode}
                                        scrollDirection="vertical"
                                    />
                                </div>
                            )}
                            {carouselSettings.displayMode === 'entrambi' && (
                                <div className="carousel-section active">
                                    <h4>Visualizzazione su Entrambi</h4>
                                    <div className="both-preview">
                                        <SponsorCarousel
                                            defaultImages={images}
                                            defaultDisplayDuration={carouselSettings.displayDuration}
                                            defaultSequentialMode={carouselSettings.sequentialMode}
                                            scrollDirection="horizontal"
                                        />
                                        <SponsorCarousel
                                            defaultImages={images}
                                            defaultDisplayDuration={carouselSettings.displayDuration}
                                            defaultSequentialMode={carouselSettings.sequentialMode}
                                            scrollDirection="vertical"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p>Nessuno sponsor caricato. Carica un'immagine per visualizzare l'anteprima.</p> 
                    )}
                </div>
            </div>
        </div>
    );
}
