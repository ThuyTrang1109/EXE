using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ChipStarot.Application.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ChipStarot.Infrastructure.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _config;
    private readonly IMemoryCache _cache;
    private const string RefreshTokenPrefix = "rt:";

    public JwtService(IConfiguration config, IMemoryCache cache)
    {
        _config = config;
        _cache = cache;
    }

    public string GenerateAccessToken(Guid accountId, string email, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _config["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured")));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, accountId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
        };

        var expireMinutes = int.Parse(_config["Jwt:AccessTokenExpireMinutes"] ?? "60");
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expireMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public Task SaveRefreshTokenAsync(Guid accountId, string refreshToken)
    {
        var expireDays = int.Parse(_config["Jwt:RefreshTokenExpireDays"] ?? "30");
        // Store: refreshToken -> accountId
        _cache.Set(RefreshTokenPrefix + refreshToken, accountId,
            TimeSpan.FromDays(expireDays));
        return Task.CompletedTask;
    }

    public Task<Guid?> ValidateRefreshTokenAsync(string refreshToken)
    {
        if (_cache.TryGetValue(RefreshTokenPrefix + refreshToken, out Guid accountId))
            return Task.FromResult<Guid?>(accountId);
        return Task.FromResult<Guid?>(null);
    }

    public Task RevokeRefreshTokenAsync(string refreshToken)
    {
        _cache.Remove(RefreshTokenPrefix + refreshToken);
        return Task.CompletedTask;
    }
}
