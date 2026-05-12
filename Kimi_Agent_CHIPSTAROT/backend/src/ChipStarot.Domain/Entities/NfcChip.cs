namespace ChipStarot.Domain.Entities;

public class NfcChip
{
    public string NfcTagId { get; set; } = string.Empty;
    public int? ProductId { get; set; }
    public Guid? AccountId { get; set; }
    public string Status { get; set; } = "unactivated"; // unactivated | activated | transferred
    public int CreditsGranted { get; set; } = 0;
    public int ScanCount { get; set; } = 0;
    public DateTime? LastScannedAt { get; set; }
    public DateTime? ActivatedAt { get; set; }

    // Navigation
    public Product? Product { get; set; }
    public Account? Account { get; set; }
}
