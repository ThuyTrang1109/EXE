using ChipStarot.Application.DTOs.Nfc;
using ChipStarot.Application.Services;
using ChipStarot.WebAPI.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChipStarot.WebAPI.Controllers;

[Route("api/nfc")]
public class NfcController : BaseApiController
{
    private readonly INfcService _nfcService;
    public NfcController(INfcService nfcService) => _nfcService = nfcService;

    [HttpPost("scan")]
    [Authorize]
    public async Task<IActionResult> Scan([FromBody] ScanNfcRequest request)
    {
        var req = request with { AccountId = CurrentUserId };
        return ToResponse(await _nfcService.ScanAsync(req));
    }

    [HttpGet("my-chips")]
    [Authorize]
    public async Task<IActionResult> GetMyChips() =>
        ToResponse(await _nfcService.GetChipsByAccountAsync(CurrentUserId));

    [HttpPost("generate")]
    [HasPermission("nfc.manage")]
    public async Task<IActionResult> GenerateChip([FromBody] GenerateNfcRequest request) =>
        ToResponse(await _nfcService.GenerateChipAsync(request, CurrentUserId));

    [HttpGet("all")]
    [HasPermission("nfc.manage")]
    public async Task<IActionResult> GetAllChips() =>
        ToResponse(await _nfcService.GetAllChipsAsync());
}
