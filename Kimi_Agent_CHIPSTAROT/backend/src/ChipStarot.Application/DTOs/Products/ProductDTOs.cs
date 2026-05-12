namespace ChipStarot.Application.DTOs.Products;

public record ProductDto(
    int Id,
    string Name,
    string? CategoryName,
    string? GemstoneType,
    string? Description,
    decimal BasePrice,
    decimal? OldPrice,
    string? ImageUrl,
    int StockQuantity,
    bool IsFeatured,
    string? TagText,
    string? TagColor,
    decimal AverageRating,
    int ReviewCount,
    int NfcCreditsBonus,
    bool IsActive
);

public record ProductDetailDto(
    int Id,
    string Name,
    int? CategoryId,
    string? CategoryName,
    string? GemstoneType,
    string? Description,
    decimal BasePrice,
    decimal? OldPrice,
    string? ImageUrl,
    int StockQuantity,
    bool IsFeatured,
    string? TagText,
    decimal AverageRating,
    int ReviewCount,
    int NfcCreditsBonus,
    bool IsActive,
    IEnumerable<ReviewDto> RecentReviews
);

public record ReviewDto(
    Guid Id,
    string? ReviewerName,
    int Rating,
    string? Comment,
    DateTime CreatedAt
);

public record CreateProductRequest(
    string Name,
    int? CategoryId,
    string? GemstoneType,
    string? Description,
    decimal BasePrice,
    decimal? OldPrice,
    string? ImageUrl,
    int StockQuantity,
    bool IsFeatured,
    string? TagText,
    string? TagColor,
    int NfcCreditsBonus
);

public record UpdateProductRequest(
    string? Name,
    int? CategoryId,
    string? GemstoneType,
    string? Description,
    decimal? BasePrice,
    decimal? OldPrice,
    string? ImageUrl,
    int? StockQuantity,
    bool? IsFeatured,
    string? TagText,
    string? TagColor,
    int? NfcCreditsBonus,
    bool? IsActive
);

public record AddReviewRequest(
    int ProductId,
    int Rating,
    string? Comment
);

public record CategoryDto(int Id, string Name, string? Description, string? IconUrl, bool IsActive);
