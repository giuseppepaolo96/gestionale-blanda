using AutoMapper;
using Microsoft.AspNetCore.Identity;

namespace Api.Entities
{
    public class Team
    {
        public int Id { get; set; }
        public string Name { get; set; } // Nome della squadra
        public byte[]? Logo { get; set; } // Logo della squadra in formato base64 o URL
    }

    public class FileRecord
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public DateTime UploadDate { get; set; }
        public byte[] FileContent { get; set; } // Contenuto binario del file PDF
    }

    public class MatchData
    {
        public int Id { get; set; }
        public int FileRecordId { get; set; }
        public string Day { get; set; } // Giornata

        public string OutwardReturn { get; set; } // A/R
        public int MatchNumber { get; set; } // Nr.Gara
        public DateTime MatchDate { get; set; } // Data Gara

        public string DayOfWeek { get; set; } // Giorno della settima per la partita
        public string Time { get; set; } // Orario
        public string Location { get; set; } // Località

        // Proprietà per le chiavi esterne
        public int HomeTeamId { get; set; }  // Aggiungi la proprietà HomeTeamId (chiave esterna)
        public int AwayTeamId { get; set; }  // Aggiungi la proprietà AwayTeamId (chiave esterna)

        // Proprietà di navigazione
        public Team HomeTeam { get; set; } // Riferimento all'oggetto Team di casa
        public Team AwayTeam { get; set; } // Riferimento all'oggetto Team in trasferta

        public FileRecord FileRecord { get; set; }

        public bool? Female { get; set; }
        public bool? Male { get; set; }
    }



    public class Sponsor
    {
        public int Id { get; set; }
        public string Name { get; set; } // Nome dello sponsor
        public byte[] SponsorLogo { get; set; } // Logo dello sponsor in formato base64 o URL

     }

    public class Role
    {
        public Guid Id { get; set; }
        public string Ruolo { get; set; }
    }

    public class Categoria
    {
        public Guid Id { get; set; }
        public string Nome { get; set; }
    }

    public class User : IdentityUser
    {
        public Profile Profile { get; set; } = null!;
        public DateTime EmailTokenIssue { get; set; }
        public Guid EmailToken { get; set; }
        public bool IsEmailConfirmed { get; set; }
        public bool IsActivated { get; set; }
        public Guid RoleId { get; set; }
    }

    public class Profile
    {
        public Guid Id { get; private set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public User User { get; set; } = null!;
        public string UserId { get; set; }
        public Guid RoleId { get; set; }

        public List<Team> Teams { get; set; } = new List<Team>();
        public List<Role> Roles { get; set; } = new List<Role>();

        public List<Categoria> Categorias { get; set; } = new List<Categoria> ();
    }


}
