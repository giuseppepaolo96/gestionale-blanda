using Api.Entities;
using System.Globalization;
using Api.Infrastructure.Data;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.EntityFrameworkCore;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.parser;
using System.Text.RegularExpressions;
using System.Security.Cryptography;
using OfficeOpenXml;
using System.Text;
using FastEndpoints;

namespace Api.Features.UploadFile.Command
{
    public enum FileTypeEnum
    {
        PDF,
        JPEG,
        PNG,
        CSV,
        XLS,
        XLSX,
        SVG
    }

    public class UploadFileCommand : ICommand<IResult>
    {
        public IFormFile? File { get; set; }
        public FileTypeEnum FileType { get; set; }
        public IFormFileCollection? Files { get; set; }
    }

    public class UploadFileCommandHandler : ICommandHandler<UploadFileCommand, IResult>
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UploadFileCommandHandler> _logger;

        private readonly string[] allowedSpreadsheetExtensions = { ".csv", ".xls", ".xlsx" };
        private readonly string[] allowedDocumentExtensions = { ".pdf", ".doc", ".docx", ".jpeg", ".jpg", ".png", ".svg" };
        private readonly string[] allowedVideoExtensions = { ".mp4" };

        public UploadFileCommandHandler(AppDbContext context, ILogger<UploadFileCommandHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IResult> ExecuteAsync(UploadFileCommand command, CancellationToken ct)
        {
            if (command.Files == null || command.Files.Count == 0)
            {
                _logger.LogError("Nessun file inserito.");
                throw new BadHttpRequestException("Nessun file inserito");
            }

            var duplicateFiles = new List<string>();
            var successfullyUploadedFiles = new List<string>();
            var teamLogos = new List<string>();
            var sponsorLogos = new List<string>();

            foreach (var file in command.Files)
            {
                string fileExtension = System.IO.Path.GetExtension(file.FileName).ToLower();
                long maxFileSize = GetMaxFileSize(fileExtension);

                if (file.Length > maxFileSize)
                {
                    _logger.LogError("La dimensione del file {FileName} supera il limite massimo di {MaxFileSize} MB.", file.FileName, maxFileSize / (1024 * 1024));
                    throw new BadHttpRequestException($"La dimensione massima del file supera i {maxFileSize / (1024 * 1024)} MB");
                }

                if (await IsDuplicateFile(file))
                {
                    _logger.LogError("Il file {FileName} è già stato caricato o esiste già nel database.", file.FileName);
                    duplicateFiles.Add(file.FileName);
                    continue;  // Salta questo file e passa al prossimo
                }

                try
                {
                    await using MemoryStream memoryStream = new();
                    await file.CopyToAsync(memoryStream, ct);
                    memoryStream.Seek(0, SeekOrigin.Begin);

                    string fileName = file.FileName;
                    var fileRecord = new FileRecord
                    {
                        FileName = fileName,
                        UploadDate = DateTime.UtcNow,
                        FileContent = memoryStream.ToArray()
                    };

                    _context.FileRecords.Add(fileRecord);
                    await _context.SaveChangesAsync(ct);

                    if (fileName.Contains("logo", StringComparison.OrdinalIgnoreCase))
                    {
                        var teamName = fileName.Replace("Logo", "", StringComparison.OrdinalIgnoreCase).Replace(fileExtension, "").Trim();
                        var teamLogoBase64 = Convert.ToBase64String(memoryStream.ToArray());

                        var existingTeam = await _context.Teams.FirstOrDefaultAsync(t => t.Name == teamName);


                        if (existingTeam == null)
                        {
                            var team = new Entities.Team
                            {
                                Name = teamName,
                                Logo = teamLogoBase64
                            };
                            _context.Teams.Add(team);
                            await _context.SaveChangesAsync(ct);
                            teamLogos.Add(teamName);
                            _logger.LogInformation("Logo squadra {TeamName} caricato con successo.", teamName);
                        }
                        else
                        {
                            existingTeam.Logo = teamLogoBase64;
                            _context.Teams.Update(existingTeam);
                            await _context.SaveChangesAsync(ct);
                            teamLogos.Add(teamName);
                            _logger.LogInformation("Logo squadra {TeamName} aggiornato con successo.", teamName);
                        }
                    }
                    else if (fileName.Contains("sponsor", StringComparison.OrdinalIgnoreCase))
                    {
                        var sponsorName = fileName.Replace("Sponsor", "", StringComparison.OrdinalIgnoreCase).Replace(fileExtension, "").Trim();
                        var sponsorLogoBase64 = Convert.ToBase64String(memoryStream.ToArray());

                        var existingSponsor = await _context.Sponsors.FirstOrDefaultAsync(s => s.Name == sponsorName);

                        if (existingSponsor == null)
                        {
                            var sponsor = new Entities.Sponsor
                            {
                                Name = sponsorName,
                                sponsor = sponsorLogoBase64
                            };
                            _context.Sponsors.Add(sponsor);
                            await _context.SaveChangesAsync(ct);
                            sponsorLogos.Add(sponsorName);
                            _logger.LogInformation("Logo sponsor {SponsorName} caricato con successo.", sponsorName);
                        }
                        else
                        {
                            existingSponsor.sponsor = sponsorLogoBase64;
                            _context.Sponsors.Update(existingSponsor);
                            await _context.SaveChangesAsync(ct);
                            sponsorLogos.Add(sponsorName);
                            _logger.LogInformation("Logo sponsor {SponsorName} aggiornato con successo.", sponsorName);
                        }
                    }
                    else if (fileExtension == ".csv" || fileExtension == ".xls" || fileExtension == ".xlsx")
                    {
                        if (fileExtension == ".csv")
                        {
                            await ProcessCalendarCsv(memoryStream, fileRecord.Id, ct, fileName);
                        }
                        else
                        {
                            await ProcessCalendarExcel(memoryStream, fileRecord.Id, ct, fileName);
                        }
                    }
                    else if (fileExtension == ".pdf")
                    {
                        await ProcessCalendarPdf(memoryStream, fileRecord.Id, ct, fileName, fileRecord.Id);
                    }
                    else
                    {
                        _logger.LogWarning("Tipo di file {FileName} non supportato.", file.FileName);
                    }

                    successfullyUploadedFiles.Add(file.FileName);
                    _logger.LogInformation("File {FileName} caricato con successo.", fileName);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Errore durante il caricamento del file.");
                    throw;
                }
            }

            if (duplicateFiles.Any())
            {
                return Results.BadRequest($"I seguenti file sono duplicati e non sono stati caricati: {string.Join(", ", duplicateFiles)}." +
                                           $" I seguenti file sono stati caricati correttamente: {string.Join(", ", successfullyUploadedFiles)}");
            }

            return Results.Ok($"I seguenti file sono stati caricati correttamente: {string.Join(", ", successfullyUploadedFiles)}" +
                               (teamLogos.Any() ? $". I seguenti loghi delle squadre sono stati caricati: {string.Join(", ", teamLogos)}" : "") +
                               (sponsorLogos.Any() ? $". I seguenti loghi degli sponsor sono stati caricati: {string.Join(", ", sponsorLogos)}" : ""));
        }

        private async Task<bool> IsDuplicateFile(IFormFile file)
        {
            var fileName = file.FileName.ToLower();  // Considera il nome del file in minuscolo

            // Verifica se esiste già un file con lo stesso nome nel database
            var existingFile = await _context.FileRecords
                .FirstOrDefaultAsync(fr => fr.FileName.ToLower() == fileName);

            return existingFile != null;  // Restituisce true se il file esiste già
        }


        private async Task<string> GetFileContentHash(IFormFile file)
        {
            using var sha256 = SHA256.Create();
            using var stream = file.OpenReadStream();
            var hash = await sha256.ComputeHashAsync(stream);
            return Convert.ToBase64String(hash);
        }

        private async Task ProcessCalendarCsv(MemoryStream memoryStream, int fileRecordId, CancellationToken ct, string fileName)
        {
            using var reader = new StreamReader(memoryStream);
            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture));

            var records = csv.GetRecords<dynamic>();  // Usa dynamic per mappare i dati in base alla struttura

            foreach (var record in records)
            {
                // Gestire la colonna aggiuntiva tra "Data Gara" e "Nr. Gara"
                var matchDate = DateTime.ParseExact(record.Data_Gara.ToString(), "dd/MM/yyyy", CultureInfo.InvariantCulture);

                var matchData = new MatchData
                {
                    Day = record.Giornata, // Colonna "Giornata"
                    OutwardReturn = record.A_R,  // Colonna "A/R"
                    MatchNumber = int.Parse(record.Nr_Gara.ToString()),  // Colonna "Nr.Gara"
                    MatchDate = matchDate,  // Colonna "Data Gara"
                    Time = record.Orario.ToString(),  // Colonna "Orario"
                    Location = record.Localita,  // Colonna "Località"
                    HomeTeam = new Api.Entities.Team { Name = record.Nome_Squadra_Casa },  // Colonna "Nome Squadra Casa"
                    AwayTeam = new Api.Entities.Team { Name = record.Nome_Squadra_Fuori },  // Colonna "Nome Squadra Fuori"
                    FileRecordId = fileRecordId,
                    DayOfWeek = matchDate.ToString("dddd", new CultureInfo("it-IT")) // Giorno della settimana
                };

                // Imposta il flag del sesso in base al nome del file
                SetGenderFlags(fileName, matchData);

                _context.MatchData.Add(matchData);
            }

            await _context.SaveChangesAsync(ct);
        }




        private async Task ProcessCalendarPdf(MemoryStream memoryStream, int fileRecordId, CancellationToken ct, string fileName,int fileId)
        {
            var matchDataList = ParseMatchDataFromPdf(memoryStream, fileId);

            foreach (var matchData in matchDataList)
            {
                SetGenderFlags(fileName, matchData);  // Settaggio dei flag di genere

                // Aggiungere i team se non esistono
                var homeTeam = await _context.Teams
                    .FirstOrDefaultAsync(t => t.Name == matchData.HomeTeam.Name, ct)
                    ?? _context.ChangeTracker.Entries<Api.Entities.Team>()
                    .FirstOrDefault(e => e.Entity.Name == matchData.HomeTeam.Name)?.Entity;

                if (homeTeam == null)
                {
                    homeTeam = new Api.Entities.Team { Name = matchData.HomeTeam.Name };
                    _context.Teams.Add(homeTeam);
                }

                var awayTeam = await _context.Teams
                    .FirstOrDefaultAsync(t => t.Name == matchData.AwayTeam.Name, ct)
                    ?? _context.ChangeTracker.Entries<Api.Entities.Team>()
                         .FirstOrDefault(e => e.Entity.Name == matchData.AwayTeam.Name)?.Entity;

                if (awayTeam == null)
                {
                    awayTeam = new Api.Entities.Team { Name = matchData.AwayTeam.Name };
                    _context.Teams.Add(awayTeam);
                }

                // Associamo gli ID dei team a MatchData
                matchData.HomeTeam = homeTeam;
                matchData.AwayTeam = awayTeam;

                // Aggiungi il matchData al contesto
                _context.MatchData.Add(matchData);
                _logger.LogInformation("Aggiunto MatchData: {HomeTeam} vs {AwayTeam}", matchData.HomeTeam.Name, matchData.AwayTeam.Name);
            }

            // Salva le modifiche
            await _context.SaveChangesAsync(ct);
        }




        private async Task ProcessCalendarExcel(MemoryStream memoryStream, int fileRecordId, CancellationToken ct, string fileName)
        {
            using var package = new ExcelPackage(memoryStream);
            var worksheet = package.Workbook.Worksheets.First();
            int row = 2;

            while (!string.IsNullOrEmpty(worksheet.Cells[row, 1].Text))
            {
                var matchDate = DateTime.ParseExact(worksheet.Cells[row, 4].Text, "dd/MM/yyyy", CultureInfo.InvariantCulture); // Assumiamo che la data sia nella 4ª colonna
                var matchData = new MatchData
                {
                    Day = worksheet.Cells[row, 1].Text,  // Colonna "Giornata"
                    OutwardReturn = worksheet.Cells[row, 2].Text,  // Colonna "A/R"
                    MatchNumber = int.Parse(worksheet.Cells[row, 3].Text),  // Colonna "Nr.Gara"
                    MatchDate = matchDate,  // Colonna "Data Gara"
                    Time = worksheet.Cells[row, 5].Text,  // Colonna "Orario"
                    Location = worksheet.Cells[row, 6].Text,  // Colonna "Località"
                    HomeTeam = new Api.Entities.Team { Name = worksheet.Cells[row, 7].Text },  // Colonna "Nome Squadra Casa"
                    AwayTeam = new Api.Entities.Team { Name = worksheet.Cells[row, 8].Text },  // Colonna "Nome Squadra Fuori"
                    Female = worksheet.Cells[row, 9].Text == "F",
                    Male = worksheet.Cells[row, 9].Text == "M",
                    FileRecordId = fileRecordId,
                    DayOfWeek = matchDate.ToString("dddd", new CultureInfo("it-IT")) // Giorno della settimana
                };

                SetGenderFlags(fileName, matchData);
                _context.MatchData.Add(matchData);
                row++;
            }

            await _context.SaveChangesAsync(ct);
        }




        //private List<MatchData> ParseMatchDataFromPdf(MemoryStream memoryStream, int fileId)
        //{
        //    var matchDataList = new List<MatchData>();

        //    // Estrai il testo dal PDF
        //    string pdfText = ExtractPdfText(memoryStream);
        //    _logger.LogInformation("Testo estratto dal PDF: " + pdfText);


        //    var regexFemminile = new Regex(
        //        @"(\d+)\s+([A/R])\s+(\d+)\s+(\d{2}/\d{2}/\d{4})\s+([a-zA-ZàèéìòùÀÈÉÌÒÙ\s]+)\s+(\d+)\s+(\d{4})\s+([A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+?)\s{2,}([A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+?)\s{2,}([A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+)$",
        //        RegexOptions.IgnorePatternWhitespace | RegexOptions.Multiline
        //        );

        //    var regexMaschile = new Regex(
        //        @"(?m)^\s*(\d+)\s+([A/R])\s+\d+\s+(\d{2}/\d{2}/\d{4})\s+([a-zA-ZàèéìòùÀÈÉÌÒÙ\s]+)\s+\d+\s+(\d{2})(\d{2})\s+([A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+?)\s{2,}([A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+?)\s{2,}([A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+?)$",
        //        RegexOptions.IgnorePatternWhitespace | RegexOptions.Multiline
        //        );


        //    foreach (Match match in regex.Matches(pdfText))
        //    {
        //        try
        //        {
        //            var matchData = new MatchData
        //            {
        //                FileRecordId = fileId,
        //                Day = match.Groups[1].Value.Trim(),
        //                OutwardReturn = match.Groups[2].Value.Trim(),
        //                MatchNumber = int.Parse(match.Groups[3].Value),  // La colonna "Nr. Gara"
        //                MatchDate = DateTime.ParseExact(match.Groups[4].Value, "dd/MM/yyyy", CultureInfo.InvariantCulture),
        //                DayOfWeek = match.Groups[5].Value.Trim(),  // Giorno della settimana
        //                Time = match.Groups[7].Value.Trim(),
        //                Location = match.Groups[8].Value.Trim(),
        //                HomeTeam = new Api.Entities.Team { Name = match.Groups[9].Value.Trim() },
        //                AwayTeam = new Api.Entities.Team { Name = match.Groups[10].Value.Trim() }
        //            };

        //            matchDataList.Add(matchData);
        //        }
        //        catch (Exception ex)
        //        {
        //            _logger.LogError("Errore nel parsing del match: " + ex.Message);
        //        }
        //    }

        //    return matchDataList;
        //}

        private List<MatchData> ParseMatchDataFromPdf(MemoryStream memoryStream, int fileId)
        {
            var matchDataList = new List<MatchData>();

            // Estrai il testo dal PDF
            string pdfText = ExtractPdfText(memoryStream);
            _logger.LogInformation("Testo estratto dal PDF: " + pdfText);

            var regexFemminile = new Regex(
                @"(\d+)\s+([A/R])\s+(\d+)\s+(\d{2}/\d{2}/\d{4})\s+([a-zA-ZàèéìòùÀÈÉÌÒÙ\s]+)\s+(\d+)\s+(\d{4})\s+([A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+?)\s{2,}([A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+?)\s{2,}([A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+)$",
                RegexOptions.IgnorePatternWhitespace | RegexOptions.Multiline
            );

            var regexMaschile = new Regex(
     @"(?m)^\s*(\d+)\s+([A/R])\s+(\d+)\s+(\d{2}/\d{2}/\d{4})\s+([a-zA-ZàèéìòùÀÈÉÌÒÙ\s]+?)\s+(\d{4})\s+(\d{4})\s+([A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+(?:[A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+)?(?:\s[A-Za-zàèéìòùÀÈÉÌÒÙ'0-9]+)+)\s+([A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+?)\s+([A-Za-zàèéìòùÀÈÉÌÒÙ'0-9\s]+?)$",
     RegexOptions.IgnorePatternWhitespace | RegexOptions.Multiline
 );



            // Parsing dei match femminili
            foreach (Match match in regexFemminile.Matches(pdfText))
            {
                try
                {
                    var matchData = new MatchData
                    {
                        FileRecordId = fileId,
                        Day = match.Groups[1].Value.Trim(),
                        OutwardReturn = match.Groups[2].Value.Trim(),
                        MatchNumber = int.Parse(match.Groups[3].Value),
                        MatchDate = DateTime.ParseExact(match.Groups[4].Value, "dd/MM/yyyy", CultureInfo.InvariantCulture),
                        DayOfWeek = match.Groups[5].Value.Trim(),
                        Time = match.Groups[7].Value.Trim(),
                        Location = match.Groups[8].Value.Trim(),
                        HomeTeam = new Api.Entities.Team { Name = match.Groups[9].Value.Trim() },
                        AwayTeam = new Api.Entities.Team { Name = match.Groups[10].Value.Trim() }
                    };

                    matchDataList.Add(matchData);
                }
                catch (Exception ex)
                {
                    _logger.LogError("Errore nel parsing del match femminile: " + ex.Message);
                }
            }


            // calendario maschile
            foreach (Match match in regexMaschile.Matches(pdfText))
            {
                try
                {
                    // Aggiungi log per vedere i gruppi catturati
                    if (match.Groups.Count >= 11)
                    {
                        _logger.LogInformation($"Giornata: {match.Groups[1].Value.Trim()}, Orario: {match.Groups[7].Value.Trim()}, Location: {match.Groups[8].Value.Trim()}, HomeTeam: {match.Groups[9].Value.Trim()}, AwayTeam: {match.Groups[10].Value.Trim()}");

                        var matchData = new MatchData
                        {
                            FileRecordId = fileId,
                            Day = match.Groups[1].Value.Trim(),
                            OutwardReturn = match.Groups[2].Value.Trim(),
                            MatchNumber = int.Parse(match.Groups[3].Value),  // Numero della gara
                            MatchDate = DateTime.ParseExact(match.Groups[4].Value, "dd/MM/yyyy", CultureInfo.InvariantCulture),
                            DayOfWeek = match.Groups[5].Value.Trim(),  // Giorno della settimana
                            Time = match.Groups[7].Value.Trim(),  // Ora e minuti
                            Location = match.Groups[8].Value.Trim(),
                            HomeTeam = new Api.Entities.Team { Name = match.Groups[9].Value.Trim() },
                            AwayTeam = new Api.Entities.Team { Name = match.Groups[10].Value.Trim() }
                        };

                        // Aggiungi il dato alla lista
                        matchDataList.Add(matchData);
                    }
                    else
                    {
                        _logger.LogError("Regex non ha trovato tutti i gruppi necessari. Match fallito. Gruppi: " + match.Groups.Count);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Errore nel parsing del match maschile: {ex.Message}");
                }
            }

            return matchDataList;
        }








        private string ExtractPdfText(MemoryStream memoryStream)
        {
            using var reader = new PdfReader(memoryStream);
            var text = new StringBuilder();

            for (int i = 1; i <= reader.NumberOfPages; i++)
            {
                text.AppendLine(PdfTextExtractor.GetTextFromPage(reader, i));
            }

            return text.ToString();
        }


        // Funzione che imposta i flag Female e Male in base al nome del file
        private void SetGenderFlags(string fileName, MatchData matchData)
        {
            // Imposta i flag Female e Male in base al nome del file
            if (fileName.Contains("femminile", StringComparison.OrdinalIgnoreCase))
            {
                matchData.Female = true;
                matchData.Male = false;
            }
            else if (fileName.Contains("maschile", StringComparison.OrdinalIgnoreCase))
            {
                matchData.Female = false;
                matchData.Male = true;
            }
        }


        private long GetMaxFileSize(string extension)
        {
            if (allowedVideoExtensions.Contains(extension))
            {
                return 500 * 1024 * 1024;
            }

            return 10 * 1024 * 1024;
        }
    }
}