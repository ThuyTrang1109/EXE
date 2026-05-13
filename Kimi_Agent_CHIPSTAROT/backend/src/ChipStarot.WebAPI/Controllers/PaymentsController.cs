using ChipStarot.Domain.Interfaces;
using ChipStarot.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChipStarot.WebAPI.Controllers;

[Route("api/payments")]
[Authorize]
public class PaymentsController : BaseApiController
{
    private readonly IVnPayService _vnPayService;
    private readonly IOrderRepository _orderRepo;
    private readonly IConfiguration _config;

    public PaymentsController(IVnPayService vnPayService, IOrderRepository orderRepo, IConfiguration config)
    {
        _vnPayService = vnPayService;
        _orderRepo = orderRepo;
        _config = config;
    }

    /// <summary>Tạo URL thanh toán VNPAY cho đơn hàng</summary>
    [HttpPost("vnpay/create/{orderId:guid}")]
    public async Task<IActionResult> CreateVnpayUrl(Guid orderId)
    {
        var order = await _orderRepo.GetByIdAsync(orderId);
        if (order == null || order.AccountId != CurrentUserId)
            return NotFound(new { error = "Đơn hàng không tồn tại." });

        if (order.PaymentStatus == "paid")
            return BadRequest(new { error = "Đơn hàng đã được thanh toán trước đó." });

        var url = _vnPayService.CreatePaymentUrl(HttpContext, order.TotalAmount, 
            $"Thanh toan don hang {order.Id}", order.Id.ToString());

        return Ok(new { success = true, data = url });
    }

    /// <summary>VNPAY Callback - Xử lý sau khi người dùng thanh toán xong trên web VNPAY</summary>
    [HttpGet("vnpay/callback")]
    [AllowAnonymous]
    public async Task<IActionResult> VnpayCallback()
    {
        var isValid = _vnPayService.ValidateCallback(Request.Query);
        if (!isValid) return BadRequest(new { error = "Chu ký không hợp lệ." });

        var vnp_ResponseCode = Request.Query["vnp_ResponseCode"];
        var vnp_TxnRef = Request.Query["vnp_TxnRef"];
        
        if (vnp_ResponseCode == "00" && Guid.TryParse(vnp_TxnRef, out var orderId))
        {
            var order = await _orderRepo.GetByIdAsync(orderId);
            if (order != null && order.PaymentStatus != "paid")
            {
                order.PaymentStatus = "paid";
                order.Status = "processing"; // Chuyển sang trạng thái đang xử lý
                order.UpdatedAt = DateTime.UtcNow;
                await _orderRepo.UpdateAsync(order);
            }
            // Redirect về trang thành công của Frontend
            return Redirect(_config["VnPay:ReturnUrl"] + "?status=success&orderId=" + orderId);
        }

        return Redirect(_config["VnPay:ReturnUrl"] + "?status=failed");
    }

    /// <summary>VNPAY IPN - VNPAY gọi ngầm để cập nhật trạng thái đơn hàng (an toàn hơn callback)</summary>
    [HttpGet("vnpay/ipn")]
    [AllowAnonymous]
    public async Task<IActionResult> VnpayIpn()
    {
        // Tương tự callback nhưng trả về JSON cho VNPAY theo format của họ
        var isValid = _vnPayService.ValidateCallback(Request.Query);
        if (!isValid) return Ok(new { RspCode = "97", Message = "Invalid Checksum" });

        var vnp_ResponseCode = Request.Query["vnp_ResponseCode"];
        var vnp_TxnRef = Request.Query["vnp_TxnRef"];
        
        if (Guid.TryParse(vnp_TxnRef, out var orderId))
        {
            var order = await _orderRepo.GetByIdAsync(orderId);
            if (order == null) return Ok(new { RspCode = "01", Message = "Order not found" });

            if (order.PaymentStatus == "paid") return Ok(new { RspCode = "02", Message = "Order already confirmed" });

            if (vnp_ResponseCode == "00")
            {
                order.PaymentStatus = "paid";
                order.Status = "processing";
                order.UpdatedAt = DateTime.UtcNow;
                await _orderRepo.UpdateAsync(order);
            }
            
            return Ok(new { RspCode = "00", Message = "Confirm Success" });
        }

        return Ok(new { RspCode = "99", Message = "Unknown Error" });
    }
}
