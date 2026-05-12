using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;

namespace ChipStarot.Infrastructure.Services;

public interface IVnPayService
{
    string CreatePaymentUrl(HttpContext httpContext, decimal amount, string orderInfo, string txnRef);
    bool ValidateCallback(IQueryCollection query);
}

public class VnPayService : IVnPayService
{
    private readonly IConfiguration _config;

    public VnPayService(IConfiguration config)
    {
        _config = config;
    }

    public string CreatePaymentUrl(HttpContext httpContext, decimal amount, string orderInfo, string txnRef)
    {
        var vnp_TmnCode = _config["VnPay:TmnCode"];
        var vnp_HashSecret = _config["VnPay:HashSecret"];
        var vnp_Url = _config["VnPay:Url"] ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        var vnp_ReturnUrl = _config["VnPay:ReturnUrl"];

        var vnp_Params = new SortedList<string, string>
        {
            { "vnp_Version", "2.1.0" },
            { "vnp_Command", "pay" },
            { "vnp_TmnCode", vnp_TmnCode ?? "" },
            { "vnp_Amount", ((long)(amount * 100)).ToString() },
            { "vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss") },
            { "vnp_CurrCode", "VND" },
            { "vnp_IpAddr", httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1" },
            { "vnp_Locale", "vn" },
            { "vnp_OrderInfo", orderInfo },
            { "vnp_OrderType", "other" },
            { "vnp_ReturnUrl", vnp_ReturnUrl ?? "" },
            { "vnp_TxnRef", txnRef }
        };

        var rawData = new StringBuilder();
        foreach (var item in vnp_Params)
        {
            if (!string.IsNullOrEmpty(item.Value))
            {
                rawData.Append(item.Key + "=" + Uri.EscapeDataString(item.Value) + "&");
            }
        }

        var signData = rawData.ToString().TrimEnd('&');
        var vnp_SecureHash = HmacSha512(vnp_HashSecret ?? "", signData);
        
        return $"{vnp_Url}?{signData}&vnp_SecureHash={vnp_SecureHash}";
    }

    public bool ValidateCallback(IQueryCollection query)
    {
        var vnp_HashSecret = _config["VnPay:HashSecret"];
        var vnp_SecureHash = query["vnp_SecureHash"];

        var vnp_Params = new SortedList<string, string>();
        foreach (var key in query.Keys)
        {
            if (key.StartsWith("vnp_") && key != "vnp_SecureHash")
            {
                vnp_Params.Add(key, query[key]!);
            }
        }

        var rawData = new StringBuilder();
        foreach (var item in vnp_Params)
        {
            rawData.Append(item.Key + "=" + Uri.EscapeDataString(item.Value) + "&");
        }

        var signData = rawData.ToString().TrimEnd('&');
        var checkSum = HmacSha512(vnp_HashSecret ?? "", signData);

        return checkSum.Equals(vnp_SecureHash, StringComparison.InvariantCultureIgnoreCase);
    }

    private static string HmacSha512(string key, string inputData)
    {
        var hash = new StringBuilder();
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var inputBytes = Encoding.UTF8.GetBytes(inputData);
        using (var hmac = new HMACSHA512(keyBytes))
        {
            var hashValue = hmac.ComputeHash(inputBytes);
            foreach (var theByte in hashValue)
            {
                hash.Append(theByte.ToString("x2"));
            }
        }
        return hash.ToString();
    }
}
