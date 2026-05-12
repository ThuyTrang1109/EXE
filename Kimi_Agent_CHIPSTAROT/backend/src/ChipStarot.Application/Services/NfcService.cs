using ChipStarot.Application.DTOs.Nfc;
using ChipStarot.Domain.Common;
using ChipStarot.Domain.Entities;
using ChipStarot.Domain.Interfaces;

namespace ChipStarot.Application.Services;

public interface INfcService
{
    Task<Result<NfcActivationResult>> ScanAsync(ScanNfcRequest request);
    Task<Result<NfcChipDto>> GenerateChipAsync(GenerateNfcRequest request, Guid adminId);
    Task<Result<IEnumerable<NfcChipDto>>> GetAllChipsAsync();
    Task<Result<IEnumerable<NfcChipDto>>> GetChipsByAccountAsync(Guid accountId);
}

public class NfcService : INfcService
{
    private readonly INfcRepository _nfcRepo;
    private readonly IAccountRepository _accountRepo;
    private readonly IProductRepository _productRepo;
    private readonly ICreditRepository _creditRepo;
    private readonly IPetRepository _petRepo;

    public NfcService(INfcRepository nfcRepo, IAccountRepository accountRepo,
        IProductRepository productRepo, ICreditRepository creditRepo, IPetRepository petRepo)
    {
        _nfcRepo = nfcRepo;
        _accountRepo = accountRepo;
        _productRepo = productRepo;
        _creditRepo = creditRepo;
        _petRepo = petRepo;
    }

    public async Task<Result<NfcActivationResult>> ScanAsync(ScanNfcRequest request)
    {
        var chip = await _nfcRepo.GetByTagIdAsync(request.NfcTagId);
        if (chip == null)
            return Result<NfcActivationResult>.Failure("Thẻ NFC không tồn tại hoặc chưa được đăng ký.", 404);

        var account = await _accountRepo.GetByIdAsync(request.AccountId);
        if (account == null)
            return Result<NfcActivationResult>.Failure("Tài khoản không tồn tại.", 404);

        chip.ScanCount++;
        chip.LastScannedAt = DateTime.UtcNow;

        if (chip.Status == "unactivated")
        {
            var product = await _productRepo.GetByIdAsync(chip.ProductId ?? 0);
            var creditsToGrant = product?.NfcCreditsBonus ?? 10;

            chip.AccountId = request.AccountId;
            chip.Status = "activated";
            chip.CreditsGranted = creditsToGrant;
            chip.ActivatedAt = DateTime.UtcNow;
            await _nfcRepo.UpdateAsync(chip);

            var profile = await _accountRepo.GetCustomerProfileAsync(request.AccountId);
            if (profile != null)
            {
                profile.Credits += creditsToGrant;
                profile.DailyAllowance = Math.Max(profile.DailyAllowance, 3);
                profile.CreditsExpiresAt = DateTime.UtcNow.AddMonths(6);
                await _accountRepo.UpdateCustomerProfileAsync(profile);

                await _creditRepo.AddTransactionAsync(new CreditTransaction
                {
                    AccountId = request.AccountId,
                    Amount = creditsToGrant,
                    BalanceAfter = profile.Credits,
                    Type = "nfc_activation",
                    ReferenceId = chip.NfcTagId,
                    Note = $"Kích hoạt thẻ NFC {chip.NfcTagId}"
                });

                profile.PetExp += 50;
                await _accountRepo.UpdateCustomerProfileAsync(profile);
                await _petRepo.AddLogAsync(new PetGameLog
                {
                    AccountId = request.AccountId,
                    ActionType = "nfc_activation",
                    Amount = 50,
                    CurrentExp = profile.PetExp,
                    CurrentFood = profile.PetFood,
                    ReferenceId = chip.NfcTagId
                });
            }

            return Result<NfcActivationResult>.Success(new NfcActivationResult(
                true, $"Kích hoạt thành công! Nhận được {creditsToGrant} lượt bốc bài.",
                creditsToGrant, chip.NfcTagId, "activated"));
        }

        if (chip.Status == "activated" && chip.AccountId == request.AccountId)
        {
            await _nfcRepo.UpdateAsync(chip);
            return Result<NfcActivationResult>.Success(new NfcActivationResult(
                true, "Đã quét thẻ. Lượt sẽ được cộng lúc 00:00 mỗi ngày.",
                0, chip.NfcTagId, "activated"));
        }

        await _nfcRepo.UpdateAsync(chip);
        return Result<NfcActivationResult>.Failure("Thẻ đã được kích hoạt bởi tài khoản khác.", 409);
    }

    public async Task<Result<NfcChipDto>> GenerateChipAsync(GenerateNfcRequest request, Guid adminId)
    {
        if (await _nfcRepo.ExistsAsync(request.NfcTagId))
            return Result<NfcChipDto>.Failure("NFC Tag ID đã tồn tại.");

        var product = await _productRepo.GetByIdAsync(request.ProductId);
        if (product == null)
            return Result<NfcChipDto>.Failure("Sản phẩm không tồn tại.", 404);

        var chip = new NfcChip { NfcTagId = request.NfcTagId, ProductId = request.ProductId, Status = "unactivated" };
        await _nfcRepo.AddAsync(chip);
        return Result<NfcChipDto>.Success(new NfcChipDto(chip.NfcTagId, chip.ProductId, product.Name,
            null, null, chip.Status, 0, 0, null, null), 201);
    }

    public async Task<Result<IEnumerable<NfcChipDto>>> GetAllChipsAsync()
    {
        var chips = await _nfcRepo.GetAllAsync();
        return Result<IEnumerable<NfcChipDto>>.Success(chips.Select(c =>
            new NfcChipDto(c.NfcTagId, c.ProductId, c.Product?.Name, c.AccountId,
                c.Account?.Email, c.Status, c.CreditsGranted, c.ScanCount, c.LastScannedAt, c.ActivatedAt)));
    }

    public async Task<Result<IEnumerable<NfcChipDto>>> GetChipsByAccountAsync(Guid accountId)
    {
        var chips = await _nfcRepo.GetByAccountIdAsync(accountId);
        return Result<IEnumerable<NfcChipDto>>.Success(chips.Select(c =>
            new NfcChipDto(c.NfcTagId, c.ProductId, c.Product?.Name, c.AccountId,
                c.Account?.Email, c.Status, c.CreditsGranted, c.ScanCount, c.LastScannedAt, c.ActivatedAt)));
    }
}
