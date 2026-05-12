namespace ChipStarot.Domain.Entities;

public class CustomerProfile
{
    public Guid AccountId { get; set; }
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Province { get; set; }
    public string? District { get; set; }
    public string? Ward { get; set; }
    public string? StreetAddress { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? ZodiacSign { get; set; }
    public int? LifePathNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public int Credits { get; set; } = 0;
    public int DailyAllowance { get; set; } = 0;
    public DateOnly? LastResetDate { get; set; }
    public DateTime? CreditsExpiresAt { get; set; }
    public int PetExp { get; set; } = 0;
    public int PetFood { get; set; } = 0;
    public string? PetType { get; set; } // chicken_red, chicken_blue, etc.
    public string? PetName { get; set; }
    public string PetStatus { get; set; } = "egg"; // egg | hatched
    public string PetClaimedLevels { get; set; } = "[]"; // JSONB stored as string
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Account? Account { get; set; }
}
