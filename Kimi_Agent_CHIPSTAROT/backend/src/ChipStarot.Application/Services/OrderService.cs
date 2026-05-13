using ChipStarot.Application.DTOs.Orders;
using ChipStarot.Domain.Common;
using ChipStarot.Domain.Entities;
using ChipStarot.Domain.Interfaces;

namespace ChipStarot.Application.Services;

public interface IOrderService
{
    Task<Result<CartDto>> GetCartAsync(Guid accountId);
    Task<Result<CartDto>> AddToCartAsync(AddToCartRequest request, Guid accountId);
    Task<Result<CartDto>> UpdateCartItemAsync(UpdateCartItemRequest request, Guid accountId);
    Task<Result> RemoveFromCartAsync(int productId, Guid accountId);
    Task<Result> ClearCartAsync(Guid accountId);
    Task<Result<OrderDto>> CheckoutAsync(CheckoutRequest request, Guid accountId);
    Task<Result<PagedResult<OrderDto>>> GetMyOrdersAsync(Guid accountId, int page, int pageSize);
    Task<Result<OrderDto>> GetOrderByIdAsync(Guid orderId, Guid accountId);
    Task<Result<PagedResult<OrderDto>>> GetAllOrdersAsync(int page, int pageSize, string? status);
    Task<Result> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusRequest request, Guid adminId);
}

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepo;
    private readonly IProductRepository _productRepo;
    private readonly ISystemSettingRepository _sysRepo;

    public OrderService(IOrderRepository orderRepo, IProductRepository productRepo, ISystemSettingRepository sysRepo)
    {
        _orderRepo = orderRepo;
        _productRepo = productRepo;
        _sysRepo = sysRepo;
    }

    public async Task<Result<CartDto>> GetCartAsync(Guid accountId)
    {
        var cart = await _orderRepo.GetOrCreateCartAsync(accountId);
        return Result<CartDto>.Success(await MapCartAsync(cart));
    }

    public async Task<Result<CartDto>> AddToCartAsync(AddToCartRequest request, Guid accountId)
    {
        var product = await _productRepo.GetByIdAsync(request.ProductId);
        if (product == null || !product.IsActive)
            return Result<CartDto>.Failure("Sản phẩm không tồn tại.", 404);
        if (product.StockQuantity < request.Quantity)
            return Result<CartDto>.Failure("Sản phẩm không đủ số lượng tồn kho.");

        var cart = await _orderRepo.GetOrCreateCartAsync(accountId);
        var existing = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
        if (existing != null)
            existing.Quantity += request.Quantity;
        else
            cart.Items.Add(new CartItem { CartId = cart.Id, ProductId = request.ProductId, Quantity = request.Quantity });

        await _orderRepo.UpdateCartAsync(cart);
        return Result<CartDto>.Success(await MapCartAsync(cart));
    }

    public async Task<Result<CartDto>> UpdateCartItemAsync(UpdateCartItemRequest request, Guid accountId)
    {
        var cart = await _orderRepo.GetOrCreateCartAsync(accountId);
        var item = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
        if (item == null) return Result<CartDto>.Failure("Sản phẩm không có trong giỏ hàng.", 404);

        if (request.Quantity <= 0)
            cart.Items.Remove(item);
        else
            item.Quantity = request.Quantity;

        await _orderRepo.UpdateCartAsync(cart);
        return Result<CartDto>.Success(await MapCartAsync(cart));
    }

    public async Task<Result> RemoveFromCartAsync(int productId, Guid accountId)
    {
        var cart = await _orderRepo.GetOrCreateCartAsync(accountId);
        var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (item != null)
        {
            cart.Items.Remove(item);
            await _orderRepo.UpdateCartAsync(cart);
        }
        return Result.Success();
    }

    public async Task<Result> ClearCartAsync(Guid accountId)
    {
        var cart = await _orderRepo.GetOrCreateCartAsync(accountId);
        cart.Items.Clear();
        await _orderRepo.UpdateCartAsync(cart);
        return Result.Success();
    }

    public async Task<Result<OrderDto>> CheckoutAsync(CheckoutRequest request, Guid accountId)
    {
        var cart = await _orderRepo.GetCartByAccountIdAsync(accountId);
        if (cart == null || !cart.Items.Any())
            return Result<OrderDto>.Failure("Giỏ hàng trống.");

        // Validate products
        var orderItems = new List<OrderItem>();
        decimal subtotal = 0;
        foreach (var cartItem in cart.Items)
        {
            var product = await _productRepo.GetByIdAsync(cartItem.ProductId);
            if (product == null || !product.IsActive)
                return Result<OrderDto>.Failure($"Sản phẩm ID {cartItem.ProductId} không hợp lệ.");
            if (product.StockQuantity < cartItem.Quantity)
                return Result<OrderDto>.Failure($"Sản phẩm '{product.Name}' không đủ tồn kho.");

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = cartItem.Quantity,
                PriceAtPurchase = product.BasePrice
            });
            subtotal += product.BasePrice * cartItem.Quantity;
        }

        // Apply voucher
        decimal discount = 0;
        Voucher? voucher = null;
        if (!string.IsNullOrEmpty(request.VoucherCode))
        {
            voucher = await _orderRepo.GetVoucherByCodeAsync(request.VoucherCode);
            if (voucher == null)
                return Result<OrderDto>.Failure("Mã giảm giá không tồn tại.");

            if (voucher.StartDate.HasValue && voucher.StartDate > DateTime.UtcNow)
                return Result<OrderDto>.Failure("Mã giảm giá chưa đến ngày sử dụng.");

            if (voucher.EndDate.HasValue && voucher.EndDate < DateTime.UtcNow)
                return Result<OrderDto>.Failure("Mã giảm giá đã hết hạn.");

            if (voucher.UsedCount >= voucher.UsageLimit)
                return Result<OrderDto>.Failure("Mã giảm giá đã hết lượt sử dụng.");

            if (subtotal < voucher.MinOrderAmount)
                return Result<OrderDto>.Failure($"Đơn hàng tối thiểu {voucher.MinOrderAmount:N0}đ để dùng mã này.");

            discount = Math.Min(subtotal * voucher.DiscountPercent / 100,
                voucher.MaxDiscountAmount ?? decimal.MaxValue);
        }

        var shipFeeStr = await _sysRepo.GetValueAsync("chipstarot_shipping_fee") ?? "30000";
        var shippingFee = decimal.TryParse(shipFeeStr, out var sf) ? sf : 30000m;
        var total = subtotal - discount + shippingFee;

        var order = new Order
        {
            AccountId = accountId,
            VoucherId = voucher?.Id,
            SubtotalAmount = subtotal,
            DiscountAmount = discount,
            ShippingFee = shippingFee,
            TotalAmount = total,
            ShippingProvince = request.ShippingProvince,
            ShippingDistrict = request.ShippingDistrict,
            ShippingWard = request.ShippingWard,
            ShippingStreet = request.ShippingStreet,
            RecipientName = request.RecipientName,
            RecipientPhone = request.RecipientPhone,
            RecipientEmail = request.RecipientEmail,
            Notes = request.Notes,
            Status = "pending",
            PaymentStatus = request.PaymentMethod == "demo" ? "paid" : "unpaid",
            Items = orderItems
        };

        await _orderRepo.AddAsync(order);
        
        // Update voucher usage count
        if (voucher != null)
        {
            voucher.UsedCount++;
            await _orderRepo.UpdateVoucherAsync(voucher);
        }

        // Update stock & record logs
        foreach (var item in orderItems)
        {
            var product = await _productRepo.GetByIdAsync(item.ProductId);
            if (product != null)
            {
                product.StockQuantity -= item.Quantity;
                await _productRepo.UpdateAsync(product);

                // Ghi nhật ký kho
                await _orderRepo.AddInventoryLogAsync(new InventoryLog
                {
                    ProductId = product.Id,
                    ChangeAmount = -item.Quantity,
                    BalanceAfter = product.StockQuantity,
                    Type = "sale",
                    Note = $"Đơn hàng {order.Id}",
                    ActorId = accountId
                });
            }
        }

        // Clear cart
        cart.Items.Clear();
        await _orderRepo.UpdateCartAsync(cart);

        return Result<OrderDto>.Success(MapOrder(order), 201);
    }

    public async Task<Result<PagedResult<OrderDto>>> GetMyOrdersAsync(Guid accountId, int page, int pageSize)
    {
        var orders = (await _orderRepo.GetByAccountIdAsync(accountId)).ToList();
        var paged = orders.Skip((page - 1) * pageSize).Take(pageSize);
        return Result<PagedResult<OrderDto>>.Success(new PagedResult<OrderDto>
        {
            Items = paged.Select(MapOrder), TotalCount = orders.Count, Page = page, PageSize = pageSize
        });
    }

    public async Task<Result<OrderDto>> GetOrderByIdAsync(Guid orderId, Guid accountId)
    {
        var order = await _orderRepo.GetByIdAsync(orderId);
        if (order == null) return Result<OrderDto>.Failure("Đơn hàng không tồn tại.", 404);
        if (order.AccountId != accountId) return Result<OrderDto>.Failure("Không có quyền truy cập.", 403);
        return Result<OrderDto>.Success(MapOrder(order));
    }

    public async Task<Result<PagedResult<OrderDto>>> GetAllOrdersAsync(int page, int pageSize, string? status)
    {
        var (total, orders) = await _orderRepo.GetAllAsync(page, pageSize, status);
        return Result<PagedResult<OrderDto>>.Success(new PagedResult<OrderDto>
        {
            Items = orders.Select(MapOrder), TotalCount = total, Page = page, PageSize = pageSize
        });
    }

    public async Task<Result> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusRequest request, Guid adminId)
    {
        var order = await _orderRepo.GetByIdAsync(orderId);
        if (order == null) return Result.Failure("Đơn hàng không tồn tại.", 404);

        var oldStatus = order.Status;
        order.Status = request.NewStatus;
        order.UpdatedAt = DateTime.UtcNow;
        await _orderRepo.UpdateAsync(order);

        await _orderRepo.AddStatusHistoryAsync(new OrderStatusHistory
        {
            OrderId = orderId,
            OldStatus = oldStatus,
            NewStatus = request.NewStatus,
            ChangedBy = adminId,
            Note = request.Note
        });

        return Result.Success();
    }

    private async Task<CartDto> MapCartAsync(Cart cart)
    {
        var items = new List<CartItemDto>();
        decimal total = 0;
        foreach (var item in cart.Items)
        {
            var product = await _productRepo.GetByIdAsync(item.ProductId);
            if (product != null)
            {
                items.Add(new CartItemDto(product.Id, product.Name, product.ImageUrl, product.BasePrice, item.Quantity));
                total += product.BasePrice * item.Quantity;
            }
        }
        return new CartDto(cart.Id, items, total);
    }

    private static OrderDto MapOrder(Order o) => new(
        o.Id, o.SubtotalAmount, o.DiscountAmount, o.ShippingFee, o.TotalAmount,
        o.Status, o.PaymentStatus, o.ShippingProvince, o.ShippingDistrict, o.ShippingWard,
        o.ShippingStreet, o.RecipientName, o.RecipientPhone, o.CreatedAt,
        o.Items.Select(i => new OrderItemDto(
            i.ProductId, i.Product?.Name ?? "", i.Product?.ImageUrl, i.Quantity, i.PriceAtPurchase)));
}
