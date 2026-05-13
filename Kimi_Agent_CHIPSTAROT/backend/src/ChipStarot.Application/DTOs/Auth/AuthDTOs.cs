using System.ComponentModel.DataAnnotations;

namespace ChipStarot.Application.DTOs.Auth;

public record RegisterRequest(
    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ")]
    string Email,

    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên")]
    string Password,

    [Required(ErrorMessage = "Xác nhận mật khẩu là bắt buộc")]
    string ConfirmPassword
);

public record LoginRequest(
    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ")]
    string Email,

    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    string Password
);

public record VerifyOtpRequest(
    [Required] [EmailAddress] string Email,
    [Required] [StringLength(6, MinimumLength = 6)] string OtpCode,
    [Required] string Type // register | reset_password
);

public record ForgotPasswordRequest(
    [Required] [EmailAddress] string Email
);

public record ResetPasswordRequest(
    [Required] [EmailAddress] string Email,
    [Required] string OtpCode,
    [Required] [MinLength(6)] string NewPassword,
    [Required] string ConfirmNewPassword
);

public record RefreshTokenRequest([Required] string RefreshToken);

// Response DTOs
public record AuthResponse(string AccessToken, string RefreshToken, UserInfoDto User);

public record UserInfoDto(Guid Id, string Email, string Role, bool IsVerified, string? FullName, string? AvatarUrl, int Credits);
