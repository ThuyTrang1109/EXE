using ChipStarot.Application.DTOs.Tarot;
using ChipStarot.Domain.Common;
using ChipStarot.Domain.Entities;
using ChipStarot.Domain.Interfaces;

namespace ChipStarot.Application.Services;

public interface ITarotService
{
    Task<Result<IEnumerable<TarotCardDto>>> GetAllCardsAsync();
    Task<Result<TarotReadingDto>> StartReadingAsync(StartReadingRequest request, Guid accountId);
    Task<Result<TarotReadingDto>> GetReadingByIdAsync(Guid id, Guid accountId);
    Task<Result<PagedResult<TarotReadingDto>>> GetMyReadingsAsync(Guid accountId, int page, int pageSize);
    Task<Result> RateReadingAsync(RateReadingRequest request, Guid accountId);
    Task<Result> ToggleSaveReadingAsync(SaveReadingRequest request, Guid accountId);
    Task<Result<IEnumerable<CreditPackageDto>>> GetCreditPackagesAsync();
    Task<Result> PurchaseCreditPackageAsync(PurchaseCreditPackageRequest request, Guid accountId);
    
    // Admin CRUD
    Task<Result> CreateCardAsync(CreateTarotCardRequest request);
    Task<Result> UpdateCardAsync(int id, UpdateTarotCardRequest request);
    Task<Result> DeleteCardAsync(int id);
}

public class TarotService : ITarotService
{
    private readonly ITarotRepository _tarotRepo;
    private readonly IAccountRepository _accountRepo;
    private readonly ICreditRepository _creditRepo;
    private readonly IPetRepository _petRepo;
    private readonly ISystemSettingRepository _settingRepo;
    private readonly IGeminiService _geminiService;

    public TarotService(ITarotRepository tarotRepo, IAccountRepository accountRepo,
        ICreditRepository creditRepo, IPetRepository petRepo,
        ISystemSettingRepository settingRepo, IGeminiService geminiService)
    {
        _tarotRepo = tarotRepo;
        _accountRepo = accountRepo;
        _creditRepo = creditRepo;
        _petRepo = petRepo;
        _settingRepo = settingRepo;
        _geminiService = geminiService;
    }

    public async Task<Result<IEnumerable<TarotCardDto>>> GetAllCardsAsync()
    {
        var cards = await _tarotRepo.GetAllCardsAsync();
        return Result<IEnumerable<TarotCardDto>>.Success(cards.Select(MapCard));
    }

    public async Task<Result<TarotReadingDto>> StartReadingAsync(StartReadingRequest request, Guid accountId)
    {
        // 1. Kiểm tra credit
        var profile = await _accountRepo.GetCustomerProfileAsync(accountId);
        if (profile == null) return Result<TarotReadingDto>.Failure("Hồ sơ không tồn tại.", 404);
        if (profile.Credits <= 0)
            return Result<TarotReadingDto>.Failure("Bạn không đủ lượt bốc bài. Hãy mua thêm gói lượt.", 402);

        int cardCount = request.CardCount is 1 or 3 ? request.CardCount : 1;

        // 2. Chọn lá bài
        var allCards = (await _tarotRepo.GetAllCardsAsync()).Where(c => c.Status == "active").ToList();
        List<TarotCard> drawnCards;
        List<ReadingDetail> details;

        if (request.SelectedCards != null && request.SelectedCards.Any())
        {
            var selectedIds = request.SelectedCards.Select(s => s.CardId).Take(cardCount).ToList();
            drawnCards = allCards.Where(c => selectedIds.Contains(c.Id))
                                .OrderBy(c => selectedIds.IndexOf(c.Id)) // Maintain order
                                .ToList();
            
            // Fallback nếu ID không tồn tại
            if (drawnCards.Count < cardCount)
            {
                var extra = allCards.Except(drawnCards).Take(cardCount - drawnCards.Count);
                drawnCards.AddRange(extra);
            }

            details = drawnCards.Select((c, i) => {
                var input = request.SelectedCards.FirstOrDefault(s => s.CardId == c.Id);
                return new ReadingDetail
                {
                    CardId = c.Id,
                    PositionOrder = i + 1,
                    IsReversed = input?.IsReversed ?? false
                };
            }).ToList();
        }
        else
        {
            if (allCards.Count < cardCount)
                return Result<TarotReadingDto>.Failure("Không đủ lá bài trong hệ thống.");

            drawnCards = allCards.OrderBy(_ => Random.Shared.Next()).Take(cardCount).ToList();
            details = drawnCards.Select((c, i) => new ReadingDetail
            {
                CardId = c.Id,
                PositionOrder = i + 1,
                IsReversed = Random.Shared.Next(2) == 1
            }).ToList();
        }

        // 3. Trừ credit
        profile.Credits -= 1;
        await _accountRepo.UpdateCustomerProfileAsync(profile);
        await _creditRepo.AddTransactionAsync(new CreditTransaction
        {
            AccountId = accountId,
            Amount = -1,
            BalanceAfter = profile.Credits,
            Type = "tarot_reading",
            Note = $"Bốc {cardCount} lá - Chủ đề: {request.Topic}"
        });

        // 4. Tạo reading record
        var reading = new TarotReading
        {
            AccountId = accountId,
            NfcTagId = request.NfcTagId,
            Topic = request.Topic,
            TopicSubAnswer = request.TopicSubAnswer,
            UserQuestion = request.UserQuestion,
            MoodInput = request.MoodInput,
            CardCount = cardCount,
            Details = details
        };

        // 5. Gọi Gemini AI
        string? aiStory = null;
        try
        {
            var cardNames = drawnCards.Select((c, i) =>
                $"Vị trí {i + 1}: {c.Name}{(details[i].IsReversed ? " (Ngược)" : " (Xuôi)")}").ToList();
            aiStory = await _geminiService.GenerateTarotReadingAsync(
                request.Topic, request.UserQuestion, request.MoodInput, cardNames);
            reading.AiModelUsed = "gemini-2.0-flash-lite";
            reading.AiResponseStory = aiStory;
        }
        catch
        {
            // Rollback credit nếu AI lỗi
            profile.Credits += 1;
            await _accountRepo.UpdateCustomerProfileAsync(profile);
            await _creditRepo.AddTransactionAsync(new CreditTransaction
            {
                AccountId = accountId,
                Amount = 1,
                BalanceAfter = profile.Credits,
                Type = "rollback",
                Note = "Hoàn lại credit do AI lỗi"
            });
            return Result<TarotReadingDto>.Failure("Hệ thống AI tạm thời gặp sự cố. Credit đã được hoàn lại.", 503);
        }

        await _tarotRepo.AddReadingAsync(reading);

        // 6. Cộng EXP thú cưng
        var expGain = 20;
        profile.PetExp += expGain;
        await _accountRepo.UpdateCustomerProfileAsync(profile);
        await _petRepo.AddLogAsync(new PetGameLog
        {
            AccountId = accountId,
            ActionType = "gain_exp_from_reading",
            Amount = expGain,
            CurrentExp = profile.PetExp,
            CurrentFood = profile.PetFood,
            ReferenceId = reading.Id.ToString()
        });

        return Result<TarotReadingDto>.Success(MapReading(reading, drawnCards, details));
    }

    public async Task<Result<TarotReadingDto>> GetReadingByIdAsync(Guid id, Guid accountId)
    {
        var reading = await _tarotRepo.GetReadingByIdAsync(id);
        if (reading == null) return Result<TarotReadingDto>.Failure("Không tìm thấy phiên bốc bài.", 404);
        if (reading.AccountId != accountId) return Result<TarotReadingDto>.Failure("Không có quyền truy cập.", 403);

        var cards = reading.Details.Select(d => d.Card!).ToList();
        return Result<TarotReadingDto>.Success(MapReading(reading, cards, reading.Details.ToList()));
    }

    public async Task<Result<PagedResult<TarotReadingDto>>> GetMyReadingsAsync(Guid accountId, int page, int pageSize)
    {
        var readings = (await _tarotRepo.GetReadingsByAccountAsync(accountId, page, pageSize)).ToList();
        var total = readings.Count;
        var items = readings.Select(r => MapReading(r, r.Details.Select(d => d.Card!).ToList(), r.Details.ToList()));
        return Result<PagedResult<TarotReadingDto>>.Success(new PagedResult<TarotReadingDto>
        {
            Items = items, TotalCount = total, Page = page, PageSize = pageSize
        });
    }

    public async Task<Result> RateReadingAsync(RateReadingRequest request, Guid accountId)
    {
        var reading = await _tarotRepo.GetReadingByIdAsync(request.ReadingId);
        if (reading == null || reading.AccountId != accountId)
            return Result.Failure("Không tìm thấy phiên bốc bài.", 404);
        reading.UserRating = request.Rating;
        await _tarotRepo.UpdateReadingAsync(reading);
        return Result.Success();
    }

    public async Task<Result> ToggleSaveReadingAsync(SaveReadingRequest request, Guid accountId)
    {
        var reading = await _tarotRepo.GetReadingByIdAsync(request.ReadingId);
        if (reading == null || reading.AccountId != accountId)
            return Result.Failure("Không tìm thấy phiên bốc bài.", 404);
        reading.IsSaved = request.IsSaved;
        await _tarotRepo.UpdateReadingAsync(reading);
        return Result.Success();
    }

    public async Task<Result<IEnumerable<CreditPackageDto>>> GetCreditPackagesAsync()
    {
        var packages = await _tarotRepo.GetCreditPackagesAsync();
        return Result<IEnumerable<CreditPackageDto>>.Success(packages.Where(p => p.IsActive).Select(p =>
            new CreditPackageDto(p.Id, p.Name, p.CreditsPerDay, p.Price, p.OldPrice,
                p.ExpiryDays, p.Icon, p.Description, p.IsActive, p.DisplayOrder)));
    }

    public async Task<Result> PurchaseCreditPackageAsync(PurchaseCreditPackageRequest request, Guid accountId)
    {
        var package = await _tarotRepo.GetCreditPackageByIdAsync(request.PackageId);
        if (package == null || !package.IsActive)
            return Result.Failure("Gói lượt không tồn tại.", 404);

        var profile = await _accountRepo.GetCustomerProfileAsync(accountId);
        if (profile == null) return Result.Failure("Hồ sơ không tồn tại.", 404);

        var expiresAt = DateTime.UtcNow.AddDays(package.ExpiryDays);
        var purchase = new CreditPackagePurchase
        {
            AccountId = accountId,
            PackageId = package.Id,
            CreditsPerDayGranted = package.CreditsPerDay,
            ExpiresAt = expiresAt,
            AmountPaid = package.Price,
            PaymentMethod = request.PaymentMethod,
            Status = "completed"
        };
        await _tarotRepo.AddPurchaseAsync(purchase);

        // Áp dụng gói ngay lập tức
        profile.DailyAllowance = Math.Max(profile.DailyAllowance, package.CreditsPerDay);
        profile.Credits += package.CreditsPerDay;
        if (profile.CreditsExpiresAt == null || profile.CreditsExpiresAt < expiresAt)
            profile.CreditsExpiresAt = expiresAt;
        await _accountRepo.UpdateCustomerProfileAsync(profile);

        await _creditRepo.AddTransactionAsync(new CreditTransaction
        {
            AccountId = accountId,
            Amount = package.CreditsPerDay,
            BalanceAfter = profile.Credits,
            Type = "subscription",
            ReferenceId = purchase.Id.ToString(),
            Note = $"Mua gói {package.Name}"
        });

        return Result.Success();
    }

    public async Task<Result> CreateCardAsync(CreateTarotCardRequest request)
    {
        var card = new TarotCard
        {
            Name = request.Name,
            Suit = request.Suit,
            ArcanaType = request.ArcanaType,
            Element = request.Element,
            MeaningGeneral = request.MeaningGeneral,
            MeaningUpright = request.MeaningUpright,
            MeaningReversed = request.MeaningReversed,
            ImageUrl = request.ImageUrl,
            Status = "active"
        };
        await _tarotRepo.AddCardAsync(card);
        return Result.Success(201);
    }

    public async Task<Result> UpdateCardAsync(int id, UpdateTarotCardRequest request)
    {
        var card = await _tarotRepo.GetCardByIdAsync(id);
        if (card == null) return Result.Failure("Không tìm thấy lá bài.", 404);

        if (request.Name != null) card.Name = request.Name;
        if (request.Suit != null) card.Suit = request.Suit;
        if (request.ArcanaType != null) card.ArcanaType = request.ArcanaType;
        if (request.Element != null) card.Element = request.Element;
        if (request.MeaningGeneral != null) card.MeaningGeneral = request.MeaningGeneral;
        if (request.MeaningUpright != null) card.MeaningUpright = request.MeaningUpright;
        if (request.MeaningReversed != null) card.MeaningReversed = request.MeaningReversed;
        if (request.ImageUrl != null) card.ImageUrl = request.ImageUrl;
        if (request.Status != null) card.Status = request.Status;

        await _tarotRepo.UpdateCardAsync(card);
        return Result.Success();
    }

    public async Task<Result> DeleteCardAsync(int id)
    {
        await _tarotRepo.DeleteCardAsync(id);
        return Result.Success();
    }

    private static TarotCardDto MapCard(TarotCard c) =>
        new(c.Id, c.Name, c.Suit, c.ArcanaType, c.Element,
            c.MeaningGeneral, c.MeaningUpright, c.MeaningReversed, c.ImageUrl);

    private static TarotReadingDto MapReading(TarotReading r, List<TarotCard> cards, List<ReadingDetail> details) =>
        new(r.Id, r.Topic, r.UserQuestion, r.MoodInput, r.CardCount, r.AiResponseStory,
            r.UserRating, r.IsSaved, r.CreatedAt,
            details.Select((d, i) => new DrawnCardDto(
                cards[i].Id, cards[i].Name, cards[i].ImageUrl,
                d.PositionOrder, d.IsReversed,
                d.IsReversed ? cards[i].MeaningReversed : cards[i].MeaningUpright)));
}
