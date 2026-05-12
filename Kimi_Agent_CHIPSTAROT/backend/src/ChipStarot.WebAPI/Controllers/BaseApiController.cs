using Microsoft.AspNetCore.Mvc;

namespace ChipStarot.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class BaseApiController : ControllerBase
{
    protected IActionResult ToResponse<T>(Domain.Common.Result<T> result)
    {
        if (result.IsSuccess)
            return StatusCode(result.StatusCode, new { success = true, data = result.Data });
        return StatusCode(result.StatusCode, new { success = false, error = result.Error });
    }

    protected IActionResult ToResponse(Domain.Common.Result result)
    {
        if (result.IsSuccess)
            return StatusCode(result.StatusCode, new { success = true });
        return StatusCode(result.StatusCode, new { success = false, error = result.Error });
    }

    protected Guid CurrentUserId =>
        Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token"));
}
