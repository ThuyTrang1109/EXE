using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChipStarot.Domain.Entities;

public class InventoryLog
{
    [Key]
    public int Id { get; set; }

    public int ProductId { get; set; }
    
    [ForeignKey("ProductId")]
    public virtual Product? Product { get; set; }

    public int ChangeAmount { get; set; } // +10 (restock), -2 (sale), -1 (damage)
    
    public int BalanceAfter { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = "adjustment"; // restock, sale, damage, audit

    [MaxLength(250)]
    public string? Note { get; set; }

    public Guid? ActorId { get; set; } // Who performed the action
    
    [ForeignKey("ActorId")]
    public virtual Account? Actor { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
