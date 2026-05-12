using ChipStarot.Domain.Interfaces;
using ChipStarot.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ChipStarot.Infrastructure.BackgroundJobs;

/// <summary>
/// Hosted Service chạy lúc 00:00:00 mỗi ngày.
/// Reset/cộng lại số lượt bốc bài cho tất cả user có gói đang active.
/// </summary>
public class DailyCreditsResetJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DailyCreditsResetJob> _logger;

    public DailyCreditsResetJob(IServiceScopeFactory scopeFactory, ILogger<DailyCreditsResetJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DailyCreditsResetJob started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            // Tính thời gian đến 00:00:00 ngày mai (UTC+7)
            var now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow,
                TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));
            var nextMidnight = now.Date.AddDays(1);
            var delay = nextMidnight - now;

            _logger.LogInformation("Next daily credit reset in {delay}.", delay);
            await Task.Delay(delay, stoppingToken);

            if (stoppingToken.IsCancellationRequested) break;

            await RunDailyResetAsync();
        }
    }

    private async Task RunDailyResetAsync()
    {
        _logger.LogInformation("Running daily credit reset at {time}.", DateTime.UtcNow);

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var creditRepo = scope.ServiceProvider.GetRequiredService<ICreditRepository>();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        int resetCount = 0;

        try
        {
            // Lấy tất cả profiles có gói đang còn hạn
            var profiles = await db.CustomerProfiles
                .Where(p => p.DailyAllowance > 0
                    && p.CreditsExpiresAt != null
                    && p.CreditsExpiresAt > DateTime.UtcNow
                    && (p.LastResetDate == null || p.LastResetDate < today))
                .ToListAsync();

            foreach (var profile in profiles)
            {
                var oldCredits = profile.Credits;
                profile.Credits += profile.DailyAllowance;
                
                // Tặng thêm thức ăn hàng ngày nếu đã có thú cưng
                if (profile.PetStatus != "egg")
                {
                    profile.PetFood += 5; // Mặc định 5 thức ăn mỗi ngày
                }

                profile.LastResetDate = today;
                profile.UpdatedAt = DateTime.UtcNow;

                // Ghi log
                await creditRepo.AddTransactionAsync(new Domain.Entities.CreditTransaction
                {
                    AccountId = profile.AccountId,
                    Amount = profile.DailyAllowance,
                    BalanceAfter = profile.Credits,
                    Type = "daily_reset",
                    Note = $"Cộng lượt hàng ngày ({profile.DailyAllowance} lượt) + 5 Thức ăn"
                });

                resetCount++;
            }

            await db.SaveChangesAsync();
            _logger.LogInformation("Daily reset done: {count} accounts updated.", resetCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during daily credit reset.");
        }
    }
}

/// <summary>
/// Dọn dẹp OTP hết hạn mỗi giờ.
/// </summary>
public class OtpCleanupJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OtpCleanupJob> _logger;

    public OtpCleanupJob(IServiceScopeFactory scopeFactory, ILogger<OtpCleanupJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            if (stoppingToken.IsCancellationRequested) break;

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var expired = await db.OtpVerifications
                .Where(o => o.ExpiresAt < DateTime.UtcNow && o.Status == "pending")
                .ToListAsync(stoppingToken);

            expired.ForEach(o => o.Status = "expired");
            await db.SaveChangesAsync(stoppingToken);

            _logger.LogInformation("OTP cleanup: marked {count} expired OTPs.", expired.Count);
        }
    }
}
