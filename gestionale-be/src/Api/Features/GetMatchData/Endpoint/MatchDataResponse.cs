namespace Api.Features.GetMatchData.Endpoint
{
    public class MatchDataResponse
    {
        public int Id { get; set; }
        public int FileRecordId { get; set; }
        public string Day { get; set; }
        public string OutwardReturn { get; set; }
        public int MatchNumber { get; set; }
        public DateTime MatchDate { get; set; }

        public string DayOfWeek { get; set; }
        public string Time { get; set; }
        public string Location { get; set; }
        public int HomeTeamId { get; set; }
        public int AwayTeamId { get; set; }
        public bool? Male { get; set; }
        public bool? Female { get; set; }
    }

    public class MatchDataRequest
    {
        public DateTime? MatchDate { get; set; }
    }
}
