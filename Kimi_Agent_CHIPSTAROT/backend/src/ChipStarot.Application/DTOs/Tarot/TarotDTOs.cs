using System.ComponentModel.DataAnnotations;

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
    string? MeaningLove,
    string? MeaningMarriage,
    string? MeaningCareer,
    string? MeaningStudy,
    string? MeaningFinance,
    string? MeaningInvestment,
    string? MeaningHealth,
    string? MeaningSelf,
    string? ImageUrl
);

public record SelectedCardInput(
    [Required] int CardId, 
    bool IsReversed
);

public record StartReadingRequest(
    [Required(ErrorMessage = "Chủ đề bốc bài là bắt buộc")]
    string Topic,
    
    string? TopicSubAnswer,
    string? UserQuestion,
    string? MoodInput,
    
    [Range(1, 3, ErrorMessage = "Số lượng lá bài phải từ 1 đến 3")]
    int CardCount,
    
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
    string? NfcTagId,
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

public record RateReadingRequest(
    [Required] Guid ReadingId, 
    [Range(1, 5)] int Rating
);

public record SaveReadingRequest(
    [Required] Guid ReadingId, 
    bool IsSaved
);

public record CreditPackageDto(
    string Id, string Name, int CreditsPerDay, decimal Price, decimal? OldPrice,
    int ExpiryDays, string? Icon, string? Description, bool IsActive, int DisplayOrder
);

public record PurchaseCreditPackageRequest(
    [Required] string PackageId,
    [Required] string PaymentMethod // demo | momo | vnpay
);

public record CreateTarotCardRequest(
    [Required] string Name,
    string? Suit,
    string? ArcanaType,
    string? Element,
    string? MeaningGeneral,
    string? MeaningUpright,
    string? MeaningReversed,
    string? MeaningLove,
    string? MeaningMarriage,
    string? MeaningCareer,
    string? MeaningStudy,
    string? MeaningFinance,
    string? MeaningInvestment,
    string? MeaningHealth,
    string? MeaningSelf,
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
    string? MeaningLove,
    string? MeaningMarriage,
    string? MeaningCareer,
    string? MeaningStudy,
    string? MeaningFinance,
    string? MeaningInvestment,
    string? MeaningHealth,
    string? MeaningSelf,
    string? ImageUrl,
    string? Status
);
