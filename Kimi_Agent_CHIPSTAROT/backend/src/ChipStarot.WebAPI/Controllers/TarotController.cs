using ChipStarot.Application.DTOs.Tarot;
using ChipStarot.Application.Services;
using ChipStarot.Domain.Entities;
using ChipStarot.Domain.Interfaces;
using ChipStarot.WebAPI.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChipStarot.WebAPI.Controllers;

/// <summary>Tarot readings, cards, and credit packages</summary>
[Route("api/tarot")]
public class TarotController : BaseApiController
{
    private readonly ITarotService _tarotService;
    public TarotController(ITarotService tarotService) => _tarotService = tarotService;

    /// <summary>Danh sách 78 lá bài Tarot</summary>
    [HttpGet("cards")]
    public async Task<IActionResult> GetCards() =>
        ToResponse(await _tarotService.GetAllCardsAsync());

    /// <summary>Bắt đầu phiên bốc bài (yêu cầu đăng nhập + credit)</summary>
    [HttpPost("readings")]
    [Authorize]
    public async Task<IActionResult> StartReading([FromBody] StartReadingRequest request) =>
        ToResponse(await _tarotService.StartReadingAsync(request, CurrentUserId));

    /// <summary>Chi tiết phiên bốc bài</summary>
    [HttpGet("readings/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetReading(Guid id) =>
        ToResponse(await _tarotService.GetReadingByIdAsync(id, CurrentUserId));

    /// <summary>Lịch sử bốc bài của tôi</summary>
    [HttpGet("readings/my")]
    [Authorize]
    public async Task<IActionResult> GetMyReadings(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10) =>
        ToResponse(await _tarotService.GetMyReadingsAsync(CurrentUserId, page, pageSize));

    /// <summary>Đánh giá lời giải AI</summary>
    [HttpPost("readings/rate")]
    [Authorize]
    public async Task<IActionResult> RateReading([FromBody] RateReadingRequest request) =>
        ToResponse(await _tarotService.RateReadingAsync(request, CurrentUserId));

    /// <summary>Lưu / Bỏ lưu phiên bốc bài</summary>
    [HttpPost("readings/save")]
    [Authorize]
    public async Task<IActionResult> SaveReading([FromBody] SaveReadingRequest request) =>
        ToResponse(await _tarotService.ToggleSaveReadingAsync(request, CurrentUserId));

    // ─── Credit Packages ───

    /// <summary>Danh sách gói lượt bốc bài</summary>
    [HttpGet("packages")]
    public async Task<IActionResult> GetPackages() =>
        ToResponse(await _tarotService.GetCreditPackagesAsync());

    /// <summary>Mua gói lượt bốc bài</summary>
    [HttpPost("packages/purchase")]
    [Authorize]
    public async Task<IActionResult> PurchasePackage([FromBody] PurchaseCreditPackageRequest request) =>
        ToResponse(await _tarotService.PurchaseCreditPackageAsync(request, CurrentUserId));

    // ─── ADMIN endpoints ───

    /// <summary>[Admin] Tạo lá bài mới</summary>
    [HttpPost("cards")]
    [HasPermission("cards.manage")]
    public async Task<IActionResult> CreateCard([FromBody] CreateTarotCardRequest request) =>
        ToResponse(await _tarotService.CreateCardAsync(request));

    /// <summary>[Admin] Cập nhật lá bài</summary>
    [HttpPut("cards/{id:int}")]
    [HasPermission("cards.manage")]
    public async Task<IActionResult> UpdateCard(int id, [FromBody] UpdateTarotCardRequest request) =>
        ToResponse(await _tarotService.UpdateCardAsync(id, request));

    /// <summary>[Admin] Xoá lá bài (soft delete)</summary>
    [HttpDelete("cards/{id:int}")]
    [HasPermission("cards.manage")]
    public async Task<IActionResult> DeleteCard(int id) =>
        ToResponse(await _tarotService.DeleteCardAsync(id));
}
