using ChipStarot.Application.DTOs.Orders;
using ChipStarot.Application.Services;
using ChipStarot.WebAPI.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChipStarot.WebAPI.Controllers;

/// <summary>Shopping cart and orders</summary>
[Route("api")]
[Authorize]
public class OrdersController : BaseApiController
{
    private readonly IOrderService _orderService;
    public OrdersController(IOrderService orderService) => _orderService = orderService;

    // ─── Cart ───
    [HttpGet("cart")]
    public async Task<IActionResult> GetCart() =>
        ToResponse(await _orderService.GetCartAsync(CurrentUserId));

    [HttpPost("cart/items")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request) =>
        ToResponse(await _orderService.AddToCartAsync(request, CurrentUserId));

    [HttpPut("cart/items")]
    public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemRequest request) =>
        ToResponse(await _orderService.UpdateCartItemAsync(request, CurrentUserId));

    [HttpDelete("cart/items/{productId:int}")]
    public async Task<IActionResult> RemoveFromCart(int productId) =>
        ToResponse(await _orderService.RemoveFromCartAsync(productId, CurrentUserId));

    [HttpDelete("cart")]
    public async Task<IActionResult> ClearCart() =>
        ToResponse(await _orderService.ClearCartAsync(CurrentUserId));

    // ─── Orders ───

    /// <summary>Đặt hàng từ giỏ hàng</summary>
    [HttpPost("orders/checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request) =>
        ToResponse(await _orderService.CheckoutAsync(request, CurrentUserId));

    /// <summary>Lịch sử đơn hàng của tôi</summary>
    [HttpGet("orders/my")]
    public async Task<IActionResult> GetMyOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10) =>
        ToResponse(await _orderService.GetMyOrdersAsync(CurrentUserId, page, pageSize));

    /// <summary>Chi tiết đơn hàng</summary>
    [HttpGet("orders/{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id) =>
        ToResponse(await _orderService.GetOrderByIdAsync(id, CurrentUserId));

    // ─── Admin ───

    /// <summary>[Admin] Tất cả đơn hàng</summary>
    [HttpGet("admin/orders")]
    [HasPermission("orders.manage")]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null) =>
        ToResponse(await _orderService.GetAllOrdersAsync(page, pageSize, status));

    /// <summary>[Admin] Cập nhật trạng thái đơn hàng</summary>
    [HttpPut("admin/orders/{id:guid}/status")]
    [HasPermission("orders.manage")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request) =>
        ToResponse(await _orderService.UpdateOrderStatusAsync(id, request, CurrentUserId));
}
