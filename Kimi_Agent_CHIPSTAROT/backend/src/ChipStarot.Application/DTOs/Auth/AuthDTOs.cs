// Request DTOs
namespace ChipStarot.Application.DTOs.Auth;

public record RegisterRequest(
    string Email,
    string Password,
    string ConfirmPassword
);

public record LoginRequest(
    string Email,
    string Password
);

public record VerifyOtpRequest(
    string Email,
    string OtpCode,
    string Type // register | reset_password
);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(
    string Email,
    string OtpCode,
    string NewPassword,
    string ConfirmNewPassword
);

public record RefreshTokenRequest(string RefreshToken);

// Response DTOs
public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    UserInfoDto User
);

public record UserInfoDto(
    Guid Id,
    string Email,
    string Role,
    bool IsVerified,
    string? FullName,
    string? AvatarUrl,
    int Credits
);
