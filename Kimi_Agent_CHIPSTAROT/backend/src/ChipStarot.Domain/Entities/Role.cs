namespace ChipStarot.Domain.Entities;

public class Role
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;         // 'admin', 'customer'
    public string Name { get; set; } = string.Empty;        // 'Quản trị viên', 'Khách hàng'
    public string Description { get; set; } = string.Empty;
    public bool IsSystem { get; set; } = false;             // Hệ thống không cho xoá

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
