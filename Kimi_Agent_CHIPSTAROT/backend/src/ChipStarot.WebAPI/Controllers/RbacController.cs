using ChipStarot.Infrastructure.Data;
using ChipStarot.WebAPI.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChipStarot.WebAPI.Controllers;

[Route("api/rbac")]
[Authorize]
public class RbacController : BaseApiController
{
    private readonly AppDbContext _ctx;
    public RbacController(AppDbContext ctx) => _ctx = ctx;

    /// <summary>Lấy ma trận Vai trò - Quyền hạn</summary>
    [HttpGet]
    [HasPermission("rbac.manage")]
    public async Task<IActionResult> GetMatrix()
    {
        var roles = await _ctx.Roles
            .Include(r => r.RolePermissions)
            .OrderBy(r => r.Id)
            .ToListAsync();

        var permissions = await _ctx.Permissions
            .OrderBy(p => p.Id)
            .ToListAsync();

        var result = new
        {
            roles = roles.Select(r => new { r.Id, r.Key, r.Name, r.IsSystem }),
            permissions = permissions.Select(p => new { p.Id, p.Key, p.DisplayName, p.Resource }),
            rolePermissions = roles.SelectMany(r => r.RolePermissions.Select(rp => new { rp.RoleId, rp.PermissionId }))
        };

        return Ok(new { success = true, data = result });
    }

    /// <summary>Bật/Tắt một quyền cho một vai trò</summary>
    [HttpPost("toggle")]
    [HasPermission("rbac.manage")]
    public async Task<IActionResult> TogglePermission([FromBody] TogglePermissionRequest request)
    {
        var role = await _ctx.Roles.FindAsync(request.RoleId);
        if (role == null) return NotFound(new { error = "Vai trò không tồn tại." });
        
        // Chặn chỉnh sửa Super Admin để tránh tự khoá mình
        if (role.Key == "super_admin") 
            return BadRequest(new { error = "Không thể chỉnh sửa quyền của Super Admin (Hệ thống bảo vệ)." });

        var rp = await _ctx.RolePermissions.FindAsync(request.RoleId, request.PermissionId);
        
        if (rp != null)
        {
            _ctx.RolePermissions.Remove(rp);
            await _ctx.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã thu hồi quyền.", enabled = false });
        }
        else
        {
            _ctx.RolePermissions.Add(new Domain.Entities.RolePermission 
            { 
                RoleId = request.RoleId, 
                PermissionId = request.PermissionId 
            });
            await _ctx.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã cấp quyền.", enabled = true });
        }
    }
}

public record TogglePermissionRequest(int RoleId, int PermissionId);
