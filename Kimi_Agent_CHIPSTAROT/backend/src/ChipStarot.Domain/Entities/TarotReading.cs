namespace ChipStarot.Domain.Entities;

public class TarotCard
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Suit { get; set; }
    public string? ArcanaType { get; set; }
    public string? Element { get; set; }
    public string? MeaningGeneral { get; set; }
    public string? MeaningUpright { get; set; }
    public string? MeaningReversed { get; set; }
    public string? ImageUrl { get; set; }
    public string Status { get; set; } = "active"; // active | draft
}

public class TarotReading
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? AccountId { get; set; }
    public string? NfcTagId { get; set; }
    public string? Topic { get; set; }
    public string? TopicSubAnswer { get; set; }
    public string? UserQuestion { get; set; }
    public string? MoodInput { get; set; }
    public int CardCount { get; set; } = 1;
    public string? AiModelUsed { get; set; }
    public int? AiPromptTokens { get; set; }
    public int? AiResponseTokens { get; set; }
    public string? AiResponseStory { get; set; }
    public int? UserRating { get; set; }
    public bool IsSaved { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Account? Account { get; set; }
    public ICollection<ReadingDetail> Details { get; set; } = new List<ReadingDetail>();
}

public class ReadingDetail
{
    public Guid ReadingId { get; set; }
    public int CardId { get; set; }
    public int PositionOrder { get; set; }
    public bool IsReversed { get; set; } = false;

    public TarotReading? Reading { get; set; }
    public TarotCard? Card { get; set; }
}
