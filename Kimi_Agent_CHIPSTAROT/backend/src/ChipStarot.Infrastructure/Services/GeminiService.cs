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
        IList<string> cardNames)
    {
        var apiKey = await _settingRepo.GetValueAsync("GEMINI_API_KEY");
        if (string.IsNullOrEmpty(apiKey))
            throw new InvalidOperationException("Gemini API Key chưa được cấu hình.");

        var prompt = BuildTarotPrompt(topic, userQuestion, mood, cardNames);
        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            generationConfig = new
            {
                temperature = 0.9,
                maxOutputTokens = 1500,
                topK = 40,
                topP = 0.95
            },
            safetySettings = new[]
            {
                new { category = "HARM_CATEGORY_HARASSMENT", threshold = "BLOCK_MEDIUM_AND_ABOVE" },
                new { category = "HARM_CATEGORY_HATE_SPEECH", threshold = "BLOCK_MEDIUM_AND_ABOVE" }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var url = $"{GeminiBaseUrl}{GeminiModel}:generateContent?key={apiKey}";
        var client = _httpClientFactory.CreateClient("Gemini");

        var response = await client.PostAsync(url, content);
        response.EnsureSuccessStatusCode();

        var responseBody = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(responseBody);

        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return text ?? "Không thể tạo lời giải lúc này.";
    }

    private static string BuildTarotPrompt(
        string? topic,
        string? userQuestion,
        string? mood,
        IList<string> cardNames)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Bạn là một nhà tiên tri Tarot huyền bí và sâu sắc, đang thực hiện một buổi bói bài.");
        sb.AppendLine("Hãy đọc lá bài và tạo ra một lời giải thích sâu sắc, thơ mộng, mang đậm chất huyền bí.");
        sb.AppendLine("Văn phong: Ấm áp, chân thật, truyền cảm hứng. Không quá hoa mỹ, không phán đoán tiêu cực.");
        sb.AppendLine();

        if (!string.IsNullOrEmpty(topic))
            sb.AppendLine($"Chủ đề trải bài: {TranslateTopic(topic)}");
        if (!string.IsNullOrEmpty(userQuestion))
            sb.AppendLine($"Câu hỏi của người hỏi: \"{userQuestion}\"");
        if (!string.IsNullOrEmpty(mood))
            sb.AppendLine($"Tâm trạng hiện tại: {TranslateMood(mood)}");

        sb.AppendLine();
        sb.AppendLine("Các lá bài được rút:");
        foreach (var card in cardNames)
            sb.AppendLine($"- {card}");

        sb.AppendLine();
        if (cardNames.Count == 1)
        {
            sb.AppendLine("Hãy giải thích ý nghĩa của lá bài này và lời khuyên cho người hỏi. Khoảng 200-300 từ.");
        }
        else
        {
            sb.AppendLine("Hãy giải thích từng lá bài theo thứ tự (Quá khứ - Hiện tại - Tương lai) và tổng kết thông điệp. Khoảng 400-500 từ.");
        }

        sb.AppendLine("Trả lời bằng tiếng Việt. Không dùng markdown, chỉ dùng văn xuôi thuần.");
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
