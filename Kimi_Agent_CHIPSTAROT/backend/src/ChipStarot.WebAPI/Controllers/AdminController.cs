using ChipStarot.Domain.Interfaces;
using ChipStarot.WebAPI.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChipStarot.WebAPI.Controllers;

[Route("api/admin")]
[Authorize]
public class AdminController : BaseApiController
{
    private readonly IAdminRepository _adminRepo;
    private readonly IAccountRepository _accountRepo;
    private readonly ISystemSettingRepository _settingRepo;
    private readonly IOrderRepository _orderRepo;
    private readonly IProductRepository _productRepo;

    public AdminController(
        IAdminRepository adminRepo,
        IAccountRepository accountRepo,
        ISystemSettingRepository settingRepo,
        IOrderRepository orderRepo,
        IProductRepository productRepo)
    {
        _adminRepo = adminRepo;
        _accountRepo = accountRepo;
        _settingRepo = settingRepo;
        _orderRepo = orderRepo;
        _productRepo = productRepo;
    }

    /// <summary>Dashboard tổng quan thống kê</summary>
    [HttpGet("dashboard")]
    [HasPermission("dashboard.view")]
    public async Task<IActionResult> GetDashboard()
    {
        var stats = await _adminRepo.GetDashboardStatsAsync();
        return Ok(new { success = true, data = stats });
    }

    /// <summary>Biểu đồ doanh thu theo ngày</summary>
    [HttpGet("revenue-chart")]
    [HasPermission("dashboard.view")]
    public async Task<IActionResult> GetRevenueChart([FromQuery] int days = 30)
    {
        if (days < 1 || days > 365) days = 30;
        var data = await _adminRepo.GetRevenueChartAsync(days);
        return Ok(new { success = true, data });
    }

    /// <summary>Danh sách tất cả khách hàng</summary>
    [HttpGet("customers")]
    [HasPermission("users.view")]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var (total, items) = await _accountRepo.GetAllCustomersAsync(page, pageSize);
        var dtos = items.Select(a => new
        {
            a.Id,
            a.Email,
            a.AccountStatus,
            a.IsVerified,
            a.CreatedAt,
            FullName = a.CustomerProfile?.FullName,
            Credits = a.CustomerProfile?.Credits ?? 0,
            PetExp = a.CustomerProfile?.PetExp ?? 0
        });
        return Ok(new { success = true, data = dtos, total, page, pageSize });
    }

    /// <summary>Khoá / Mở khoá tài khoản</summary>
    [HttpPut("customers/{id:guid}/status")]
    [HasPermission("users.manage")]
    public async Task<IActionResult> UpdateAccountStatus(Guid id, [FromBody] UpdateAccountStatusRequest request)
    {
        var account = await _accountRepo.GetByIdAsync(id);
        if (account == null) return NotFound(new { error = "Tài khoản không tồn tại." });
        if (account.RoleId == 1) return BadRequest(new { error = "Không thể thay đổi trạng thái tài khoản Admin." });

        account.AccountStatus = request.Status;
        await _accountRepo.UpdateAsync(account);
        return Ok(new { success = true, message = $"Tài khoản đã được {request.Status}." });
    }

    /// <summary>Tổng quan thẻ NFC</summary>
    [HttpGet("nfc-overview")]
    [HasPermission("nfc.view")]
    public async Task<IActionResult> GetNfcOverview()
    {
        var chips = await _adminRepo.GetNfcStatusOverviewAsync();
        var summary = new
        {
            Total = chips.Count(),
            Activated = chips.Count(c => c.Status == "activated"),
            Unactivated = chips.Count(c => c.Status == "unactivated"),
            Transferred = chips.Count(c => c.Status == "transferred"),
            Items = chips.Select(c => new
            {
                c.NfcTagId,
                ProductName = c.Product?.Name,
                AccountEmail = c.Account?.Email,
                c.Status,
                c.ScanCount,
                c.ActivatedAt
            })
        };
        return Ok(new { success = true, data = summary });
    }

    /// <summary>Lấy cài đặt hệ thống</summary>
    [HttpGet("settings")]
    [HasPermission("settings.manage")]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _settingRepo.GetAllAsync();
        // Ẩn API key - chỉ trả về có/không có
        var safe = settings.Select(s => new
        {
            s.SettingKey,
            Value = s.SettingKey.Contains("KEY") ? (string.IsNullOrEmpty(s.SettingValue) ? "" : "***") : s.SettingValue,
            s.Description,
            s.UpdatedAt
        });
        return Ok(new { success = true, data = safe });
    }

    /// <summary>Cập nhật cài đặt hệ thống</summary>
    [HttpPut("settings/{key}")]
    [HasPermission("settings.manage")]
    public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSettingRequest request)
    {
        await _settingRepo.SetValueAsync(key, request.Value, CurrentUserId);
        return Ok(new { success = true, message = "Cài đặt đã được cập nhật." });
    }

    /// <summary>Cấp credit cho người dùng (thủ công)</summary>
    [HttpPost("grant-credits")]
    [HasPermission("users.manage")]
    public async Task<IActionResult> GrantCredits([FromBody] GrantCreditsRequest request)
    {
        var profile = await _accountRepo.GetCustomerProfileAsync(request.AccountId);
        if (profile == null) return NotFound(new { error = "Hồ sơ không tồn tại." });

        profile.Credits += request.Amount;
        await _accountRepo.UpdateCustomerProfileAsync(profile);
        return Ok(new { success = true, message = $"Đã cấp {request.Amount} credit cho tài khoản." });
    }

    // ─── Voucher Management ───

    /// <summary>Danh sách tất cả voucher</summary>
    [HttpGet("vouchers")]
    [HasPermission("products.manage")]
    public async Task<IActionResult> GetVouchers()
    {
        var vouchers = await _orderRepo.GetAllVouchersAsync();
        return Ok(new { success = true, data = vouchers });
    }

    /// <summary>Tạo voucher mới</summary>
    [HttpPost("vouchers")]
    [HasPermission("products.manage")]
    public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherRequest request)
    {
        var voucher = new Domain.Entities.Voucher
        {
            Code = request.Code.ToUpperInvariant(),
            DiscountPercent = (int)request.DiscountPercent,
            MaxDiscountAmount = request.MaxDiscountAmount,
            MinOrderAmount = request.MinOrderAmount,
            UsageLimit = request.UsageLimit,
            EndDate = request.EndDate
        };
        await _orderRepo.AddVoucherAsync(voucher);
        return StatusCode(201, new { success = true, data = voucher });
    }

    /// <summary>Xoá voucher</summary>
    [HttpDelete("vouchers/{id:int}")]
    [HasPermission("products.manage")]
    public async Task<IActionResult> DeleteVoucher(int id)
    {
        await _orderRepo.DeleteVoucherAsync(id);
        return Ok(new { success = true, message = "Voucher đã được xoá." });
    }

    // ─── Inventory Management ───

    /// <summary>Lấy nhật ký biến động kho</summary>
    [HttpGet("inventory/logs")]
    [HasPermission("products.manage")]
    public async Task<IActionResult> GetInventoryLogs(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] int? productId = null)
    {
        var (total, items) = await _orderRepo.GetInventoryLogsAsync(page, pageSize, productId);
        var dtos = items.Select(l => new
        {
            l.Id,
            l.ProductId,
            ProductName = l.Product?.Name,
            l.ChangeAmount,
            l.BalanceAfter,
            l.Type,
            l.Note,
            ActorName = l.Actor?.Email,
            l.CreatedAt
        });
        return Ok(new { success = true, data = dtos, total, page, pageSize });
    }

    /// <summary>Điều chỉnh tồn kho thủ công</summary>
    [HttpPost("inventory/adjust")]
    [HasPermission("products.manage")]
    public async Task<IActionResult> AdjustStock([FromBody] AdjustStockRequest request)
    {
        var product = await _productRepo.GetByIdAsync(request.ProductId);
        if (product == null) return NotFound(new { error = "Sản phẩm không tồn tại." });

        product.StockQuantity += request.ChangeAmount;
        if (product.StockQuantity < 0) product.StockQuantity = 0;

        await _productRepo.UpdateAsync(product);

        // Ghi nhật ký
        await _orderRepo.AddInventoryLogAsync(new Domain.Entities.InventoryLog
        {
            ProductId = product.Id,
            ChangeAmount = request.ChangeAmount,
            BalanceAfter = product.StockQuantity,
            Type = request.Type,
            Note = request.Note,
            ActorId = CurrentUserId
        });

        return Ok(new { success = true, message = "Điều chỉnh tồn kho thành công.", newQuantity = product.StockQuantity });
    }
}

// Request DTOs cho Admin
public record AdjustStockRequest(int ProductId, int ChangeAmount, string Type, string Note); // Type: restock | damage | audit
public record UpdateAccountStatusRequest(string Status); // active | banned
public record UpdateSettingRequest(string Value);

public record GrantCreditsRequest(Guid AccountId, int Amount);
