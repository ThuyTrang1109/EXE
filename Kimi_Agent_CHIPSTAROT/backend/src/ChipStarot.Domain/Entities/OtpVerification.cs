namespace ChipStarot.Domain.Entities;

public class OtpVerification
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // register | reset_password
    public string Status { get; set; } = "pending"; // pending | used | expired
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
}
