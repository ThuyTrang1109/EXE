using System.Text;
using System.Text.Json;
using ChipStarot.Application.Services;
using ChipStarot.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ChipStarot.Infrastructure.Services;

public class GeminiService : IGeminiService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ISystemSettingRepository _settingRepo;
    private readonly ILogger<GeminiService> _logger;

    private const string GeminiModel = "gemini-2.0-flash-lite";
    private const string GeminiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/models/";

    public GeminiService(
        IHttpClientFactory httpClientFactory,
        ISystemSettingRepository settingRepo,
        ILogger<GeminiService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _settingRepo = settingRepo;
        _logger = logger;
    }

    public async Task<string> GenerateTarotReadingAsync(
        string? topic,
        string? userQuestion,
        string? mood,
        IList<CardWithMeaning> cards)
    {
        var apiKey = await _settingRepo.GetValueAsync("GEMINI_API_KEY");
        if (string.IsNullOrEmpty(apiKey))
            throw new InvalidOperationException("Gemini API Key chưa được cấu hình.");

        var prompt = BuildTarotPrompt(topic, userQuestion, mood, cards);
        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            generationConfig = new
            {
                temperature = 1.0, // Tăng sự sáng tạo
                maxOutputTokens = 2048,
                topK = 40,
                topP = 0.95
            },
            safetySettings = new[]
            {
                new { category = "HARM_CATEGORY_HARASSMENT", threshold = "BLOCK_MEDIUM_AND_ABOVE" },
                new { category = "HARM_CATEGORY_HATE_SPEECH", threshold = "BLOCK_MEDIUM_AND_ABOVE" },
                new { category = "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold = "BLOCK_MEDIUM_AND_ABOVE" },
                new { category = "HARM_CATEGORY_DANGEROUS_CONTENT", threshold = "BLOCK_MEDIUM_AND_ABOVE" }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var url = $"{GeminiBaseUrl}{GeminiModel}:generateContent?key={apiKey}";
        var client = _httpClientFactory.CreateClient("Gemini");

        var response = await client.PostAsync(url, content);
        
        if (!response.IsSuccessStatusCode)
        {
            var errStr = await response.Content.ReadAsStringAsync();
            _logger.LogError("Gemini API Error: {Error}", errStr);
            throw new Exception("Lỗi khi kết nối với AI vũ trụ.");
        }

        var responseBody = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(responseBody);

        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return text ?? "Vũ trụ đang tạm lặng thinh, hãy thử lại sau nhé.";
    }

    private static string BuildTarotPrompt(
        string? topic,
        string? userQuestion,
        string? mood,
        IList<CardWithMeaning> cards)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Bạn là **CHIPSTAROT AI** - một nhà tiên tri Tarot huyền bí, sâu sắc và đầy thấu cảm.");
        sb.AppendLine("Nhiệm vụ của bạn là thực hiện một buổi luận giải bài Tarot chuyên nghiệp và truyền cảm hứng.");
        sb.AppendLine("Văn phong: Huyền bí, ấm áp, chân thật, mang tính định hướng tích cực. Hãy dùng đại từ 'Tôi' (người luận giải) và 'Bạn' (người hỏi).");
        sb.AppendLine();

        sb.AppendLine("### 🌌 THÔNG TIN BỐI CẢNH");
        if (!string.IsNullOrEmpty(topic))
            sb.AppendLine($"- **Chủ đề**: {TranslateTopic(topic)}");
        if (!string.IsNullOrEmpty(userQuestion))
            sb.AppendLine($"- **Câu hỏi từ người lữ khách**: \"{userQuestion}\"");
        if (!string.IsNullOrEmpty(mood))
            sb.AppendLine($"- **Tâm trạng hiện tại**: {TranslateMood(mood)}");

        sb.AppendLine();
        sb.AppendLine("### 🃏 CÁC LÁ BÀI ĐÃ XUẤT HIỆN");
        foreach (var card in cards)
        {
            var direction = card.IsReversed ? "Ngược" : "Xuôi";
            sb.AppendLine($"- **{card.Name}** ({direction})");
            sb.AppendLine($"  *Ghi chú ý nghĩa gốc:* {card.Meaning}");
        }

        sb.AppendLine();
        sb.AppendLine("### 🔮 YÊU CẦU LUẬN GIẢI");
        if (cards.Count == 1)
        {
            sb.AppendLine("Hãy tập trung sâu vào thông điệp của lá bài duy nhất này. Phân tích sự liên kết giữa ý nghĩa lá bài với câu hỏi và tâm trạng của người hỏi. Đưa ra lời khuyên hành động cụ thể.");
        }
        else
        {
            sb.AppendLine("Hãy luận giải theo cấu trúc:");
            sb.AppendLine("1. **Quá khứ (Lá bài 1)**: Những năng lượng đã dẫn dắt đến hiện tại.");
            sb.AppendLine("2. **Hiện tại (Lá bài 2)**: Trạng thái thực tại và những gì cần lưu tâm.");
            sb.AppendLine("3. **Tương lai (Lá bài 3)**: Xu hướng và kết quả có thể xảy ra nếu tiếp tục hướng đi này.");
            sb.AppendLine("4. **Lời khuyên tổng kết**: Một thông điệp chữa lành hoặc định hướng ngắn gọn.");
        }

        sb.AppendLine();
        sb.AppendLine("### ⚠️ QUY TẮC ĐỊNH DẠNG");
        sb.AppendLine("- Trả lời bằng **tiếng Việt**.");
        sb.AppendLine("- Sử dụng **Markdown** để làm nổi bật (dùng bold cho tên lá bài, dùng list, hoặc dùng các ký tự ✨, 🔮 để tăng tính huyền bí).");
        sb.AppendLine("- Không phán xét tiêu cực hay khẳng định định mệnh tuyệt đối. Hãy dùng ngôn ngữ gợi mở.");
        sb.AppendLine("- Trình bày mạch lạc, không dùng các ký hiệu kỹ thuật của JSON hay code block.");

        return sb.ToString();
    }

    private static string TranslateTopic(string topic) => topic switch
    {
        "love" => "Tình yêu",
        "career" => "Sự nghiệp & Công việc",
        "finance" => "Tài chính",
        "health" => "Sức khỏe",
        "study" => "Học tập",
        "general" => "Tổng quan cuộc sống",
        _ => topic
    };

    private static string TranslateMood(string mood) => mood switch
    {
        "happy" => "Vui vẻ, hạnh phúc",
        "anxious" => "Lo lắng, bồn chồn",
        "tired" => "Mệt mỏi",
        "confused" => "Bối rối, không biết nên làm gì",
        "hopeful" => "Hy vọng",
        _ => mood
    };
}
