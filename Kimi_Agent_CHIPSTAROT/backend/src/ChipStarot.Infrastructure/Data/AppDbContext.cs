using ChipStarot.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChipStarot.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Identity
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<CustomerProfile> CustomerProfiles => Set<CustomerProfile>();
    public DbSet<AdminProfile> AdminProfiles => Set<AdminProfile>();
    public DbSet<OtpVerification> OtpVerifications => Set<OtpVerification>();

    // Products
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<NfcChip> NfcChips => Set<NfcChip>();
    public DbSet<InventoryLog> InventoryLogs => Set<InventoryLog>();

    // Sales
    public DbSet<Voucher> Vouchers => Set<Voucher>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<HeroBanner> HeroBanners => Set<HeroBanner>();

    // Subscriptions
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<UserSubscription> UserSubscriptions => Set<UserSubscription>();
    public DbSet<TarotCreditPackage> TarotCreditPackages => Set<TarotCreditPackage>();
    public DbSet<CreditPackagePurchase> CreditPackagePurchases => Set<CreditPackagePurchase>();

    // Tarot
    public DbSet<TarotCard> TarotCards => Set<TarotCard>();
    public DbSet<TarotReading> TarotReadings => Set<TarotReading>();
    public DbSet<ReadingDetail> ReadingDetails => Set<ReadingDetail>();

    // Analytics
    public DbSet<CreditTransaction> CreditTransactions => Set<CreditTransaction>();
    public DbSet<PetGameLog> PetGameLogs => Set<PetGameLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<AccessAudit> AccessAudits => Set<AccessAudit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Use snake_case naming convention for PostgreSQL
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(ToSnakeCase(entity.GetTableName()!));
            foreach (var property in entity.GetProperties())
                property.SetColumnName(ToSnakeCase(property.GetColumnName()));
            foreach (var key in entity.GetKeys())
                key.SetName(ToSnakeCase(key.GetName()!));
            foreach (var fk in entity.GetForeignKeys())
                fk.SetConstraintName(ToSnakeCase(fk.GetConstraintName()!));
            foreach (var index in entity.GetIndexes())
                index.SetDatabaseName(ToSnakeCase(index.GetDatabaseName()!));
        }

        // ── Role ──
        modelBuilder.Entity<Role>(e =>
        {
            e.ToTable("roles");
            e.HasIndex(r => r.Key).IsUnique();
        });

        // ── Permission & RolePermission ──
        modelBuilder.Entity<Permission>(e =>
        {
            e.ToTable("permissions");
            e.HasIndex(p => p.Key).IsUnique();
        });

        modelBuilder.Entity<RolePermission>(e =>
        {
            e.ToTable("role_permissions");
            e.HasKey(rp => new { rp.RoleId, rp.PermissionId });
            e.HasOne(rp => rp.Role).WithMany(r => r.RolePermissions).HasForeignKey(rp => rp.RoleId);
            e.HasOne(rp => rp.Permission).WithMany(p => p.RolePermissions).HasForeignKey(rp => rp.PermissionId);
        });

        // ── Account ──
        modelBuilder.Entity<Account>(e =>
        {
            e.ToTable("accounts");
            e.HasIndex(a => a.Email).IsUnique();
            e.HasOne(a => a.Role).WithMany().HasForeignKey(a => a.RoleId);
            e.HasOne(a => a.CustomerProfile).WithOne(p => p.Account).HasForeignKey<CustomerProfile>(p => p.AccountId);
            e.HasOne(a => a.AdminProfile).WithOne(p => p.Account).HasForeignKey<AdminProfile>(p => p.AccountId);
        });

        // ── CustomerProfile ──
        modelBuilder.Entity<CustomerProfile>(e =>
        {
            e.ToTable("customer_profiles");
            e.HasKey(p => p.AccountId);
            e.Property(p => p.PetClaimedLevels).HasColumnType("jsonb");
        });

        // ── AdminProfile ──
        modelBuilder.Entity<AdminProfile>(e =>
        {
            e.ToTable("admin_profiles");
            e.HasKey(p => p.AccountId);
        });

        // ── OtpVerification ──
        modelBuilder.Entity<OtpVerification>().ToTable("otp_verifications");

        // ── Products ──
        modelBuilder.Entity<ProductCategory>().ToTable("product_categories");
        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("products");
            e.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId);
        });
        modelBuilder.Entity<ProductReview>(e =>
        {
            e.ToTable("product_reviews");
            e.HasOne(r => r.Product).WithMany(p => p.Reviews).HasForeignKey(r => r.ProductId);
            e.HasOne(r => r.Account).WithMany().HasForeignKey(r => r.AccountId);
        });

        // ── Inventory ──
        modelBuilder.Entity<InventoryLog>(e =>
        {
            e.ToTable("inventory_logs");
            e.HasOne(l => l.Product).WithMany().HasForeignKey(l => l.ProductId);
            e.HasOne(l => l.Actor).WithMany().HasForeignKey(l => l.ActorId);
        });

        // ── NFC ──
        modelBuilder.Entity<NfcChip>(e =>
        {
            e.ToTable("nfc_chips");
            e.HasKey(n => n.NfcTagId);
            e.HasOne(n => n.Product).WithMany(p => p.NfcChips).HasForeignKey(n => n.ProductId);
            e.HasOne(n => n.Account).WithMany().HasForeignKey(n => n.AccountId);
        });

        // ── Cart & Order ──
        modelBuilder.Entity<Cart>(e =>
        {
            e.ToTable("carts");
            e.HasOne(c => c.Account).WithMany().HasForeignKey(c => c.AccountId);
        });
        modelBuilder.Entity<CartItem>(e =>
        {
            e.ToTable("cart_items");
            e.HasKey(ci => new { ci.CartId, ci.ProductId });
            e.HasOne(ci => ci.Cart).WithMany(c => c.Items).HasForeignKey(ci => ci.CartId);
            e.HasOne(ci => ci.Product).WithMany().HasForeignKey(ci => ci.ProductId);
        });
        modelBuilder.Entity<Order>(e =>
        {
            e.ToTable("orders");
            e.HasOne(o => o.Account).WithMany().HasForeignKey(o => o.AccountId);
            e.HasOne(o => o.Voucher).WithMany().HasForeignKey(o => o.VoucherId);
        });
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.ToTable("order_items");
            e.HasKey(oi => new { oi.OrderId, oi.ProductId });
            e.HasOne(oi => oi.Order).WithMany(o => o.Items).HasForeignKey(oi => oi.OrderId);
            e.HasOne(oi => oi.Product).WithMany().HasForeignKey(oi => oi.ProductId);
        });
        modelBuilder.Entity<OrderStatusHistory>(e =>
        {
            e.ToTable("order_status_history");
            e.HasOne(h => h.Order).WithMany(o => o.StatusHistory).HasForeignKey(h => h.OrderId);
        });
        modelBuilder.Entity<Payment>().ToTable("payments");
        modelBuilder.Entity<Voucher>().ToTable("vouchers");
        modelBuilder.Entity<HeroBanner>().ToTable("hero_banners");

        // ── Subscriptions ──
        modelBuilder.Entity<SubscriptionPlan>().ToTable("subscription_plans");
        modelBuilder.Entity<UserSubscription>(e =>
        {
            e.ToTable("user_subscriptions");
            e.HasOne(us => us.Account).WithMany().HasForeignKey(us => us.AccountId);
            e.HasOne(us => us.Plan).WithMany().HasForeignKey(us => us.PlanId);
        });
        modelBuilder.Entity<TarotCreditPackage>().ToTable("tarot_credit_packages");
        modelBuilder.Entity<CreditPackagePurchase>(e =>
        {
            e.ToTable("credit_package_purchases");
            e.HasOne(p => p.Account).WithMany().HasForeignKey(p => p.AccountId);
            e.HasOne(p => p.Package).WithMany().HasForeignKey(p => p.PackageId);
        });

        // ── Tarot ──
        modelBuilder.Entity<TarotCard>().ToTable("tarot_cards");
        modelBuilder.Entity<TarotReading>(e =>
        {
            e.ToTable("tarot_readings");
            e.HasOne(r => r.Account).WithMany().HasForeignKey(r => r.AccountId);
        });
        modelBuilder.Entity<ReadingDetail>(e =>
        {
            e.ToTable("reading_details");
            e.HasKey(rd => new { rd.ReadingId, rd.PositionOrder });
            e.HasOne(rd => rd.Reading).WithMany(r => r.Details).HasForeignKey(rd => rd.ReadingId);
            e.HasOne(rd => rd.Card).WithMany().HasForeignKey(rd => rd.CardId);
        });

        // ── Analytics ──
        modelBuilder.Entity<CreditTransaction>(e =>
        {
            e.ToTable("credit_transactions");
            e.HasOne(ct => ct.Account).WithMany().HasForeignKey(ct => ct.AccountId);
        });
        modelBuilder.Entity<PetGameLog>(e =>
        {
            e.ToTable("pet_game_logs");
            e.HasOne(l => l.Account).WithMany().HasForeignKey(l => l.AccountId);
        });
        modelBuilder.Entity<Notification>(e =>
        {
            e.ToTable("notifications");
            e.HasOne(n => n.Account).WithMany().HasForeignKey(n => n.AccountId);
        });
        modelBuilder.Entity<BlogPost>(e =>
        {
            e.ToTable("blog_posts");
            e.HasIndex(b => b.Slug).IsUnique();
            e.HasOne(b => b.Admin).WithMany().HasForeignKey(b => b.AdminId);
        });
        modelBuilder.Entity<SystemSetting>(e =>
        {
            e.ToTable("system_settings");
            e.HasKey(s => s.SettingKey);
        });

        modelBuilder.Entity<AccessAudit>(e =>
        {
            e.ToTable("access_audit");
            e.HasOne(a => a.Actor).WithMany().HasForeignKey(a => a.ActorId);
        });

        // Seed data
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Key = "super_admin", Name = "Super Admin", Description = "Quản trị viên tối cao - bypass mọi kiểm tra quyền", IsSystem = true },
            new Role { Id = 2, Key = "admin", Name = "Admin", Description = "Quản trị viên hệ thống - có toàn quyền quản lý", IsSystem = true },
            new Role { Id = 3, Key = "customer", Name = "Customer", Description = "Khách hàng sử dụng dịch vụ Tarot", IsSystem = true },
            new Role { Id = 4, Key = "staff", Name = "Nhân viên kho", Description = "Nhân viên xử lý đơn hàng và quản lý sản phẩm", IsSystem = true },
            new Role { Id = 5, Key = "editor", Name = "Biên tập viên", Description = "Biên tập viên quản lý bài viết và nội dung Tarot", IsSystem = true });

        modelBuilder.Entity<Permission>().HasData(
            new Permission { Id = 1, Key = "dashboard.view", Resource = "dashboard", Action = "view", DisplayName = "Xem thống kê tổng quan" },
            new Permission { Id = 2, Key = "users.view", Resource = "users", Action = "view", DisplayName = "Xem DS người dùng" },
            new Permission { Id = 3, Key = "users.manage", Resource = "users", Action = "manage", DisplayName = "Quản lý người dùng" },
            new Permission { Id = 4, Key = "cards.view", Resource = "cards", Action = "view", DisplayName = "Xem DS lá bài" },
            new Permission { Id = 5, Key = "cards.manage", Resource = "cards", Action = "manage", DisplayName = "Quản lý lá bài" },
            new Permission { Id = 6, Key = "products.view", Resource = "products", Action = "view", DisplayName = "Xem DS sản phẩm" },
            new Permission { Id = 7, Key = "products.manage", Resource = "products", Action = "manage", DisplayName = "Quản lý sản phẩm" },
            new Permission { Id = 8, Key = "packages.view", Resource = "packages", Action = "view", DisplayName = "Xem DS gói Tarot" },
            new Permission { Id = 9, Key = "packages.manage", Resource = "packages", Action = "manage", DisplayName = "Quản lý gói Tarot" },
            new Permission { Id = 10, Key = "orders.view", Resource = "orders", Action = "view", DisplayName = "Xem DS đơn hàng" },
            new Permission { Id = 11, Key = "orders.manage", Resource = "orders", Action = "manage", DisplayName = "Quản lý đơn hàng" },
            new Permission { Id = 12, Key = "nfc.view", Resource = "nfc", Action = "view", DisplayName = "Xem DS thẻ NFC" },
            new Permission { Id = 13, Key = "nfc.manage", Resource = "nfc", Action = "manage", DisplayName = "Quản lý thẻ NFC" },
            new Permission { Id = 14, Key = "content.view", Resource = "content", Action = "view", DisplayName = "Xem DS bài viết" },
            new Permission { Id = 15, Key = "content.manage", Resource = "content", Action = "manage", DisplayName = "Quản lý bài viết" },
            new Permission { Id = 16, Key = "reports.view", Resource = "reports", Action = "view", DisplayName = "Xem báo cáo hệ thống" },
            new Permission { Id = 17, Key = "settings.manage", Resource = "settings", Action = "manage", DisplayName = "Quản lý cấu hình" },
            new Permission { Id = 18, Key = "rbac.manage", Resource = "rbac", Action = "manage", DisplayName = "Quản lý phân quyền" },
            new Permission { Id = 19, Key = "vouchers.view", Resource = "vouchers", Action = "view", DisplayName = "Xem danh sách Voucher" },
            new Permission { Id = 20, Key = "vouchers.manage", Resource = "vouchers", Action = "manage", DisplayName = "Quản lý Voucher" }
        );

        var adminRolePermissions = new List<RolePermission>();
        for (int i = 1; i <= 20; i++) // Admin has all 20 permissions initially
        {
            adminRolePermissions.Add(new RolePermission { RoleId = 2, PermissionId = i });
        }
        
        // Super Admin gets everything
        var superAdminPermissions = new List<RolePermission>();
        for (int i = 1; i <= 20; i++) 
        {
            superAdminPermissions.Add(new RolePermission { RoleId = 1, PermissionId = i });
        }

        // Staff (Role 4) gets only product and order permissions
        var staffPermissions = new List<RolePermission>
        {
            new RolePermission { RoleId = 4, PermissionId = 6 },
            new RolePermission { RoleId = 4, PermissionId = 7 },
            new RolePermission { RoleId = 4, PermissionId = 10 },
            new RolePermission { RoleId = 4, PermissionId = 11 }
        };

        // Editor (Role 5) gets content and card permissions
        var editorPermissions = new List<RolePermission>
        {
            new RolePermission { RoleId = 5, PermissionId = 4 },
            new RolePermission { RoleId = 5, PermissionId = 5 },
            new RolePermission { RoleId = 5, PermissionId = 14 },
            new RolePermission { RoleId = 5, PermissionId = 15 }
        };

        modelBuilder.Entity<RolePermission>().HasData(
            adminRolePermissions
            .Concat(superAdminPermissions)
            .Concat(staffPermissions)
            .Concat(editorPermissions)
            .ToArray());

        modelBuilder.Entity<TarotCreditPackage>().HasData(
            new TarotCreditPackage { Id = "cp_starter", Name = "Gói Khởi Đầu", CreditsPerDay = 3, Price = 29000, OldPrice = 39000, ExpiryDays = 30, Icon = "🌙", Description = "3 lượt/ngày trong 30 ngày", DisplayOrder = 1 },
            new TarotCreditPackage { Id = "cp_popular", Name = "Gói Phổ Biến", CreditsPerDay = 5, Price = 69000, OldPrice = 99000, ExpiryDays = 90, Icon = "🔮", Description = "5 lượt/ngày trong 90 ngày", DisplayOrder = 2 },
            new TarotCreditPackage { Id = "cp_premium", Name = "Gói Cao Cấp", CreditsPerDay = 10, Price = 179000, OldPrice = 290000, ExpiryDays = 365, Icon = "✨", Description = "10 lượt/ngày trong 365 ngày", DisplayOrder = 3 });

        modelBuilder.Entity<Voucher>().HasData(
            new Voucher { Id = 1, Code = "CHIPSTAROT2024", DiscountPercent = 10, UsageLimit = 100, StartDate = DateTime.UtcNow },
            new Voucher { Id = 2, Code = "HELLOSUMMER", DiscountPercent = 20, UsageLimit = 50, StartDate = DateTime.UtcNow }
        );
    }

    private static string ToSnakeCase(string name)
    {
        if (string.IsNullOrEmpty(name)) return name;
        var result = System.Text.RegularExpressions.Regex.Replace(name, "([A-Z])", "_$1").TrimStart('_').ToLower();
        return result;
    }
}
