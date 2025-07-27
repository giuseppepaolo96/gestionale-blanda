
import axios, { AxiosError } from 'axios';


export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080', // Default alla porta 8080
});

export interface Squadra {
  Id: string;
  tipologia: string;
}

export interface Categoria {
  Id: string;
  nome: string;
}

export interface Role {
  Id: string;
  ruolo: string;
}

export interface RegistrazioneForm {
  FirstName: string;
  LastName: string;
  Email: string;
  Squadre: Squadra[]; // Deve essere un array di Squadra
  Categorie: Categoria[]; // Deve essere un array di Categoria
  Roles: Role[]; // Deve essere un array di Role
}
export enum FileTypeEnum {
  PDF = 'PDF',
  JPEG = 'JPEG',
  PNG = 'PNG',
  CSV = 'CSV',
  XLS = 'XLS',
  XLSX = 'XLSX',
  SVG = 'SVG',
}

// Tipo per i dati della risposta (può essere adattato in base alla risposta effettiva)
export interface UploadFileResponse {
  message: string;
  success: boolean; 
}

export interface Team {
  id: number;
  name: string; // Nome della squadra
  logo?: string; // Logo della squadra in formato base64 o URL
}

export interface SponsorResponse {
  name: string; // Nome dello sponsor
  logoBase64: string | null; // Logo in formato Base64 (o null se non disponibile)
}

export interface FileResponse {
  fileName: string;
  uploadDate: Date; 
  }

export interface MatchDataResponse {
  id: number;
  day: string; // Giornata
  outwardReturn: string; // A/R
  matchNumber: number; // Nr.Gara
  matchDate: Date; // Data Gara
  dayOfWeek : string;
  time: string; // Orario
  location: string; // Località
  homeTeam: Team; // Team di casa
  awayTeam: Team; // Team in trasferta
  female?: boolean; // Possibilità di valore null
  male?: boolean; // Possibilità di valore null
}



export const uploadFile = async (
  files: File[],  // Cambiato per supportare più file
  fileType: FileTypeEnum
): Promise<UploadFileResponse> => {
  const formData = new FormData();

  // Aggiungi tutti i file al FormData
  files.forEach((file) => {
    formData.append('files', file);  // Usa 'files' per inviare più file
  });

  // Aggiungi il tipo di file
  formData.append('fileType', fileType);

  try {
    const response = await axiosInstance.post<UploadFileResponse>(
      '/file/upload-file', // Endpoint backend
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // Necessario per il caricamento del file
        },
        withCredentials: true, // Assicurati che le credenziali siano incluse, se necessario
      }
    );

    return response.data;
  } catch (error) {
    // Gestire gli errori
    if (axios.isAxiosError(error) && error.response) { // Utilizza `axios.isAxiosError`
      throw new Error(`Errore del server: ${error.response.data.message}`);
    } else {
      throw new Error('Errore sconosciuto durante il caricamento del file');
    }
  }
};



export const getTeamLogos = async (): Promise<Team[]> => {
  try {
    const response = await axiosInstance.get<Team[]>('/api/logo');
    return response.data;
  } catch (error) {
    console.error('Errore durante la richiesta dei loghi delle squadre:', error);
    throw error;
  }
};

export const getMatchData = async (matchNumber?: number): Promise<MatchDataResponse[]> => {
  try {
    // Crea l'URL base
    let url = '/api/match-data';

    // Se matchNumber è fornito, aggiungi il parametro alla URL
    if (matchNumber !== undefined) {
      url += `?matchNumber=${matchNumber}`;
    }

    // Esegui la richiesta GET con l'URL eventualmente modificato
    const response = await axiosInstance.get<MatchDataResponse[]>(url);
    return response.data;
  } catch (error) {
    console.error('Errore durante la richiesta dei dati delle partite:', error);
    throw error;
  }
};



export const getSponsors = async (): Promise<SponsorResponse[]> => {
  try {
    // Invio della richiesta GET all'endpoint '/api/sponsor'
    const response = await axiosInstance.get<SponsorResponse[]>('/api/sponsor');
    
    // Restituisci i dati ricevuti
    return response.data;
  } catch (error) {
    console.error('Errore durante la richiesta degli sponsor:', error);
    throw error; // Rilancia l'errore per gestirlo nel punto di invocazione
  }
};


export const getTeams = async (): Promise<Team[]> => {
  try {
    const response = await axiosInstance.get<Team[]>('/api/team');
    return response.data;
  } catch (error) {
    console.error('Errore durante la richiesta dei dati delle squadre:', error);
    throw error;
  }
};

export const getFiles = async (): Promise<FileResponse[]> => {
  try {
    const response = await axiosInstance.get<FileResponse[]>('api/get-file');
    return response.data;
  } catch(error){
    console.error('Errore durante la richiesta del recupero dei file:',error);
    throw error;
  }
  }

// 1. Recupera tutti i colori e gradienti
export const getColorsAndGradients = async () => {
  try {
    const response = await axiosInstance.get('/api/colors-and-gradients');
    return response.data; // Restituisce l'elenco di colori e gradienti
  } catch (error) {
    console.error('Errore durante il recupero dei colori e gradienti:', error);
    throw error;
  }
};

// 2. Aggiungi un nuovo gradiente
export const addGradient = async (gradientStyle: string) => {
  try {
    const response = await axiosInstance.post('/api/gradients', { gradientStyle });
    return response.data; // Restituisce i dettagli del gradiente creato
  } catch (error) {
    console.error('Errore durante l\'aggiunta del gradiente:', error);
    throw error;
  }
};

// 3. Rimuovi un gradiente
export const removeGradient = async (gradientId: number) => {
  try {
    const response = await axiosInstance.delete('/api/gradients', {
      data: { gradientId },
    });
    return response.data; // Restituisce la conferma di eliminazione
  } catch (error) {
    console.error('Errore durante la rimozione del gradiente:', error);
    throw error;
  }
};

// 4. Aggiungi un nuovo colore
export const addColor = async (colorHex: string) => {
  try {
    const response = await axiosInstance.post('/api/colors', { colorHex });
    return response.data; // Restituisce i dettagli del colore creato
  } catch (error) {
    console.error('Errore durante l\'aggiunta del colore:', error);
    throw error;
  }
};


// Funzione per il login
export const login = async (username: string, password: string, RememberMe: boolean) => {
  try {
    const response = await axiosInstance.post('/api/login', { username, password, RememberMe });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('Errore durante il login:', axiosError.response ? axiosError.response.data : axiosError.message);
    } else {
      console.error('Errore durante il login:', error);
    }
    throw new Error('Errore durante il login');
  }
};

// Funzione per verificare se l'username è disponibile
export const checkUsername = async (username: string) => {
  try {
    const response = await axiosInstance.get(`/auth/authentication/check-username?username=${username}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Errore durante il controllo dell\'username:', error.response ? error.response.data : error.message); // Debug migliorato
    } else {
      console.error('Errore durante il controllo dell\'username:', error); // Gestione errori generici
    }
    throw new Error('Errore durante il controllo dell\'username');
  }
};

// Funzione per la registrazione
export const registrazione = async (payload: RegistrazioneForm) => {
  try {
    console.log('Payload della registrazione:', payload); // Aggiungi questo per il debug
    const response = await axiosInstance.post('/api/register', payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Errore durante la registrazione:', error.response ? error.response.data : error.message); // Debug migliorato
    } else {
      console.error('Errore durante la registrazione:', error); // Gestione errori generici
    }
    throw new Error('Errore durante la registrazione');
  }
};


// Funzione per recuperare le squadre
export const squadra = async () => {
  try {
    const response = await axiosInstance.get('/api/squadra');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Errore durante il recupero delle squadre:', error.response ? error.response.data : error.message); // Debug migliorato
    } else {
      console.error('Errore durante il recupero delle squadre:', error); // Gestione errori generici
    }
    throw new Error('Errore durante il recupero delle squadre');
  }
};

// Funzione per recuperare le categorie
export const categoria = async () => {
  try {
    const response = await axiosInstance.get('/api/categoria');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Errore durante il recupero delle categorie:', error.response ? error.response.data : error.message); // Debug migliorato
    } else {
      console.error('Errore durante il recupero delle categorie:', error); // Gestione errori generici
    }
    throw new Error('Errore durante il recupero delle categorie');
  }
};

// Funzione per recuperare i ruoli
export const roles = async () => {
  try {
    const response = await axiosInstance.get('/api/role');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Errore durante il recupero dei ruoli:', error.response ? error.response.data : error.message); // Debug migliorato
    } else {
      console.error('Errore durante il recupero dei ruoli:', error); // Gestione errori generici
    }
    throw new Error('Errore durante il recupero dei ruoli');
  }
};

export const inviaEmail = async (Email: string) =>{
  try{
    const response = await axiosInstance.get('/user/verification/{tokenId}');
    return response.data;
  }catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Errore durante l invio dell email:', error.response ? error.response.data : error.message); // Debug migliorato
    } else {
      console.error('Errore durante l invio dell email:', error); // Gestione errori generici
    }
    throw new Error('Errore durante l invio dell email');
  }
};