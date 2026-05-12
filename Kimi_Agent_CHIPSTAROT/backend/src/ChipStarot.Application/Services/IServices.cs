// Interface definitions for cross-cutting concerns
namespace ChipStarot.Application.Services;

public interface IJwtService
{
    string GenerateAccessToken(Guid accountId, string email, string role);
    string GenerateRefreshToken();
    Task SaveRefreshTokenAsync(Guid accountId, string refreshToken);
    Task<Guid?> ValidateRefreshTokenAsync(string refreshToken);
    Task RevokeRefreshTokenAsync(string refreshToken);
}

public interface IEmailService
{
    Task SendOtpEmailAsync(string email, string otpCode, string type);
    Task SendOrderConfirmationAsync(string email, string orderSummary);
}

public interface IGeminiService
{
    Task<string> GenerateTarotReadingAsync(
        string? topic,
        string? userQuestion,
        string? mood,
        IList<string> cardNames);
}
