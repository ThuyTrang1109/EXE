namespace ChipStarot.Application.DTOs.Profile;

public record UpdateProfileRequest(
    string? FullName,
    string? PhoneNumber,
    string? Province,
    string? District,
    string? Ward,
    string? StreetAddress,
    string? DateOfBirth,
    string? Gender,
    string? ZodiacSign,
    string? AvatarUrl
);

public record CustomerProfileDto(
    Guid AccountId,
    string Email,
    string? FullName,
    string? PhoneNumber,
    string? Province,
    string? District,
    string? Ward,
    string? StreetAddress,
    DateOnly? DateOfBirth,
    string? Gender,
    string? ZodiacSign,
    int? LifePathNumber,
    string? AvatarUrl,
    int Credits,
    int DailyAllowance,
    DateOnly? LastResetDate,
    DateTime? CreditsExpiresAt,
    int PetExp,
    int PetFood,
    string? PetType,
    string? PetName,
    string PetStatus,
    string PetClaimedLevels,
    string AccountStatus
);

public record PetFeedRequest(int FoodAmount);
public record ClaimPetRewardRequest(int Level);
public record PetHatchResponse(string PetType, string PetName);

/// <summary>Response của /api/profile/me — trả về role + permissions cho FE gate UI</summary>
public record MeResponse(
    Guid AccountId,
    string Email,
    string Role,              // 'super_admin' | 'admin' | 'customer'
    IEnumerable<string> Permissions,  // ['users.view', 'products.manage', ...]
    string AccountStatus
);

public record NotificationDto(
    Guid Id,
    string Title,
    string Message,
    bool IsRead,
    string? Type,
    DateTime CreatedAt
);
