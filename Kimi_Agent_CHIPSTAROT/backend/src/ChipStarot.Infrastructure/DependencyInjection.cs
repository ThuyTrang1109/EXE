using ChipStarot.Application.Services;
using ChipStarot.Domain.Interfaces;
using ChipStarot.Infrastructure.BackgroundJobs;
using ChipStarot.Infrastructure.Data;
using ChipStarot.Infrastructure.Repositories;
using ChipStarot.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace ChipStarot.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── Database ──
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString,
                npgsql => npgsql.MigrationsAssembly("ChipStarot.Infrastructure")));

        // Dapper data source
        var dataSource = new NpgsqlDataSourceBuilder(connectionString).Build();
        services.AddSingleton(dataSource);

        // ── Repositories ──
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<INfcRepository, NfcRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<ITarotRepository, TarotRepository>();
        services.AddScoped<ICreditRepository, CreditRepository>();
        services.AddScoped<IPetRepository, PetRepository>();
        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<ISystemSettingRepository, SystemSettingRepository>();
        services.AddScoped<IAdminRepository, AdminRepository>();
        services.AddScoped<IBlogRepository, BlogRepository>();

        // ── Infrastructure Services ──
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IGeminiService, GeminiService>();
        services.AddScoped<IVnPayService, VnPayService>();

        // ── Application Services ──
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<INfcService, NfcService>();
        services.AddScoped<ITarotService, TarotService>();
        services.AddScoped<IOrderService, OrderService>();

        // ── HTTP Client for Gemini ──
        services.AddHttpClient("Gemini", client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        // ── Caching ──
        services.AddMemoryCache();

        // ── Background Jobs ──
        services.AddHostedService<DailyCreditsResetJob>();
        services.AddHostedService<OtpCleanupJob>();

        return services;
    }

    public static async Task RunMigrationsAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // await db.Database.MigrateAsync();
        await db.Database.EnsureCreatedAsync();
    }
}
