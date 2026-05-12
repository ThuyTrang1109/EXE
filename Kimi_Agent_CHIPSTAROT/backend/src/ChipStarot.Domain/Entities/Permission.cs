namespace ChipStarot.Domain.Entities;

public class Permission
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;      // 'users.create'
    public string Resource { get; set; } = string.Empty; // 'users'
    public string Action { get; set; } = string.Empty;   // 'create'
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
