using ChipStarot.Application.DTOs.Profile;
using ChipStarot.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChipStarot.WebAPI.Controllers;

/// <summary>User profile, pet system, notifications</summary>
[Route("api/profile")]
[Authorize]
public class ProfileController : BaseApiController
{
    private readonly IAccountRepository _accountRepo;
    private readonly IPetRepository _petRepo;
    private readonly ISystemSettingRepository _sysRepo;

    public ProfileController(IAccountRepository accountRepo, IPetRepository petRepo, ISystemSettingRepository sysRepo)
    {
        _accountRepo = accountRepo;
        _petRepo = petRepo;
        _sysRepo = sysRepo;
    }

    /// <summary>Trả về vai trò + quyền của user hiện tại (RBAC.md — mục 6)</summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        // FIX: Dùng GetByIdWithPermissionsAsync thay vì inject DbContext trực tiếp
        var account = await _accountRepo.GetByIdWithPermissionsAsync(CurrentUserId);
        if (account == null) return NotFound(new { error = "Tài khoản không tồn tại." });

        var roleKey = account.Role?.Key ?? "customer";
        var permissions = account.Role?.RolePermissions
            .Where(rp => rp.Permission != null)
            .Select(rp => rp.Permission!.Key)
            .ToList() ?? new List<string>();

        return Ok(new { success = true, data = new MeResponse(account.Id, account.Email, roleKey, permissions, account.AccountStatus) });
    }

    /// <summary>Lấy thông tin hồ sơ cá nhân</summary>
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var account = await _accountRepo.GetByIdAsync(CurrentUserId);
        if (account == null) return NotFound(new { error = "Tài khoản không tồn tại." });

        var profile = account.CustomerProfile;
        if (profile == null) return NotFound(new { error = "Hồ sơ không tồn tại." });

        // ── Tự động tiến hoá dựa trên EXP ──
        if (profile.PetStatus != "egg")
        {
            var oldStatus = profile.PetStatus;
            var teenExp = int.TryParse(await _sysRepo.GetValueAsync("pet_evolution_teen_exp") ?? "200", out var t) ? t : 200;
            var adultExp = int.TryParse(await _sysRepo.GetValueAsync("pet_evolution_adult_exp") ?? "1000", out var a) ? a : 1000;

            if (profile.PetExp >= adultExp) profile.PetStatus = "adult";
            else if (profile.PetExp >= teenExp) profile.PetStatus = "teen";
            else profile.PetStatus = "hatched";

            if (oldStatus != profile.PetStatus)
            {
                profile.UpdatedAt = DateTime.UtcNow;
                await _accountRepo.UpdateCustomerProfileAsync(profile);
                await _petRepo.AddLogAsync(new Domain.Entities.PetGameLog {
                    AccountId = CurrentUserId, ActionType = "evolution", ReferenceId = profile.PetStatus,
                    CurrentExp = profile.PetExp, CurrentFood = profile.PetFood
                });
            }
        }

        var dto = new CustomerProfileDto(
            account.Id, account.Email,
            profile.FullName, profile.PhoneNumber,
            profile.Province, profile.District, profile.Ward, profile.StreetAddress,
            profile.DateOfBirth, profile.Gender, profile.ZodiacSign, profile.LifePathNumber,
            profile.AvatarUrl, profile.Credits, profile.DailyAllowance,
            profile.LastResetDate, profile.CreditsExpiresAt,
            profile.PetExp, profile.PetFood,
            profile.PetType, profile.PetName, profile.PetStatus,
            profile.PetClaimedLevels,
            account.AccountStatus);

        return Ok(new { success = true, data = dto });
    }

    /// <summary>Cập nhật thông tin hồ sơ</summary>
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var profile = await _accountRepo.GetCustomerProfileAsync(CurrentUserId);
        if (profile == null) return NotFound(new { error = "Hồ sơ không tồn tại." });

        if (request.FullName != null) profile.FullName = request.FullName;
        if (request.PhoneNumber != null) profile.PhoneNumber = request.PhoneNumber;
        if (request.Province != null) profile.Province = request.Province;
        if (request.District != null) profile.District = request.District;
        if (request.Ward != null) profile.Ward = request.Ward;
        if (request.StreetAddress != null) profile.StreetAddress = request.StreetAddress;
        if (request.Gender != null) profile.Gender = request.Gender;
        if (request.ZodiacSign != null) profile.ZodiacSign = request.ZodiacSign;
        if (request.AvatarUrl != null) profile.AvatarUrl = request.AvatarUrl;
        if (request.DateOfBirth != null && DateOnly.TryParse(request.DateOfBirth, out var dob))
            profile.DateOfBirth = dob;
        profile.UpdatedAt = DateTime.UtcNow;

        await _accountRepo.UpdateCustomerProfileAsync(profile);
        return Ok(new { success = true, message = "Cập nhật hồ sơ thành công." });
    }

    /// <summary>Cho thú cưng ăn</summary>
    [HttpPost("pet/feed")]
    public async Task<IActionResult> FeedPet([FromBody] PetFeedRequest request)
    {
        var profile = await _accountRepo.GetCustomerProfileAsync(CurrentUserId);
        if (profile == null) return NotFound();

        var foodCostStr = await _sysRepo.GetValueAsync("chipstarot_admin_pet_food_cost") ?? "1";
        var expGainStr = await _sysRepo.GetValueAsync("chipstarot_admin_pet_exp_gain") ?? "10";
        var foodCost = int.TryParse(foodCostStr, out var fc) ? fc : 1;
        var expGain = int.TryParse(expGainStr, out var eg) ? eg : 10;

        var requestedFeedCount = request.FoodAmount / foodCost;
        if (requestedFeedCount < 1) requestedFeedCount = 1;
        var totalFoodCost = requestedFeedCount * foodCost;
        var totalExpGain = requestedFeedCount * expGain;

        if (profile.PetFood < totalFoodCost)
            return BadRequest(new { success = false, error = "Không đủ thức ăn." });

        profile.PetFood -= totalFoodCost;
        profile.PetExp += totalExpGain;

        // Logic tiến hóa (Evolution)
        var teenExpStr = await _sysRepo.GetValueAsync("pet_evolution_teen_exp") ?? "200";
        var adultExpStr = await _sysRepo.GetValueAsync("pet_evolution_adult_exp") ?? "1000";
        var teenExp = int.TryParse(teenExpStr, out var te) ? te : 200;
        var adultExp = int.TryParse(adultExpStr, out var ae) ? ae : 1000;

        if (profile.PetStatus == "hatched" && profile.PetExp >= teenExp)
        {
            profile.PetStatus = "teen";
        }
        else if (profile.PetStatus == "teen" && profile.PetExp >= adultExp)
        {
            profile.PetStatus = "adult";
        }

        profile.UpdatedAt = DateTime.UtcNow;
        await _accountRepo.UpdateCustomerProfileAsync(profile);

        await _petRepo.AddLogAsync(new Domain.Entities.PetGameLog
        {
            AccountId = CurrentUserId,
            ActionType = "feed",
            Amount = request.FoodAmount,
            CurrentExp = profile.PetExp,
            CurrentFood = profile.PetFood
        });

        return Ok(new { success = true, data = new { profile.PetExp, profile.PetFood } });
    }

    /// <summary>Nhận thưởng khi thú cưng lên cấp</summary>
    [HttpPost("pet/claim-reward")]
    public async Task<IActionResult> ClaimPetReward([FromBody] ClaimPetRewardRequest request)
    {
        var profile = await _accountRepo.GetCustomerProfileAsync(CurrentUserId);
        if (profile == null) return NotFound();

        var claimed = System.Text.Json.JsonSerializer.Deserialize<List<int>>(profile.PetClaimedLevels) ?? new();
        if (claimed.Contains(request.Level))
            return BadRequest(new { success = false, error = "Phần thưởng cấp độ này đã được nhận." });

        // Reward: 1 food per level
        var foodReward = request.Level * 2;
        profile.PetFood += foodReward;
        claimed.Add(request.Level);
        profile.PetClaimedLevels = System.Text.Json.JsonSerializer.Serialize(claimed);
        profile.UpdatedAt = DateTime.UtcNow;
        await _accountRepo.UpdateCustomerProfileAsync(profile);

        await _petRepo.AddLogAsync(new Domain.Entities.PetGameLog
        {
            AccountId = CurrentUserId,
            ActionType = "claim_reward",
            Amount = foodReward,
            CurrentExp = profile.PetExp,
            CurrentFood = profile.PetFood,
            ReferenceId = $"level_{request.Level}"
        });

        return Ok(new { success = true, data = new { profile.PetFood, RewardReceived = foodReward } });
    }

    /// <summary>Ấp trứng nở thú cưng ngẫu nhiên</summary>
    [HttpPost("pet/hatch")]
    public async Task<IActionResult> HatchPet()
    {
        var profile = await _accountRepo.GetCustomerProfileAsync(CurrentUserId);
        if (profile == null) return NotFound();
        if (profile.PetStatus != "egg")
            return BadRequest(new { success = false, error = "Bạn đã có thú cưng rồi." });

        var rareRateStr = await _sysRepo.GetValueAsync("chipstarot_admin_pet_rare_rate") ?? "5";
        var rareRate = int.TryParse(rareRateStr, out var rr) ? rr : 5;

        string randomType;
        if (Random.Shared.Next(1, 101) <= rareRate)
        {
            randomType = "chicken_golden";
        }
        else
        {
            var normalPets = new[] { 
                "chicken_classic", "chicken_ninja", "chicken_wizard", 
                "chicken_robot", "chicken_angel", "chicken_devil", "chicken_samurai", 
                "chicken_viking", "chicken_cosmic" 
            };
            randomType = normalPets[Random.Shared.Next(normalPets.Length)];
        }

        profile.PetType = randomType;
        profile.PetStatus = "hatched";
        profile.PetName ??= "Gà Con " + Random.Shared.Next(100, 999);
        profile.UpdatedAt = DateTime.UtcNow;

        await _accountRepo.UpdateCustomerProfileAsync(profile);

        await _petRepo.AddLogAsync(new Domain.Entities.PetGameLog
        {
            AccountId = CurrentUserId,
            ActionType = "hatch",
            Amount = 1,
            CurrentExp = profile.PetExp,
            CurrentFood = profile.PetFood,
            ReferenceId = randomType
        });

        return Ok(new { success = true, data = new PetHatchResponse(profile.PetType, profile.PetName) });
    }
}
