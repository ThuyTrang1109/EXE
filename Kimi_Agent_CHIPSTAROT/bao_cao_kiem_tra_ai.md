# Báo cáo Kiểm tra Hệ thống AI (Gemini)

Sau khi tiến hành kiểm tra sâu (deep audit) phần tích hợp AI (Gemini) trong source code frontend hiện tại (chủ yếu tại `app/src/lib/gemini.ts` và `app/src/pages/ReadingPage.tsx`), tôi đã phát hiện một số vấn đề **NGHIÊM TRỌNG** liên quan đến bảo mật và logic. 

Các phát hiện này hoàn toàn khớp với sự cần thiết phải triển khai Backend như đã nêu trong tài liệu `ke_hoach_backend_chipstarot.md`.

## 1. Lỗ hổng Bảo mật Critical: Lộ API Key Gemini 🚨
*   **Tình trạng hiện tại:** Mã nguồn Frontend đang sử dụng biến môi trường `VITE_GEMINI_API_KEY` để gọi trực tiếp API của Google từ trình duyệt của người dùng. Trong kiến trúc Vite/React, bất kỳ biến nào bắt đầu bằng `VITE_` đều sẽ được **đóng gói (bundled) công khai** vào mã nguồn Javascript tải xuống trình duyệt.
*   **Hậu quả:** Kẻ xấu chỉ cần mở DevTools (F12) hoặc xem Network Request là có thể lấy cắp được API Key này. 
*   **Thực tế ghi nhận:** API Key hiện tại (`AIzaSyD4Mypc8zmpdxmi0dzLUMZq5Q9tqcFKio0`) **đã bị Google phát hiện rò rỉ và tự động khóa**. Khi gửi yêu cầu lên API, hệ thống trả về mã lỗi `403 Permission Denied: Your API key was reported as leaked`. 
*   *Lưu ý: Nhờ có cơ chế Try/Catch trong `gemini.ts`, ứng dụng hiện tại không bị crash mà tự động chuyển sang câu trả lời dự phòng (fallback), nhưng tính năng AI thực tế đã tê liệt.*

## 2. Lỗ hổng Logic: Client-side Credit & Game Progress 🎮
*   **Tình trạng hiện tại:** Việc trừ lượt bốc bài (Credit) và cộng thức ăn cho thú cưng (Pet Food) đang được xử lý 100% trên Frontend (tại `ReadingPage.tsx`).
*   **Đoạn code lỗi bảo mật logic:**
    ```typescript
    // Cộng thức ăn dễ dàng bị hack qua LocalStorage
    const currentFood = parseInt(localStorage.getItem('chipstarot_chicken_food') || '0');
    localStorage.setItem('chipstarot_chicken_food', newFood.toString());
    ```
*   **Hậu quả:** Bất kỳ ai có chút kiến thức IT đều có thể sửa biến `creditUsed` hoặc thay đổi trực tiếp `localStorage` để bốc bài AI không giới hạn (gây cạn kiệt ngân sách API của bạn) hoặc hack max level cho thú cưng ngay lập tức.

## 3. Quản lý API Key Động (Đã hoàn thiện ở Phase Frontend) ⚙️
Để giải quyết việc lộ Key, hệ thống đã được cập nhật:
*   **Admin Dashboard:** Thêm tab "Cài đặt" cho phép Admin nhập, test và lưu Gemini API Key trực tiếp vào `localStorage`.
*   **Dynamic Fallback:** Code tại `gemini.ts` ưu tiên đọc key từ Admin, có Blacklist chặn key cũ bị leak, và fallback về `.env` nếu cần.
*   **Xử lý Lỗi API (429 Quota Exceeded):** Ghi nhận thực tế API Key mới bị Google giới hạn `limit: 0` (do tài khoản Free Tier hoặc khu vực). Đã chuyển sang dùng **Gemini 1.5 Flash** để tối ưu hạn mức miễn phí.

## 4. Khuyến nghị Giải pháp & Hành động tiếp theo (Backend) 🛠️

Những vấn đề về Logic Credit và bảo mật tuyệt đối **không thể sửa triệt để ở Frontend**. Đây chính là lý do vì sao dự án **bắt buộc phải có Backend** theo đúng lộ trình ở file `ke_hoach_backend_chipstarot.md`.

**Các bước cần làm ở Phase Backend (C# .NET):**

1.  **Chuyển Logic AI xuống Backend (Phase 3 Backend Plan):**
    *   Tạo API C# .NET: `POST /api/tarot/reading`.
    *   Frontend gọi API này cùng với thông tin trải bài.
    *   Backend nhận Request -> Kiểm tra Token -> Kiểm tra số lượng Credit của User -> **Backend dùng Gemini API Key an toàn** gọi sang Google -> Trừ Credit -> Cập nhật EXP Pet trong DB -> Trả kết quả về Frontend.
2.  **Bảo vệ API Backend (Phase 4 Backend Plan):** Áp dụng **Rate Limiting** (giới hạn request) trên Backend để phòng chống DDoS hoặc spam request.

---
**Kết luận:** Phần giao diện và quản lý cấu hình AI trên Frontend đã **HOÀN THIỆN**. Tuy nhiên, để đảm bảo an toàn tuyệt đối về mặt logic thanh toán (Credit), hệ thống đã sẵn sàng để bàn giao cho đội ngũ Backend C# xây dựng API bảo mật ở bước tiếp theo.
