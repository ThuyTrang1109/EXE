using ChipStarot.Domain.Entities;

namespace ChipStarot.Domain.Interfaces;

public interface IAccountRepository
{
    Task<Account?> GetByIdAsync(Guid id);
    Task<Account?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task AddAsync(Account account);
    Task UpdateAsync(Account account);
    Task<CustomerProfile?> GetCustomerProfileAsync(Guid accountId);
    Task UpdateCustomerProfileAsync(CustomerProfile profile);
    Task<(int TotalCount, IEnumerable<Account> Items)> GetAllCustomersAsync(int page, int pageSize);
    /// <summary>Lấy Account kèm theo Role và Permissions cho endpoint /profile/me</summary>
    Task<Account?> GetByIdWithPermissionsAsync(Guid id);
}

public interface INfcRepository
{
    Task<NfcChip?> GetByTagIdAsync(string nfcTagId);
    Task AddAsync(NfcChip chip);
    Task UpdateAsync(NfcChip chip);
    Task<IEnumerable<NfcChip>> GetByAccountIdAsync(Guid accountId);
    Task<IEnumerable<NfcChip>> GetAllAsync();
    Task<bool> ExistsAsync(string nfcTagId);
}

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetAllAsync(bool includeInactive = false);
    Task<IEnumerable<Product>> GetFeaturedAsync();
    Task<(int TotalCount, IEnumerable<Product> Items)> GetPagedAsync(int page, int pageSize, int? categoryId, string? search);
    Task AddAsync(Product product);
    Task UpdateAsync(Product product);
    Task DeleteAsync(int id);
    Task<IEnumerable<ProductCategory>> GetCategoriesAsync();
    Task<IEnumerable<ProductReview>> GetReviewsByProductAsync(int productId);
    Task AddReviewAsync(ProductReview review);
    Task UpdateRatingCacheAsync(int productId, decimal avgRating, int count);
}

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id);
    Task<IEnumerable<Order>> GetByAccountIdAsync(Guid accountId);
    Task<(int TotalCount, IEnumerable<Order> Items)> GetAllAsync(int page, int pageSize, string? status);
    Task AddAsync(Order order);
    Task UpdateAsync(Order order);
    Task AddStatusHistoryAsync(OrderStatusHistory history);
    Task<Cart?> GetCartByAccountIdAsync(Guid accountId);
    Task<Cart> GetOrCreateCartAsync(Guid accountId);
    Task UpdateCartAsync(Cart cart);
    Task<Voucher?> GetVoucherByCodeAsync(string code);
    
    // Admin CRUD
    Task<IEnumerable<Voucher>> GetAllVouchersAsync();
    Task AddVoucherAsync(Voucher voucher);
    Task UpdateVoucherAsync(Voucher voucher);
    Task DeleteVoucherAsync(int id);

    // Inventory
    Task AddInventoryLogAsync(InventoryLog log);
    Task<(int TotalCount, IEnumerable<InventoryLog> Items)> GetInventoryLogsAsync(int page, int pageSize, int? productId);
}

public interface ITarotRepository
{
    Task<IEnumerable<TarotCard>> GetAllCardsAsync();
    Task<TarotCard?> GetCardByIdAsync(int id);
    Task<TarotReading?> GetReadingByIdAsync(Guid id);
    Task<IEnumerable<TarotReading>> GetReadingsByAccountAsync(Guid accountId, int page, int pageSize);
    /// <summary>Trả về tổng số bài reading của account (dùng cho phân trang chính xác)</summary>
    Task<int> GetReadingsCountByAccountAsync(Guid accountId);
    Task AddReadingAsync(TarotReading reading);
    Task UpdateReadingAsync(TarotReading reading);
    Task<IEnumerable<TarotCreditPackage>> GetCreditPackagesAsync();
    Task<TarotCreditPackage?> GetCreditPackageByIdAsync(string id);
    Task<CreditPackagePurchase?> GetPurchaseByIdAsync(Guid id);
    Task AddPurchaseAsync(CreditPackagePurchase purchase);
    Task<CreditPackagePurchase?> GetActivePackageForAccountAsync(Guid accountId);
    
    // Admin CRUD
    Task AddCardAsync(TarotCard card);
    Task UpdateCardAsync(TarotCard card);
    Task DeleteCardAsync(int id);
}

public interface ICreditRepository
{
    Task AddTransactionAsync(CreditTransaction transaction);
    Task<IEnumerable<CreditTransaction>> GetByAccountAsync(Guid accountId, int page, int pageSize);
    Task<int> GetCurrentBalanceAsync(Guid accountId);
}

public interface IPetRepository
{
    Task AddLogAsync(PetGameLog log);
    Task<IEnumerable<PetGameLog>> GetByAccountAsync(Guid accountId, int limit = 50);
}

public interface IAuthRepository
{
    Task AddOtpAsync(OtpVerification otp);
    Task<OtpVerification?> GetValidOtpAsync(string email, string code, string type);
    Task MarkOtpUsedAsync(int otpId);
    Task ExpireOldOtpsAsync(string email, string type);

    // ── Refresh Token (DB-backed, survives server restarts) ──
    Task SaveRefreshTokenAsync(Guid accountId, string token, int expireDays);
    Task<Guid?> GetAccountIdByRefreshTokenAsync(string token);
    Task RevokeRefreshTokenAsync(string token);
    Task CleanupExpiredRefreshTokensAsync();
}

public interface ISystemSettingRepository
{
    Task<string?> GetValueAsync(string key);
    Task SetValueAsync(string key, string value, Guid? updatedBy = null);
    Task<IEnumerable<SystemSetting>> GetAllAsync();
}

public interface IAdminRepository
{
    Task<AdminDashboardStats> GetDashboardStatsAsync();
    Task<IEnumerable<RevenueByDay>> GetRevenueChartAsync(int days);
    Task<IEnumerable<NfcChip>> GetNfcStatusOverviewAsync();
}

public interface IBlogRepository
{
    Task<BlogPost?> GetByIdAsync(int id);
    Task<BlogPost?> GetBySlugAsync(string slug);
    Task<(int TotalCount, IEnumerable<BlogPost> Items)> GetPagedAsync(int page, int pageSize, string? status = "published");
    Task AddAsync(BlogPost post);
    Task UpdateAsync(BlogPost post);
    Task DeleteAsync(int id);
}

// --- DTOs for Admin reports ---
public class AdminDashboardStats
{
    public int TotalUsers { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalReadings { get; set; }
    public int ActiveNfcCards { get; set; }
    public int NewUsersToday { get; set; }
    public int OrdersToday { get; set; }
    public decimal RevenueToday { get; set; }
}

public class RevenueByDay
{
    public DateOnly Date { get; set; }
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}
