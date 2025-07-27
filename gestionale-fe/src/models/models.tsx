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