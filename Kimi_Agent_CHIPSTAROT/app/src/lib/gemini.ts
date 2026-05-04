const ADMIN_KEY_STORAGE = 'chipstarot_admin_gemini_key';

/** Lấy Gemini API Key: ưu tiên key do Admin cài đặt (localStorage), fallback về .env */
export function getActiveGeminiKey(): string {
  const adminKey = localStorage.getItem(ADMIN_KEY_STORAGE) || '';
  // Nếu admin đã nhập key, ưu tiên dùng key này (nếu đúng định dạng)
  if (adminKey && adminKey.startsWith('AIzaSy') && adminKey.length > 20) return adminKey;

  // Key bị leak cũ (cần chặn để tránh lỗi 403/404 từ Google)
  const LEAKED_KEY = 'AIzaSyD4Mypc8zmpdxmi0dzLUMZq5Q9tqcFKio0';
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  if (envKey && envKey !== LEAKED_KEY && envKey.startsWith('AIzaSy')) {
    return envKey;
  }

  return '';
}

/** Admin lưu key mới vào localStorage */
export function setAdminGeminiKey(key: string): void {
  localStorage.setItem(ADMIN_KEY_STORAGE, key.trim());
}

/** Admin xoá key đã lưu (quay về dùng .env) */
export function clearAdminGeminiKey(): void {
  localStorage.removeItem(ADMIN_KEY_STORAGE);
}

export async function generateTarotReading(
  name: string,
  topic: string,
  context: string,
  question: string,
  cards: Array<{ name: string; reversed: boolean }>
): Promise<string> {
  const apiKey = getActiveGeminiKey();
  if (!apiKey || !apiKey.startsWith('AIzaSy')) {
    return `[Hệ thống] Chưa có API Key hợp lệ. Vui lòng vào trang Admin → Cài đặt → nhập Gemini API Key để bật tính năng AI.`;
  }

  const cardDetails = cards
    .map((c, idx) => `Lá bài ${idx + 1}: ${c.name} (${c.reversed ? 'Ngược' : 'Xuôi'})`)
    .join('\n');

  const prompt = `
Bạn là một Master Tarot Reader với khả năng thấu cảm cực cao và am hiểu sâu sắc về tâm lý con người.
Hãy đưa ra một lời luận giải CÁ NHÂN HÓA SÂU SẮC cho khách hàng dựa trên các thông tin cụ thể sau:

[THÔNG TIN KHÁCH HÀNG]
- Tên khách hàng: ${name}
- Chủ đề quan tâm: ${topic}
- Ngữ cảnh/Tình trạng hiện tại: ${context}
- Câu hỏi cụ thể của họ: "${question}"
- Các lá bài họ đã tự tay bốc được:
${cardDetails}

[YÊU CẦU LUẬN GIẢI - TUYỆT ĐỐI TUÂN THỦ]:
1. **Xưng hô**: Hãy dùng giọng văn ấm áp, chữa lành. Xưng là "Vũ trụ" hoặc "Mình" và gọi khách hàng là "${name}" trong suốt bài viết.
2. **Cá nhân hóa 100%**: 
   - KHÔNG ĐƯỢC trả lời rập khuôn theo ý nghĩa sách giáo khoa của lá bài.
   - Hãy bóc tách câu hỏi "${question}" kết hợp với ngữ cảnh "${context}" để xem lá bài đó mang thông điệp cụ thể gì cho tình huống riêng của ${name}.
   - Ví dụ: Nếu khách hỏi về việc đổi việc mà bốc được lá bài xấu, đừng chỉ nói lá bài đó là xui xẻo, hãy phân tích xem trong bối cảnh đổi việc hiện tại của ${name}, lá bài khuyên nên chuẩn bị những gì.
3. **Cấu trúc bài đọc**:
   - Mở đầu bằng lời chào thân mật và một câu tóm tắt năng lượng tổng quan.
   - Đi sâu vào phân tích từng lá bài ứng với vị trí (nếu trải 3 lá) hoặc thông điệp chính (nếu 1 lá).
   - Kết luận bằng **3-4 hành động thực tế/lời khuyên cụ thể** mà ${name} nên làm ngay hôm nay để cải thiện tình hình.
4. **Ngôn ngữ**: Tiếng Việt, trình bày rõ ràng, sử dụng các ký tự emoji phù hợp để tăng tính trải nghiệm nhưng vẫn giữ được sự tôn nghiêm của Tarot. Độ dài từ 350-500 từ.
`;

  try {
    // Cập nhật lên Gemini 2.5 Flash Lite (Đèn pin 2.5) theo cấu hình tài khoản Google AI Studio 2026
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Lỗi từ Gemini API:', errorData);
      throw new Error(errorData?.error?.message || `Lỗi HTTP ${response.status}`);
    }

    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      throw new Error('Không trích xuất được text từ phản hồi của AI.');
    }

    return aiText;
  } catch (error: any) {
    console.error('Lỗi fetch Gemini API:', error);
    
    // Fallback reading when API is down or rate limited
    const fallbackCardsInfo = cards.map(c => `- **${c.name}** ${c.reversed ? '(Ngược)' : '(Xuôi)'}: Lá bài này phản ánh một phần quan trọng trong câu chuyện của bạn.`).join('\n');
    
    return `✨ **Thông điệp từ Vũ Trụ dành cho ${name}** ✨\n\n` +
           `Hiện tại tín hiệu từ các vì sao đang gặp chút nhiễu sóng (Hệ thống AI đang tạm thời quá tải), nhưng trải bài của bạn vẫn mang những ý nghĩa đặc biệt sau:\n\n` +
           `${fallbackCardsInfo}\n\n` +
           `🔮 Trong bối cảnh về **${topic.toLowerCase()}** và tình hình hiện tại của bạn ("${context}"), các lá bài xuất hiện để nhắc nhở bạn hãy giữ một tâm trí cởi mở và bình tĩnh. \n\n` +
           `💡 **Lời khuyên cho bạn:**\n` +
           `1. Đối với trăn trở "${question}", đôi khi câu trả lời tốt nhất là để thời gian trả lời.\n` +
           `2. Hãy tin tưởng vào trực giác của chính mình.\n` +
           `3. Tập trung vào những điều bạn có thể kiểm soát ở hiện tại.\n\n` +
           `*(Đây là lời giải mã dự phòng. Vui lòng thử lại sau ít phút để nhận được thông điệp phân tích sâu sắc và chi tiết hơn từ hệ thống).*`;
  }
}
