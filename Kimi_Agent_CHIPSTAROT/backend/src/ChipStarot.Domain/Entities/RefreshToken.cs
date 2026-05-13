namespace ChipStarot.Domain.Entities;

/// <summary>
/// Lưu Refresh Token bền vững trong DB thay vì IMemoryCache.
/// Giải quyết vấn đề: token bị mất khi server restart.
/// </summary>
public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AccountId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Account? Account { get; set; }
}
