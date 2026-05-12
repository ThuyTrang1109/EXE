namespace ChipStarot.Domain.Entities;

public class Account
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public int RoleId { get; set; } = 2;
    public bool IsVerified { get; set; } = false;
    public string AccountStatus { get; set; } = "active"; // active | banned | unverified
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Role? Role { get; set; }
    public CustomerProfile? CustomerProfile { get; set; }
    public AdminProfile? AdminProfile { get; set; }
}
