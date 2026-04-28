# BÁO CÁO TỔNG HỢP CHI TIẾT DỰ ÁN CHIPSTAROT

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
**CHIPSTAROT** là một hệ thống ứng dụng web kết hợp thương mại điện tử (bán các sản phẩm tâm linh, móc khóa) và dịch vụ giải trí (trải bài Tarot trực tuyến bằng AI). Điểm đột phá của dự án là việc áp dụng công nghệ **NFC (Phygital - Physical + Digital)**: người dùng mua móc khóa vật lý, sau đó quét chip NFC để nhận "credits" (lượt bốc bài) trên nền tảng số. 

Dự án hiện đang trong quá trình phát triển, với phần Frontend đã thành hình và đang sử dụng mock data / Supabase làm phương án thay thế tạm thời trong lúc chờ Backend chính thức (ASP.NET Core) hoàn thiện.

---

## 2. HIỆN TRẠNG CẤU TRÚC THƯ MỤC (DIRECTORY STRUCTURE)
Sau khi kiểm tra toàn bộ thư mục gốc của dự án, hệ thống lưu trữ được chia thành 3 phần chính:

### 2.1. Thư mục `app/` (Ứng dụng React Frontend)
Đây là cốt lõi của dự án hiện tại, được khởi tạo bằng **React 19, TypeScript, Vite**.
- **`src/pages/`**: Chứa 12 màn hình giao diện chính (HomePage, ReadingPage, ShopPage, AuthPage, AdminPage, v.v.).
- **`src/components/`**: Chứa các component dùng chung như `Header.tsx`, `Footer.tsx` và `NFCScannerOverlay.tsx` (hiệu ứng quét thẻ NFC).
- **`src/lib/`**: Chứa các thiết lập core:
  - `supabase.ts`: Kết nối Database, chứa các logic quan trọng (kiểm tra hạn dùng lượt bốc bài, xử lý cộng trừ credit khi mua gói/quét NFC/bốc bài).
  - `AuthContext.tsx`: Quản lý trạng thái phiên đăng nhập (Session) và quyền người dùng.
- **`src/App.tsx`**: File root của ứng dụng, hiện đang đảm nhận vai trò quản lý Router thủ công (thông qua State `page` và `window.history.pushState`) thay vì sử dụng thư viện thứ ba. Ngoài ra còn chứa logic chặn người dùng nếu hết Credits (Paywall).

### 2.2. Tệp `schema.sql` (Thiết kế Cơ sở dữ liệu)
Là bản thiết kế chi tiết (DDL) của hệ thống cơ sở dữ liệu (PostgreSQL/SQL Server), bao phủ 8 phân vùng:
- **Người dùng & Phân quyền**: `accounts`, `customer_profiles`, `roles`.
- **Thương mại điện tử**: `products`, `product_categories`, `orders`, `order_items`, `carts`, `payments`.
- **Premium & Tín dụng**: `nfc_chips` (lưu trữ mã tag), `credit_transactions` (sổ cái biến động số dư), `credit_package_purchases`.
- **Tarot**: `tarot_cards`, `tarot_readings`, `reading_details` (lưu cả phản hồi của AI).

### 2.3. Thư mục `chipstarot-static/`
Chứa các tệp HTML và tài nguyên tĩnh (hình ảnh bài Tarot, banner, mockup dữ liệu JSON) có thể được dùng làm bản thử nghiệm tĩnh hoặc nguồn tư liệu cũ trước khi chuyển sang React.

---

## 3. PHÂN TÍCH LUỒNG NGHIỆP VỤ CỐT LÕI (CORE BUSINESS FLOW)
Hệ thống xoay quanh một vòng lặp "Tiêu dùng - Nạp năng lượng" rất rõ ràng:

1. **Trải nghiệm Tarot (Tiêu thụ Credits):** Tại `ReadingPage`, mỗi khi người dùng bốc bài, hệ thống sẽ gọi hàm `consumeUserCredit`. Nếu `credits <= 0` hoặc đã hết hạn (`credits_expires_at`), giao diện sẽ hiển thị **Paywall** yêu cầu nạp thêm.
2. **Nạp Lượt Bốc Bài (Monetization):**
   - **Cách 1 - Mua hàng vật lý (NFC):** Người dùng vào `ShopPage` mua móc khóa. Khi nhận hàng, quét NFC. App bắt tham số `?tagId=` trên URL, mở `NFCScannerOverlay`, cộng lượt bốc bài **vô thời hạn**.
   - **Cách 2 - Mua gói số (Digital Package):** Thanh toán trực tiếp tại Shop để nạp lượt bốc bài (ví dụ 10 lượt / 7 ngày). Lượt này **có thời hạn sử dụng**.
3. **Thanh toán & Đơn hàng:** Hệ thống e-commerce tại `CartPage` và `CheckoutPage` quản lý quá trình mua, lưu vào `orders` và `payments`.

---

## 4. CÔNG NGHỆ VÀ THƯ VIỆN ĐANG SỬ DỤNG
- **UI/UX:** **Tailwind CSS** kết hợp với **Radix UI Primitives** (như Accordion, Dialog, Slider...) và **Lucide React** cho các icon.
- **Data Fetching/State:** React State/Context cho quản lý cục bộ. `localStorage` được tận dụng để lưu Giỏ hàng (`chipstarot_cart`).
- **Biểu đồ:** **Recharts** được dùng trong `AdminPage` để hiển thị báo cáo.
- **Form:** `react-hook-form` và `zod` để validate dữ liệu đầu vào.
- **Bảo mật & Backend Mockup:** **Supabase JS** đang được tích hợp để giả lập Database và Auth (`supabase.ts`).

---

## 5. ĐÁNH GIÁ VÀ ĐỀ XUẤT (RECOMMENDATIONS)
Dự án có nền tảng cấu trúc rất tốt, code sạch sẽ và có tính tái sử dụng cao. Tuy nhiên, để tiến lên môi trường Production thực tế, có một số điểm cần lưu ý:

1. **Kiến trúc Router:** Hiện tại `App.tsx` đang quản lý Router thông qua Custom State (render Component theo tên Page). Khi ứng dụng lớn hơn (nhiều Params, Nested Routes), việc này sẽ gây khó khăn. **Đề xuất:** Cấu hình chính thức `react-router-dom` (đã có trong `package.json`) để tận dụng tính năng định tuyến chuẩn và Lazy Loading.
2. **Bảo mật API (Backend):** File `supabase.ts` đang gọi trực tiếp lên DB từ Client-side. Đối với dữ liệu nhạy cảm như điểm `credits` hay đơn hàng, việc chuyển đổi sang gọi RESTful API từ Backend **ASP.NET Core** (như trong kế hoạch) là bắt buộc.
3. **Tích hợp Cổng thanh toán (Payment Gateway):** Cần thiết lập tích hợp VNPAY/MoMo cho các giao dịch trong `CheckoutPage` và webhook lắng nghe trạng thái để tự động cập nhật đơn hàng/credits.
4. **Tối ưu Hóa Hình ảnh:** Thư mục ảnh khá nặng (VD: `card-back.png` lên tới 3.7MB trong bản static). Cần áp dụng các chuẩn nén (WebP/AVIF) trước khi public.

**Kết luận:** Hệ thống CHIPSTAROT có ý tưởng "Phygital" độc đáo và đã có nền móng giao diện (React) + kiến trúc dữ liệu (`schema.sql`) vững chắc. Bước tiếp theo tập trung vào việc hoàn thiện API Backend C# và thay thế các luồng Mock Data trên UI.
