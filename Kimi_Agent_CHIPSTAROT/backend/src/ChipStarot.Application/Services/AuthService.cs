using System.Security.Cryptography;
using System.Text;
using ChipStarot.Application.DTOs.Auth;
using ChipStarot.Domain.Common;
using ChipStarot.Domain.Entities;
using ChipStarot.Domain.Interfaces;

namespace ChipStarot.Application.Services;

public interface IAuthService
{
    Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request);
    Task<Result> VerifyOtpAsync(VerifyOtpRequest request);
    Task<Result> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<Result> ResetPasswordAsync(ResetPasswordRequest request);
    Task<Result<AuthResponse>> RefreshTokenAsync(string refreshToken);
    Task<Result> LogoutAsync(Guid accountId, string refreshToken);
}

public class AuthService : IAuthService
{
    private readonly IAccountRepository _accountRepo;
    private readonly IAuthRepository _authRepo;
    private readonly IJwtService _jwtService;
    private readonly IEmailService _emailService;

    public AuthService(
        IAccountRepository accountRepo,
        IAuthRepository authRepo,
        IJwtService jwtService,
        IEmailService emailService)
    {
        _accountRepo = accountRepo;
        _authRepo = authRepo;
        _jwtService = jwtService;
        _emailService = emailService;
    }

    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        if (request.Password != request.ConfirmPassword)
            return Result<AuthResponse>.Failure("Mật khẩu xác nhận không khớp.");

        if (await _accountRepo.EmailExistsAsync(request.Email))
            return Result<AuthResponse>.Failure("Email này đã được đăng ký.");

        var passwordHash = HashPassword(request.Password);
        var account = new Account
        {
            Email = request.Email.ToLowerInvariant().Trim(),
            PasswordHash = passwordHash,
            RoleId = 3, // Customer
            IsVerified = false,
            AccountStatus = "unverified"
        };

        await _accountRepo.AddAsync(account);

        // Create empty profile
        var profile = new CustomerProfile { AccountId = account.Id };
        await _accountRepo.UpdateCustomerProfileAsync(profile);

        // Send OTP
        await SendOtpAsync(account.Email, "register");

        return Result<AuthResponse>.Success(new AuthResponse("", "", new UserInfoDto(
            account.Id, account.Email, "customer", false, null, null, 0)), 201);
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var account = await _accountRepo.GetByEmailAsync(request.Email.ToLowerInvariant().Trim());
        if (account == null || !VerifyPassword(request.Password, account.PasswordHash))
            return Result<AuthResponse>.Failure("Email hoặc mật khẩu không đúng.", 401);

        if (account.AccountStatus == "banned")
            return Result<AuthResponse>.Failure("Tài khoản của bạn đã bị khóa.", 403);

        if (!account.IsVerified)
            return Result<AuthResponse>.Failure("Vui lòng xác thực email trước khi đăng nhập.", 403);

        var profile = await _accountRepo.GetCustomerProfileAsync(account.Id);
        var roleName = account.Role?.Key ?? "customer";

        var accessToken = _jwtService.GenerateAccessToken(account.Id, account.Email, roleName);
        var refreshToken = _jwtService.GenerateRefreshToken();
        await _jwtService.SaveRefreshTokenAsync(account.Id, refreshToken);

        var user = new UserInfoDto(
            account.Id, account.Email, roleName, account.IsVerified,
            profile?.FullName, profile?.AvatarUrl, profile?.Credits ?? 0);

        return Result<AuthResponse>.Success(new AuthResponse(accessToken, refreshToken, user));
    }

    public async Task<Result> VerifyOtpAsync(VerifyOtpRequest request)
    {
        var otp = await _authRepo.GetValidOtpAsync(request.Email, request.OtpCode, request.Type);
        if (otp == null)
            return Result.Failure("Mã OTP không hợp lệ hoặc đã hết hạn.");

        await _authRepo.MarkOtpUsedAsync(otp.Id);

        if (request.Type == "register")
        {
            var account = await _accountRepo.GetByEmailAsync(request.Email);
            if (account != null)
            {
                account.IsVerified = true;
                account.AccountStatus = "active";
                await _accountRepo.UpdateAsync(account);
            }
        }

        return Result.Success();
    }

    public async Task<Result> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var account = await _accountRepo.GetByEmailAsync(request.Email);
        if (account == null)
            return Result.Success(); // Không tiết lộ email có tồn tại hay không

        await SendOtpAsync(request.Email, "reset_password");
        return Result.Success();
    }

    public async Task<Result> ResetPasswordAsync(ResetPasswordRequest request)
    {
        if (request.NewPassword != request.ConfirmNewPassword)
            return Result.Failure("Mật khẩu xác nhận không khớp.");

        var otp = await _authRepo.GetValidOtpAsync(request.Email, request.OtpCode, "reset_password");
        if (otp == null)
            return Result.Failure("Mã OTP không hợp lệ hoặc đã hết hạn.");

        var account = await _accountRepo.GetByEmailAsync(request.Email);
        if (account == null) return Result.Failure("Tài khoản không tồn tại.", 404);

        account.PasswordHash = HashPassword(request.NewPassword);
        await _accountRepo.UpdateAsync(account);
        await _authRepo.MarkOtpUsedAsync(otp.Id);

        return Result.Success();
    }

    public async Task<Result<AuthResponse>> RefreshTokenAsync(string refreshToken)
    {
        var accountId = await _jwtService.ValidateRefreshTokenAsync(refreshToken);
        if (accountId == null)
            return Result<AuthResponse>.Failure("Refresh token không hợp lệ.", 401);

        var account = await _accountRepo.GetByIdAsync(accountId.Value);
        if (account == null) return Result<AuthResponse>.Failure("Tài khoản không tồn tại.", 404);

        var profile = await _accountRepo.GetCustomerProfileAsync(account.Id);
        var roleName = account.Role?.Key ?? "customer";

        var newAccessToken = _jwtService.GenerateAccessToken(account.Id, account.Email, roleName);
        var newRefreshToken = _jwtService.GenerateRefreshToken();
        await _jwtService.RevokeRefreshTokenAsync(refreshToken);
        await _jwtService.SaveRefreshTokenAsync(account.Id, newRefreshToken);

        var user = new UserInfoDto(account.Id, account.Email, roleName,
            account.IsVerified, profile?.FullName, profile?.AvatarUrl, profile?.Credits ?? 0);

        return Result<AuthResponse>.Success(new AuthResponse(newAccessToken, newRefreshToken, user));
    }

    public async Task<Result> LogoutAsync(Guid accountId, string refreshToken)
    {
        await _jwtService.RevokeRefreshTokenAsync(refreshToken);
        return Result.Success();
    }

    // ────── Helpers ──────
    private async Task SendOtpAsync(string email, string type)
    {
        await _authRepo.ExpireOldOtpsAsync(email, type);
        var code = GenerateOtpCode();
        var otp = new OtpVerification
        {
            Email = email,
            OtpCode = code,
            Type = type,
            Status = "pending",
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        };
        await _authRepo.AddOtpAsync(otp);
        await _emailService.SendOtpEmailAsync(email, code, type);
    }

    private static string GenerateOtpCode() =>
        Random.Shared.Next(100000, 999999).ToString();

    public static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password), salt, 100000, HashAlgorithmName.SHA256, 32);
        return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
    }

    public static bool VerifyPassword(string password, string storedHash)
    {
        try
        {
            var parts = storedHash.Split(':');
            if (parts.Length != 2) return false;
            var salt = Convert.FromBase64String(parts[0]);
            var expectedHash = Convert.FromBase64String(parts[1]);
            var actualHash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password), salt, 100000, HashAlgorithmName.SHA256, 32);
            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }
        catch { return false; }
    }
}
