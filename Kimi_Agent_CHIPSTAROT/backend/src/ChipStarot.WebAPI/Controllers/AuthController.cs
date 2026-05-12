using ChipStarot.Application.DTOs.Auth;
using ChipStarot.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChipStarot.WebAPI.Controllers;

/// <summary>Authentication: Register, Login, OTP, Refresh Token</summary>
[Route("api/auth")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    /// <summary>Đăng ký tài khoản mới</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request) =>
        ToResponse(await _authService.RegisterAsync(request));

    /// <summary>Đăng nhập</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request) =>
        ToResponse(await _authService.LoginAsync(request));

    /// <summary>Xác thực OTP (đăng ký hoặc quên mật khẩu)</summary>
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request) =>
        ToResponse(await _authService.VerifyOtpAsync(request));

    /// <summary>Yêu cầu gửi lại OTP quên mật khẩu</summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request) =>
        ToResponse(await _authService.ForgotPasswordAsync(request));

    /// <summary>Đặt lại mật khẩu sau khi xác thực OTP</summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request) =>
        ToResponse(await _authService.ResetPasswordAsync(request));

    /// <summary>Làm mới Access Token bằng Refresh Token</summary>
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request) =>
        ToResponse(await _authService.RefreshTokenAsync(request.RefreshToken));

    /// <summary>Đăng xuất</summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request) =>
        ToResponse(await _authService.LogoutAsync(CurrentUserId, request.RefreshToken));
}
