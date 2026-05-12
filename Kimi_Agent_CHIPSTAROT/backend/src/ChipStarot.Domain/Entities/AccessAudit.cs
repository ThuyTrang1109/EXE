namespace ChipStarot.Domain.Entities;

public class AccessAudit
{
    public long Id { get; set; }
    public Guid ActorId { get; set; }               // Ai thực hiện
    public Guid? TargetId { get; set; }             // Đối tượng bị tác động (nếu có)
    public string Action { get; set; } = string.Empty; // 'role.assigned' | 'permission.checked.denied'
    public string? Metadata { get; set; }           // JSON string: { role: 'admin', ... }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Account? Actor { get; set; }
}
