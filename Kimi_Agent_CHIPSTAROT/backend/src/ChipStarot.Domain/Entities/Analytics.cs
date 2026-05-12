namespace ChipStarot.Domain.Entities;

public class CreditTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AccountId { get; set; }
    public int Amount { get; set; } // Positive = add, Negative = subtract
    public int BalanceAfter { get; set; }
    public string Type { get; set; } = string.Empty; // nfc_activation|tarot_reading|admin_grant|subscription
    public string? ReferenceId { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Account? Account { get; set; }
}

public class PetGameLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AccountId { get; set; }
    public string ActionType { get; set; } = string.Empty; // feed|gain_exp_from_reading|claim_reward
    public int Amount { get; set; }
    public int CurrentExp { get; set; }
    public int CurrentFood { get; set; }
    public string? ReferenceId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Account? Account { get; set; }
}

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? AccountId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public string? Type { get; set; } // system|order|subscription
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Account? Account { get; set; }
}

public class SystemSetting
{
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Guid? UpdatedBy { get; set; }
}

public class BlogPost
{
    public int Id { get; set; }
    public Guid? AdminId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int ViewCount { get; set; } = 0;
    public string? Tags { get; set; }
    public string Status { get; set; } = "draft"; // draft|published
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Account? Admin { get; set; }
}

public class TarotCreditPackage
{
    public string Id { get; set; } = string.Empty; // e.g. cp_starter
    public string Name { get; set; } = string.Empty;
    public int CreditsPerDay { get; set; }
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public int ExpiryDays { get; set; } = 30;
    public string? Icon { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class CreditPackagePurchase
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AccountId { get; set; }
    public string PackageId { get; set; } = string.Empty;
    public int CreditsPerDayGranted { get; set; }
    public DateTime ExpiresAt { get; set; }
    public decimal AmountPaid { get; set; }
    public string? PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public string Status { get; set; } = "completed"; // pending|completed|refunded
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Account? Account { get; set; }
    public TarotCreditPackage? Package { get; set; }
}

public class UserSubscription
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AccountId { get; set; }
    public int PlanId { get; set; }
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "active";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Account? Account { get; set; }
    public SubscriptionPlan? Plan { get; set; }
}

public class SubscriptionPlan
{
    public int Id { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationDays { get; set; }
    public string? Description { get; set; }
}

public class HeroBanner
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Subtitle { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string? ButtonText { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
