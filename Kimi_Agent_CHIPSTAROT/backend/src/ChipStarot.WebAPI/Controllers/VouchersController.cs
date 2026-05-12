using ChipStarot.Domain.Entities;
using ChipStarot.Domain.Interfaces;
using ChipStarot.WebAPI.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChipStarot.WebAPI.Controllers;

// ── DTOs ──────────────────────────────────────────────────────────────────────
public record VoucherDto(
    int Id, string Code, int DiscountPercent, decimal? MaxDiscountAmount,
    decimal MinOrderAmount, DateTime? StartDate, DateTime? EndDate,
    int UsageLimit, int UsedCount);

public record CreateVoucherRequest(
    string Code, int DiscountPercent, decimal? MaxDiscountAmount,
    decimal MinOrderAmount, DateTime? StartDate, DateTime? EndDate,
    int UsageLimit = 100);

public record UpdateVoucherRequest(
    string Code, int DiscountPercent, decimal? MaxDiscountAmount,
    decimal MinOrderAmount, DateTime? StartDate, DateTime? EndDate,
    int UsageLimit);

// ── Controller ────────────────────────────────────────────────────────────────
/// <summary>Quản lý mã giảm giá Voucher</summary>
[Route("api/vouchers")]
public class VouchersController : BaseApiController
{
    private readonly IOrderRepository _orderRepo;

    public VouchersController(IOrderRepository orderRepo)
    {
        _orderRepo = orderRepo;
    }

    /// <summary>[Admin] Lấy toàn bộ danh sách Voucher</summary>
    [HttpGet]
    [HasPermission("vouchers.view")]
    public async Task<IActionResult> GetVouchers()
    {
        var vouchers = await _orderRepo.GetAllVouchersAsync();
        var dtos = vouchers.Select(MapToDto);
        return Ok(new { success = true, data = dtos });
    }

    /// <summary>[Admin] Tạo Voucher mới</summary>
    [HttpPost]
    [HasPermission("vouchers.manage")]
    public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
            return BadRequest(new { success = false, error = "Mã giảm giá không được để trống." });

        if (request.DiscountPercent < 1 || request.DiscountPercent > 100)
            return BadRequest(new { success = false, error = "Phần trăm giảm giá phải từ 1 đến 100." });

        // Kiểm tra mã trùng lặp
        var existing = await _orderRepo.GetVoucherByCodeAsync(request.Code.ToUpper().Trim());
        if (existing != null)
            return BadRequest(new { success = false, error = $"Mã '{request.Code}' đã tồn tại trong hệ thống." });

        var voucher = new Voucher
        {
            Code = request.Code.ToUpper().Trim(),
            DiscountPercent = request.DiscountPercent,
            MaxDiscountAmount = request.MaxDiscountAmount,
            MinOrderAmount = request.MinOrderAmount,
            StartDate = request.StartDate ?? DateTime.UtcNow,
            EndDate = request.EndDate,
            UsageLimit = request.UsageLimit,
            UsedCount = 0
        };

        await _orderRepo.AddVoucherAsync(voucher);
        return Ok(new { success = true, data = MapToDto(voucher) });
    }

    /// <summary>[Admin] Cập nhật Voucher</summary>
    [HttpPut("{id:int}")]
    [HasPermission("vouchers.manage")]
    public async Task<IActionResult> UpdateVoucher(int id, [FromBody] UpdateVoucherRequest request)
    {
        var vouchers = await _orderRepo.GetAllVouchersAsync();
        var existing = vouchers.FirstOrDefault(v => v.Id == id);
        if (existing == null)
            return NotFound(new { success = false, error = "Không tìm thấy voucher." });

        // Kiểm tra trùng code với voucher khác
        var codeConflict = await _orderRepo.GetVoucherByCodeAsync(request.Code.ToUpper().Trim());
        if (codeConflict != null && codeConflict.Id != id)
            return BadRequest(new { success = false, error = $"Mã '{request.Code}' đã được dùng bởi voucher khác." });

        existing.Code = request.Code.ToUpper().Trim();
        existing.DiscountPercent = request.DiscountPercent;
        existing.MaxDiscountAmount = request.MaxDiscountAmount;
        existing.MinOrderAmount = request.MinOrderAmount;
        existing.StartDate = request.StartDate;
        existing.EndDate = request.EndDate;
        existing.UsageLimit = request.UsageLimit;

        await _orderRepo.UpdateVoucherAsync(existing);
        return Ok(new { success = true, data = MapToDto(existing) });
    }

    /// <summary>[Admin] Xoá Voucher (cứng)</summary>
    [HttpDelete("{id:int}")]
    [HasPermission("vouchers.manage")]
    public async Task<IActionResult> DeleteVoucher(int id)
    {
        var vouchers = await _orderRepo.GetAllVouchersAsync();
        if (!vouchers.Any(v => v.Id == id))
            return NotFound(new { success = false, error = "Không tìm thấy voucher." });

        await _orderRepo.DeleteVoucherAsync(id);
        return Ok(new { success = true, message = "Đã xoá voucher thành công." });
    }

    /// <summary>Xác thực và áp dụng Voucher khi đặt hàng (Public)</summary>
    [HttpGet("validate")]
    public async Task<IActionResult> ValidateVoucher([FromQuery] string code, [FromQuery] decimal orderAmount)
    {
        if (string.IsNullOrWhiteSpace(code))
            return BadRequest(new { success = false, error = "Vui lòng nhập mã giảm giá." });

        var voucher = await _orderRepo.GetVoucherByCodeAsync(code.ToUpper().Trim());
        if (voucher == null)
            return Ok(new { success = false, error = "Mã giảm giá không tồn tại." });

        if (voucher.EndDate.HasValue && voucher.EndDate < DateTime.UtcNow)
            return Ok(new { success = false, error = "Mã giảm giá đã hết hạn." });

        if (voucher.StartDate.HasValue && voucher.StartDate > DateTime.UtcNow)
            return Ok(new { success = false, error = "Mã giảm giá chưa đến ngày sử dụng." });

        if (voucher.UsedCount >= voucher.UsageLimit)
            return Ok(new { success = false, error = "Mã giảm giá đã đạt giới hạn sử dụng." });

        if (orderAmount < voucher.MinOrderAmount)
            return Ok(new { success = false, error = $"Đơn hàng tối thiểu {voucher.MinOrderAmount:N0}đ để dùng mã này." });

        // Tính số tiền được giảm
        var discountAmount = orderAmount * voucher.DiscountPercent / 100;
        if (voucher.MaxDiscountAmount.HasValue)
            discountAmount = Math.Min(discountAmount, voucher.MaxDiscountAmount.Value);

        return Ok(new
        {
            success = true,
            data = new
            {
                voucher.Id,
                voucher.Code,
                voucher.DiscountPercent,
                DiscountAmount = discountAmount,
                FinalAmount = orderAmount - discountAmount
            }
        });
    }

    private static VoucherDto MapToDto(Voucher v) =>
        new(v.Id, v.Code, v.DiscountPercent, v.MaxDiscountAmount,
            v.MinOrderAmount, v.StartDate, v.EndDate, v.UsageLimit, v.UsedCount);
}
