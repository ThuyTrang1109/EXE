namespace ChipStarot.Application.DTOs.Tarot;

public record TarotCardDto(
    int Id,
    string Name,
    string? Suit,
    string? ArcanaType,
    string? Element,
    string? MeaningGeneral,
    string? MeaningUpright,
    string? MeaningReversed,
    string? ImageUrl
);

public record SelectedCardInput(int CardId, bool IsReversed);

public record StartReadingRequest(
    string Topic,
    string? TopicSubAnswer,
    string? UserQuestion,
    string? MoodInput,
    int CardCount, // 1 or 3
    string? NfcTagId,
    IEnumerable<SelectedCardInput>? SelectedCards
);

public record TarotReadingDto(
    Guid Id,
    string? Topic,
    string? UserQuestion,
    string? MoodInput,
    int CardCount,
    string? AiResponseStory,
    int? UserRating,
    bool IsSaved,
    DateTime CreatedAt,
    IEnumerable<DrawnCardDto> Cards
);

public record DrawnCardDto(
    int CardId,
    string CardName,
    string? ImageUrl,
    int PositionOrder,
    bool IsReversed,
    string? Meaning
);

public record RateReadingRequest(Guid ReadingId, int Rating);

public record SaveReadingRequest(Guid ReadingId, bool IsSaved);

public record CreditPackageDto(
    string Id,
    string Name,
    int CreditsPerDay,
    decimal Price,
    decimal? OldPrice,
    int ExpiryDays,
    string? Icon,
    string? Description,
    bool IsActive,
    int DisplayOrder
);

public record PurchaseCreditPackageRequest(
    string PackageId,
    string PaymentMethod // demo | momo | vnpay
);

public record CreateTarotCardRequest(
    string Name,
    string? Suit,
    string? ArcanaType,
    string? Element,
    string? MeaningGeneral,
    string? MeaningUpright,
    string? MeaningReversed,
    string? ImageUrl
);

public record UpdateTarotCardRequest(
    string? Name,
    string? Suit,
    string? ArcanaType,
    string? Element,
    string? MeaningGeneral,
    string? MeaningUpright,
    string? MeaningReversed,
    string? ImageUrl,
    string? Status
);
