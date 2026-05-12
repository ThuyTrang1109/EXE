namespace ChipStarot.Domain.Entities;

public class ProductCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? GemstoneType { get; set; }
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? OldPrice { get; set; }
    public string? ImageUrl { get; set; }
    public int StockQuantity { get; set; } = 0;
    public bool IsFeatured { get; set; } = false;
    public string? TagText { get; set; }
    public string? TagColor { get; set; }
    public decimal AverageRating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;
    public int NfcCreditsBonus { get; set; } = 10;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ProductCategory? Category { get; set; }
    public ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
    public ICollection<NfcChip> NfcChips { get; set; } = new List<NfcChip>();
}

public class ProductReview
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int ProductId { get; set; }
    public Guid AccountId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Product? Product { get; set; }
    public Account? Account { get; set; }
}
