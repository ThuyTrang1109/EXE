namespace ChipStarot.Domain.Entities;

public class AdminProfile
{
    public Guid AccountId { get; set; }
    public string? EmployeeId { get; set; }
    public string? FullName { get; set; }
    public string? Department { get; set; }
    public int AdminLevel { get; set; } = 1;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Account? Account { get; set; }
}
