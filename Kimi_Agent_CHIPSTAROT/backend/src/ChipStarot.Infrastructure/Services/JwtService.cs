using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ChipStarot.Application.Services;
using ChipStarot.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ChipStarot.Infrastructure.Services;

/// <summary>
/// JwtService — Refresh token được lưu bền vững trong PostgreSQL (IAuthRepository),
/// không còn dùng IMemoryCache nên không bị mất khi server restart.
/// </summary>
public class JwtService : IJwtService
{
    private readonly IConfiguration _config;
    private readonly IAuthRepository _authRepo;

    public JwtService(IConfiguration config, IAuthRepository authRepo)
    {
        _config = config;
        _authRepo = authRepo;
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

    public async Task SaveRefreshTokenAsync(Guid accountId, string refreshToken)
    {
        var expireDays = int.Parse(_config["Jwt:RefreshTokenExpireDays"] ?? "30");
        await _authRepo.SaveRefreshTokenAsync(accountId, refreshToken, expireDays);
    }

    public async Task<Guid?> ValidateRefreshTokenAsync(string refreshToken)
    {
        return await _authRepo.GetAccountIdByRefreshTokenAsync(refreshToken);
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        await _authRepo.RevokeRefreshTokenAsync(refreshToken);
    }
}
