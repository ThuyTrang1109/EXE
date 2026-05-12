using ChipStarot.Domain.Entities;
using ChipStarot.Domain.Interfaces;
using ChipStarot.Infrastructure.Data;
using Dapper;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace ChipStarot.Infrastructure.Repositories;

public class AccountRepository : IAccountRepository
{
    private readonly AppDbContext _ctx;

    public AccountRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Account?> GetByIdAsync(Guid id) =>
        await _ctx.Accounts.AsNoTracking().Include(a => a.Role)
            .Include(a => a.CustomerProfile)
            .Include(a => a.AdminProfile)
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<Account?> GetByEmailAsync(string email) =>
        await _ctx.Accounts.AsNoTracking().Include(a => a.Role)
            .Include(a => a.CustomerProfile)
            .FirstOrDefaultAsync(a => a.Email == email);

    public async Task<bool> EmailExistsAsync(string email) =>
        await _ctx.Accounts.AnyAsync(a => a.Email == email);

    public async Task AddAsync(Account account)
    {
        _ctx.Accounts.Add(account);
        await _ctx.SaveChangesAsync();
    }

    public async Task UpdateAsync(Account account)
    {
        _ctx.Accounts.Update(account);
        await _ctx.SaveChangesAsync();
    }

    public async Task<CustomerProfile?> GetCustomerProfileAsync(Guid accountId) =>
        await _ctx.CustomerProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.AccountId == accountId);

    public async Task UpdateCustomerProfileAsync(CustomerProfile profile)
    {
        var existing = await _ctx.CustomerProfiles.FindAsync(profile.AccountId);
        if (existing == null)
        {
            _ctx.CustomerProfiles.Add(profile);
        }
        else
        {
            _ctx.Entry(existing).CurrentValues.SetValues(profile);
        }
        await _ctx.SaveChangesAsync();
    }

    public async Task<(int TotalCount, IEnumerable<Account> Items)> GetAllCustomersAsync(int page, int pageSize)
    {
        var query = _ctx.Accounts.AsNoTracking().Where(a => a.RoleId == 3) // 3 = customer
            .Include(a => a.CustomerProfile)
            .OrderByDescending(a => a.CreatedAt);
        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return (total, items);
    }
}

public class NfcRepository : INfcRepository
{
    private readonly AppDbContext _ctx;
    public NfcRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<NfcChip?> GetByTagIdAsync(string nfcTagId) =>
        await _ctx.NfcChips.AsNoTracking().Include(n => n.Product).Include(n => n.Account)
            .FirstOrDefaultAsync(n => n.NfcTagId == nfcTagId);

    public async Task AddAsync(NfcChip chip) { _ctx.NfcChips.Add(chip); await _ctx.SaveChangesAsync(); }
    public async Task UpdateAsync(NfcChip chip) { _ctx.NfcChips.Update(chip); await _ctx.SaveChangesAsync(); }
    public async Task<IEnumerable<NfcChip>> GetByAccountIdAsync(Guid accountId) =>
        await _ctx.NfcChips.AsNoTracking().Include(n => n.Product).Where(n => n.AccountId == accountId).ToListAsync();
    public async Task<IEnumerable<NfcChip>> GetAllAsync() =>
        await _ctx.NfcChips.Include(n => n.Product).Include(n => n.Account).ToListAsync();
    public async Task<bool> ExistsAsync(string nfcTagId) =>
        await _ctx.NfcChips.AnyAsync(n => n.NfcTagId == nfcTagId);
}

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _ctx;
    public ProductRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Product?> GetByIdAsync(int id) =>
        await _ctx.Products.AsNoTracking().Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
    public async Task<IEnumerable<Product>> GetAllAsync(bool includeInactive = false) =>
        await _ctx.Products.Include(p => p.Category)
            .Where(p => includeInactive || p.IsActive).ToListAsync();
    public async Task<IEnumerable<Product>> GetFeaturedAsync() =>
        await _ctx.Products.Where(p => p.IsFeatured && p.IsActive).ToListAsync();
    public async Task<(int TotalCount, IEnumerable<Product> Items)> GetPagedAsync(int page, int pageSize, int? categoryId, string? search)
    {
        var q = _ctx.Products.AsNoTracking().Include(p => p.Category).Where(p => p.IsActive);
        if (categoryId.HasValue) q = q.Where(p => p.CategoryId == categoryId);
        if (!string.IsNullOrEmpty(search)) q = q.Where(p => p.Name.Contains(search));
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return (total, items);
    }
    public async Task AddAsync(Product product) { _ctx.Products.Add(product); await _ctx.SaveChangesAsync(); }
    public async Task UpdateAsync(Product product) { _ctx.Products.Update(product); await _ctx.SaveChangesAsync(); }
    public async Task DeleteAsync(int id)
    {
        var p = await _ctx.Products.FindAsync(id);
        if (p != null) { p.IsActive = false; await _ctx.SaveChangesAsync(); }
    }
    public async Task<IEnumerable<ProductCategory>> GetCategoriesAsync() =>
        await _ctx.ProductCategories.Where(c => c.IsActive).ToListAsync();
    public async Task<IEnumerable<ProductReview>> GetReviewsByProductAsync(int productId) =>
        await _ctx.ProductReviews.Include(r => r.Account).ThenInclude(a => a!.CustomerProfile)
            .Where(r => r.ProductId == productId).OrderByDescending(r => r.CreatedAt).ToListAsync();
    public async Task AddReviewAsync(ProductReview review)
    {
        _ctx.ProductReviews.Add(review);
        await _ctx.SaveChangesAsync();
    }
    public async Task UpdateRatingCacheAsync(int productId, decimal avgRating, int count)
    {
        var p = await _ctx.Products.FindAsync(productId);
        if (p != null) { p.AverageRating = avgRating; p.ReviewCount = count; await _ctx.SaveChangesAsync(); }
    }
}

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _ctx;
    public OrderRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Order?> GetByIdAsync(Guid id) =>
        await _ctx.Orders.AsNoTracking().Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Voucher).FirstOrDefaultAsync(o => o.Id == id);
    public async Task<IEnumerable<Order>> GetByAccountIdAsync(Guid accountId) =>
        await _ctx.Orders.Include(o => o.Items).ThenInclude(i => i.Product)
            .Where(o => o.AccountId == accountId).OrderByDescending(o => o.CreatedAt).ToListAsync();
    public async Task<(int TotalCount, IEnumerable<Order> Items)> GetAllAsync(int page, int pageSize, string? status)
    {
        var q = _ctx.Orders.AsNoTracking().Include(o => o.Items).AsQueryable();
        if (!string.IsNullOrEmpty(status)) q = q.Where(o => o.Status == status);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(o => o.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return (total, items);
    }
    public async Task AddAsync(Order order) { _ctx.Orders.Add(order); await _ctx.SaveChangesAsync(); }
    public async Task UpdateAsync(Order order) { _ctx.Orders.Update(order); await _ctx.SaveChangesAsync(); }
    public async Task AddStatusHistoryAsync(OrderStatusHistory h) { _ctx.OrderStatusHistories.Add(h); await _ctx.SaveChangesAsync(); }
    public async Task<Cart?> GetCartByAccountIdAsync(Guid accountId) =>
        await _ctx.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.AccountId == accountId);
    public async Task<Cart> GetOrCreateCartAsync(Guid accountId)
    {
        var cart = await _ctx.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.AccountId == accountId);
        if (cart == null) { cart = new Cart { AccountId = accountId }; _ctx.Carts.Add(cart); await _ctx.SaveChangesAsync(); }
        return cart;
    }
    public async Task UpdateCartAsync(Cart cart) { _ctx.Carts.Update(cart); await _ctx.SaveChangesAsync(); }
    public async Task<Voucher?> GetVoucherByCodeAsync(string code) =>
        await _ctx.Vouchers.FirstOrDefaultAsync(v => v.Code == code);

    public async Task<IEnumerable<Voucher>> GetAllVouchersAsync() => await _ctx.Vouchers.ToListAsync();
    public async Task AddVoucherAsync(Voucher voucher) { _ctx.Vouchers.Add(voucher); await _ctx.SaveChangesAsync(); }
    public async Task UpdateVoucherAsync(Voucher voucher) { _ctx.Vouchers.Update(voucher); await _ctx.SaveChangesAsync(); }
    public async Task DeleteVoucherAsync(int id)
    {
        var v = await _ctx.Vouchers.FindAsync(id);
        if (v != null) { _ctx.Vouchers.Remove(v); await _ctx.SaveChangesAsync(); }
    }

    // Inventory
    public async Task AddInventoryLogAsync(InventoryLog log)
    {
        _ctx.InventoryLogs.Add(log);
        await _ctx.SaveChangesAsync();
    }

    public async Task<(int TotalCount, IEnumerable<InventoryLog> Items)> GetInventoryLogsAsync(int page, int pageSize, int? productId)
    {
        var q = _ctx.InventoryLogs.AsNoTracking().Include(l => l.Product).Include(l => l.Actor).AsQueryable();
        if (productId.HasValue) q = q.Where(l => l.ProductId == productId);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(l => l.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return (total, items);
    }
}

public class TarotRepository : ITarotRepository
{
    private readonly AppDbContext _ctx;
    public TarotRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<TarotCard>> GetAllCardsAsync() => await _ctx.TarotCards.ToListAsync();
    public async Task<TarotCard?> GetCardByIdAsync(int id) => await _ctx.TarotCards.FindAsync(id);
    public async Task<TarotReading?> GetReadingByIdAsync(Guid id) =>
        await _ctx.TarotReadings.AsNoTracking().Include(r => r.Details).ThenInclude(d => d.Card)
            .FirstOrDefaultAsync(r => r.Id == id);
    public async Task<IEnumerable<TarotReading>> GetReadingsByAccountAsync(Guid accountId, int page, int pageSize) =>
        await _ctx.TarotReadings.AsNoTracking().Include(r => r.Details).ThenInclude(d => d.Card)
            .Where(r => r.AccountId == accountId).OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
    public async Task AddReadingAsync(TarotReading reading) { _ctx.TarotReadings.Add(reading); await _ctx.SaveChangesAsync(); }
    public async Task UpdateReadingAsync(TarotReading reading) { _ctx.TarotReadings.Update(reading); await _ctx.SaveChangesAsync(); }
    public async Task<IEnumerable<TarotCreditPackage>> GetCreditPackagesAsync() =>
        await _ctx.TarotCreditPackages.OrderBy(p => p.DisplayOrder).ToListAsync();
    public async Task<TarotCreditPackage?> GetCreditPackageByIdAsync(string id) =>
        await _ctx.TarotCreditPackages.FindAsync(id);
    public async Task<CreditPackagePurchase?> GetPurchaseByIdAsync(Guid id) =>
        await _ctx.CreditPackagePurchases.FindAsync(id);
    public async Task AddPurchaseAsync(CreditPackagePurchase purchase)
    {
        _ctx.CreditPackagePurchases.Add(purchase);
        await _ctx.SaveChangesAsync();
    }
    public async Task<CreditPackagePurchase?> GetActivePackageForAccountAsync(Guid accountId) =>
        await _ctx.CreditPackagePurchases
            .Where(p => p.AccountId == accountId && p.Status == "completed" && p.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(p => p.ExpiresAt).FirstOrDefaultAsync();

    public async Task AddCardAsync(TarotCard card) { _ctx.TarotCards.Add(card); await _ctx.SaveChangesAsync(); }
    public async Task UpdateCardAsync(TarotCard card) { _ctx.TarotCards.Update(card); await _ctx.SaveChangesAsync(); }
    public async Task DeleteCardAsync(int id)
    {
        var c = await _ctx.TarotCards.FindAsync(id);
        if (c != null) { c.Status = "deleted"; await _ctx.SaveChangesAsync(); }
    }
}

public class CreditRepository : ICreditRepository
{
    private readonly AppDbContext _ctx;
    public CreditRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task AddTransactionAsync(CreditTransaction t) { _ctx.CreditTransactions.Add(t); await _ctx.SaveChangesAsync(); }
    public async Task<IEnumerable<CreditTransaction>> GetByAccountAsync(Guid accountId, int page, int pageSize) =>
        await _ctx.CreditTransactions.Where(t => t.AccountId == accountId)
            .OrderByDescending(t => t.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
    public async Task<int> GetCurrentBalanceAsync(Guid accountId) =>
        (await _ctx.CustomerProfiles.FindAsync(accountId))?.Credits ?? 0;
}

public class PetRepository : IPetRepository
{
    private readonly AppDbContext _ctx;
    public PetRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task AddLogAsync(PetGameLog log) { _ctx.PetGameLogs.Add(log); await _ctx.SaveChangesAsync(); }
    public async Task<IEnumerable<PetGameLog>> GetByAccountAsync(Guid accountId, int limit = 50) =>
        await _ctx.PetGameLogs.Where(l => l.AccountId == accountId)
            .OrderByDescending(l => l.CreatedAt).Take(limit).ToListAsync();
}

public class AuthRepository : IAuthRepository
{
    private readonly AppDbContext _ctx;
    public AuthRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task AddOtpAsync(OtpVerification otp) { _ctx.OtpVerifications.Add(otp); await _ctx.SaveChangesAsync(); }
    public async Task<OtpVerification?> GetValidOtpAsync(string email, string code, string type) =>
        await _ctx.OtpVerifications.FirstOrDefaultAsync(o =>
            o.Email == email && o.OtpCode == code && o.Type == type &&
            o.Status == "pending" && o.ExpiresAt > DateTime.UtcNow);
    public async Task MarkOtpUsedAsync(int otpId)
    {
        var otp = await _ctx.OtpVerifications.FindAsync(otpId);
        if (otp != null) { otp.Status = "used"; await _ctx.SaveChangesAsync(); }
    }
    public async Task ExpireOldOtpsAsync(string email, string type)
    {
        var otps = await _ctx.OtpVerifications
            .Where(o => o.Email == email && o.Type == type && o.Status == "pending").ToListAsync();
        otps.ForEach(o => o.Status = "expired");
        await _ctx.SaveChangesAsync();
    }
}

public class SystemSettingRepository : ISystemSettingRepository
{
    private readonly AppDbContext _ctx;
    public SystemSettingRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<string?> GetValueAsync(string key) =>
        (await _ctx.SystemSettings.FindAsync(key))?.SettingValue;
    public async Task SetValueAsync(string key, string value, Guid? updatedBy = null)
    {
        var setting = await _ctx.SystemSettings.FindAsync(key);
        if (setting == null)
        {
            _ctx.SystemSettings.Add(new SystemSetting { SettingKey = key, SettingValue = value, UpdatedBy = updatedBy, UpdatedAt = DateTime.UtcNow });
        }
        else
        {
            setting.SettingValue = value;
            setting.UpdatedBy = updatedBy;
            setting.UpdatedAt = DateTime.UtcNow;
        }
        await _ctx.SaveChangesAsync();
    }
    public async Task<IEnumerable<SystemSetting>> GetAllAsync() => await _ctx.SystemSettings.ToListAsync();
}

public class AdminRepository : IAdminRepository
{
    private readonly AppDbContext _ctx;
    private readonly NpgsqlDataSource _dataSource;

    public AdminRepository(AppDbContext ctx, NpgsqlDataSource dataSource)
    {
        _ctx = ctx;
        _dataSource = dataSource;
    }

    public async Task<AdminDashboardStats> GetDashboardStatsAsync()
    {
        await using var conn = await _dataSource.OpenConnectionAsync();
        var sql = @"
            SELECT
                (SELECT COUNT(*) FROM accounts WHERE role_id = 3) AS total_users,
                (SELECT COUNT(*) FROM orders) AS total_orders,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid') AS total_revenue,
                (SELECT COUNT(*) FROM tarot_readings) AS total_readings,
                (SELECT COUNT(*) FROM nfc_chips WHERE status = 'activated') AS active_nfc_cards,
                (SELECT COUNT(*) FROM accounts WHERE role_id = 3 AND DATE(created_at) = CURRENT_DATE) AS new_users_today,
                (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE) AS orders_today,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid' AND DATE(created_at) = CURRENT_DATE) AS revenue_today";
        return (await conn.QueryFirstAsync<AdminDashboardStats>(sql))!;
    }

    public async Task<IEnumerable<RevenueByDay>> GetRevenueChartAsync(int days)
    {
        await using var conn = await _dataSource.OpenConnectionAsync();
        var sql = @"
            SELECT DATE(created_at) AS date, COALESCE(SUM(total_amount), 0) AS revenue, COUNT(*) AS order_count
            FROM orders WHERE payment_status = 'paid' AND created_at >= CURRENT_DATE - @days * INTERVAL '1 day'
            GROUP BY DATE(created_at) ORDER BY date";
        return await conn.QueryAsync<RevenueByDay>(sql, new { days });
    }

    public async Task<IEnumerable<NfcChip>> GetNfcStatusOverviewAsync() =>
        await _ctx.NfcChips.Include(n => n.Product).Include(n => n.Account).ToListAsync();
}

public class BlogRepository : IBlogRepository
{
    private readonly AppDbContext _ctx;
    public BlogRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<BlogPost?> GetByIdAsync(int id) => await _ctx.BlogPosts.FindAsync(id);
    public async Task<BlogPost?> GetBySlugAsync(string slug) => await _ctx.BlogPosts.FirstOrDefaultAsync(b => b.Slug == slug);
    public async Task<(int TotalCount, IEnumerable<BlogPost> Items)> GetPagedAsync(int page, int pageSize, string? status = "published")
    {
        var q = _ctx.BlogPosts.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(status)) q = q.Where(b => b.Status == status);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(b => b.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return (total, items);
    }
    public async Task AddAsync(BlogPost post) { _ctx.BlogPosts.Add(post); await _ctx.SaveChangesAsync(); }
    public async Task UpdateAsync(BlogPost post) { _ctx.BlogPosts.Update(post); await _ctx.SaveChangesAsync(); }
    public async Task DeleteAsync(int id)
    {
        var b = await _ctx.BlogPosts.FindAsync(id);
        if (b != null) { _ctx.BlogPosts.Remove(b); await _ctx.SaveChangesAsync(); }
    }
}
