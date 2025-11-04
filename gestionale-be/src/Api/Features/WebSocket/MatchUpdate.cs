namespace Api.Features.WebSocket
{
    public class MatchUpdate
    {
        public string? MatchId { get; set; }
        public int? ScoreCasa { get; set; }
        public int? ScoreOspite { get; set; }
        public bool? ResetMatch { get; set; }
        public bool? ResetScore { get; set; }
        public bool? PossessoCasa { get; set; }
        public bool? PossessoOspite { get; set; }
        public int? Set { get; set; }
        public bool? TimeoutHome { get; set; }
        public bool? TimeoutAway { get; set; }
        public int? Timer { get; set; }
        public int? RedCardCasa { get; set; }
        public int? RedCardOspite { get; set; }

        public string? MatchWinner { get; set; }

        public long Version { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }


}
