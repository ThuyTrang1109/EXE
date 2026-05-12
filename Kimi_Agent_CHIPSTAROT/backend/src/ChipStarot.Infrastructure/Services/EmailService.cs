using System.Net;
using System.Net.Mail;
using ChipStarot.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ChipStarot.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendOtpEmailAsync(string email, string otpCode, string type)
    {
        var subject = type == "register"
            ? "🔮 CHIPSTAROT - Xác thực tài khoản của bạn"
            : "🔮 CHIPSTAROT - Đặt lại mật khẩu";

        var body = type == "register"
            ? BuildRegisterOtpBody(otpCode)
            : BuildResetPasswordBody(otpCode);

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendOrderConfirmationAsync(string email, string orderSummary)
    {
        var body = $@"
            <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e0e0e0;padding:30px;border-radius:12px;'>
                <h1 style='color:#c8a96e;text-align:center;'>✨ Đặt hàng thành công!</h1>
                <p>Cảm ơn bạn đã tin tưởng CHIPSTAROT. Đơn hàng của bạn đã được ghi nhận.</p>
                <div style='background:#16213e;padding:20px;border-radius:8px;margin:20px 0;'>
                    {orderSummary}
                </div>
                <p style='color:#888;font-size:12px;text-align:center;'>© 2026 CHIPSTAROT. All rights reserved.</p>
            </div>";

        await SendEmailAsync(email, "🛒 CHIPSTAROT - Xác nhận đơn hàng", body);
    }

    private async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        try
        {
            var smtpHost = _config["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_config["Email:SmtpPort"] ?? "587");
            var fromEmail = _config["Email:FromEmail"] ?? "";
            var fromPassword = _config["Email:FromPassword"] ?? "";
            var fromName = _config["Email:FromName"] ?? "CHIPSTAROT";

            if (string.IsNullOrEmpty(fromEmail))
            {
                _logger.LogWarning("Email not configured. OTP would be sent to {Email}: {Subject}", to, subject);
                return;
            }

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(fromEmail, fromPassword)
            };

            var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(to);

            await client.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", to);
            // Don't throw - email failure shouldn't crash the flow
        }
    }

    private static string BuildRegisterOtpBody(string code) => $@"
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e0e0e0;padding:30px;border-radius:12px;'>
            <h1 style='color:#c8a96e;text-align:center;'>🔮 Xác thực tài khoản CHIPSTAROT</h1>
            <p>Chào mừng bạn đến với CHIPSTAROT! Hãy nhập mã OTP bên dưới để hoàn tất đăng ký.</p>
            <div style='background:#c8a96e;color:#1a1a2e;font-size:36px;font-weight:bold;text-align:center;padding:20px;border-radius:8px;letter-spacing:8px;margin:30px 0;'>
                {code}
            </div>
            <p style='color:#aaa;'>Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
            <p style='color:#888;font-size:12px;text-align:center;'>© 2026 CHIPSTAROT. All rights reserved.</p>
        </div>";

    private static string BuildResetPasswordBody(string code) => $@"
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e0e0e0;padding:30px;border-radius:12px;'>
            <h1 style='color:#c8a96e;text-align:center;'>🔑 Đặt lại mật khẩu</h1>
            <p>Bạn đã yêu cầu đặt lại mật khẩu. Sử dụng mã OTP bên dưới để tiếp tục.</p>
            <div style='background:#c8a96e;color:#1a1a2e;font-size:36px;font-weight:bold;text-align:center;padding:20px;border-radius:8px;letter-spacing:8px;margin:30px 0;'>
                {code}
            </div>
            <p style='color:#aaa;'>Mã có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
            <p style='color:#888;font-size:12px;text-align:center;'>© 2026 CHIPSTAROT. All rights reserved.</p>
        </div>";
}
