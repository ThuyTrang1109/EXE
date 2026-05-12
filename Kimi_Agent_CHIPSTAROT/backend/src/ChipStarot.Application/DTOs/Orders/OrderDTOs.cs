namespace ChipStarot.Application.DTOs.Orders;

public record CartItemDto(int ProductId, string ProductName, string? ImageUrl, decimal Price, int Quantity);

public record CartDto(Guid CartId, IEnumerable<CartItemDto> Items, decimal TotalAmount);

public record AddToCartRequest(int ProductId, int Quantity = 1);

public record UpdateCartItemRequest(int ProductId, int Quantity);

public record ApplyVoucherRequest(string Code);

public record CheckoutRequest(
    string ShippingProvince,
    string ShippingDistrict,
    string ShippingWard,
    string ShippingStreet,
    string RecipientName,
    string RecipientPhone,
    string? RecipientEmail,
    string? Notes,
    string? VoucherCode,
    string PaymentMethod // cod | momo | vnpay | demo
);

public record OrderDto(
    Guid Id,
    decimal SubtotalAmount,
    decimal DiscountAmount,
    decimal ShippingFee,
    decimal TotalAmount,
    string Status,
    string PaymentStatus,
    string ShippingProvince,
    string ShippingDistrict,
    string ShippingWard,
    string ShippingStreet,
    string? RecipientName,
    string? RecipientPhone,
    DateTime CreatedAt,
    IEnumerable<OrderItemDto> Items
);

public record OrderItemDto(int ProductId, string ProductName, string? ImageUrl, int Quantity, decimal Price);

public record UpdateOrderStatusRequest(string NewStatus, string? Note);
