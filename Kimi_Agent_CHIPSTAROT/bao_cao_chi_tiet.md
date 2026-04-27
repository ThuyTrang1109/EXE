# Phân Tích Chi Tiết Giao Diện (Pages) & Cơ Sở Dữ Liệu (Database) - CHIPSTAROT

Dưới đây là báo cáo phân tích chuyên sâu về hệ thống cơ sở dữ liệu và từng trang giao diện (Page) trong dự án **CHIPSTAROT**, giúp đội ngũ phát triển nắm rõ luồng dữ liệu và thiết kế kiến trúc.

---

## PHẦN 1: PHÂN TÍCH CHI TIẾT CƠ SỞ DỮ LIỆU (DATABASE)

Cơ sở dữ liệu được thiết kế tập trung vào 3 luồng nghiệp vụ chính: **E-commerce (Bán hàng)**, **Dịch vụ Tarot (Premium/Credits)**, và **Vật lý-Số (NFC)**. Hệ thống Database này (cấu trúc trong `schema.sql`) được thiết kế tối ưu hóa để làm việc trơn tru với **Backend C# (ASP.NET Core)** thông qua các ORM phổ biến như Entity Framework Core.

### 1. Luồng Người Dùng & Phân Quyền (Identity & Security)
- **`accounts`**: Bảng gốc lưu thông tin đăng nhập (email, password_hash) và role (Admin/Customer). Tất cả logic Auth sẽ xoay quanh `id` (UUID) của bảng này.
- **`customer_profiles`**: Ràng buộc 1-1 với `accounts`. Lưu thông tin cá nhân (tên, sđt, địa chỉ), các thông tin tâm linh (cung hoàng đạo, con số chủ đạo), và đặc biệt là **`credits`** (lượt bốc bài hiện có).
- **`roles` / `admin_profiles`**: Quản lý cấp độ truy cập cho nhân viên/quản trị viên hệ thống.

### 2. Luồng Sản Phẩm & Mua Sắm (E-Commerce Logistics)
- **`product_categories` / `products`**: Lưu danh mục và thông tin sản phẩm. Bảng `products` hỗ trợ rất nhiều trường mở rộng: `old_price` (hiển thị giảm giá), `stock_quantity` (tồn kho), `nfc_credits_bonus` (số lượt bốc bài tặng kèm khi kích hoạt thẻ NFC của sản phẩm này).
- **`product_reviews`**: Liên kết giữa User và Sản phẩm, lưu trữ số sao (1-5) và bình luận.
- **`carts` / `cart_items`**: Lưu trữ giỏ hàng đang chờ xử lý của người dùng.
- **`orders` / `order_items` / `order_status_history`**: Lưu thông tin đơn hàng sau thanh toán, phí ship, giảm giá, thông tin người nhận. Quản lý trạng thái từ lúc đặt (`pending`) đến lúc giao (`delivered`).
- **`payments`**: Lưu giao dịch thanh toán (có thể mở rộng tích hợp VNPAY/MoMo).

### 3. Luồng Công Nghệ Lõi: NFC & Credits (Phygital)
Đây là "linh hồn" của mô hình kinh doanh CHIPSTAROT:
- **`nfc_chips`**: Mỗi sản phẩm vật lý (ví dụ: Móc khóa Tarot) có 1 thẻ NFC mang `nfc_tag_id` độc nhất. Khi người dùng quét mã, hệ thống kiểm tra bảng này, cập nhật trạng thái `activated_at` và gán vào `account_id`.
- **`credit_transactions`**: Một bảng sổ cái (ledger) cực kỳ quan trọng. Mọi biến động của `credits` trong `customer_profiles` (như được cộng do quét NFC hay bị trừ do bốc bài) đều ghi log tại đây để đối soát.

### 4. Luồng Trải Nghiệm Tarot & AI
- **`tarot_cards`**: Từ điển 78 lá bài Tarot chuẩn (tên, mô tả nghĩa xuôi/ngược, hình ảnh).
- **`tarot_readings` / `reading_details`**: Khi user thực hiện bốc bài, hệ thống lưu lại: chủ đề câu hỏi (`topic`), trạng thái cảm xúc (`mood`), câu hỏi của user (`user_question`), các lá bài bốc trúng (`reading_details`). Quan trọng nhất, nó lưu lại lời giải sinh ra từ AI (`ai_response_story`) để cache lại mà không cần gọi API nhiều lần, tiết kiệm token.

---

## PHẦN 2: PHÂN TÍCH CHI TIẾT CÁC TRANG GIAO DIỆN (PAGES)

Frontend React (`app/src/pages`) được chia thành 12 màn hình chính, bao phủ mọi use-case từ Landing page đến Dashboard Admin.

### 1. Nhóm Trang Khách Hàng Cơ Bản (Customer Core)
- **`HomePage.tsx`**: Landing page giới thiệu dự án. Điểm nhấn là Hero Banner, giới thiệu tính năng "Quét NFC nhận lượt xem", các sản phẩm nổi bật và một số tính năng Tarot Demo.
- **`AuthPage.tsx`**: Chịu trách nhiệm cho Đăng nhập/Đăng ký. Tích hợp chặt chẽ với `AuthContext` để gọi API Supabase. Có thể sẽ mở rộng thêm tính năng quên mật khẩu (`OTP_verifications` trong DB).
- **`ProfilePage.tsx`**: Dashboard của người dùng. Hiển thị:
  - Thông tin hồ sơ tâm linh (Cung hoàng đạo, số chủ đạo).
  - Thống kê (Số dư Credits, Lịch sử xem bài đã lưu, Trạng thái các đơn hàng đã đặt).
  - Nút kích hoạt "Quét mã NFC" thủ công.

### 2. Nhóm Trang Trải Nghiệm Tarot & AI
- **`ReadingPage.tsx`**: Trang cốt lõi của ứng dụng.
  - Chứa logic: Chọn chủ đề -> Nhập tâm trạng -> Bốc bài (1 hoặc 3 lá) -> Trừ 1 Credit thông qua `consumeCredit()` -> Hiện kết quả do AI phân tích.
  - Nếu hết Credit, hệ thống gọi Paywall Modal (chỉ có trong file App.tsx) để dẫn user ra Shop mua vật phẩm.
- **`CardsPage.tsx`**: Trang từ điển Tarot. Hiển thị danh sách 78 lá bài (từ bảng `tarot_cards`), là kho kiến thức để user tham khảo nghĩa xuôi, nghĩa ngược của từng lá.

### 3. Nhóm Trang Mua Sắm (E-Commerce)
- **`ShopPage.tsx`**: Liệt kê các sản phẩm (móc khóa NFC, vật phẩm phong thủy). Có thanh lọc theo Category, sắp xếp theo giá.
- **`ProductDetailPage.tsx`**: Chi tiết một sản phẩm. Hiển thị mô tả, số sao trung bình (từ reviews), cho phép chọn số lượng và nút Add to Cart. Nhấn mạnh việc sản phẩm này sẽ "Tặng kèm X lượt bốc bài".
- **`CartPage.tsx`**: Xem danh sách giỏ hàng, cho phép sửa số lượng, xóa sản phẩm.
- **`CheckoutPage.tsx`**: Điền thông tin giao hàng (họ tên, địa chỉ, sđt) và chọn phương thức thanh toán. Tại đây sẽ gửi data lên bảng `orders` và `order_items`.

### 4. Nhóm Trang Chức Năng Bổ Trợ
- **`BlogPage.tsx`**: Nền tảng Content Marketing, hiển thị các bài viết chia sẻ về tâm linh, ý nghĩa các lá bài, hướng dẫn dùng NFC (truy xuất từ `blog_posts`).
- **`GamePage.tsx`**: Khu vực giải trí (Mini-games) để tăng tương tác và giữ chân người dùng ở lại app lâu hơn.
- **`AdminPage.tsx`**: Trang quản trị hệ thống dành riêng cho Role Admin.
  - Thống kê doanh thu, số lượng đơn hàng, lượng user hoạt động (sử dụng Recharts để vẽ biểu đồ).
  - Quản lý danh sách Đơn hàng (duyệt đơn, đổi trạng thái sang shipped).
  - Quản lý người dùng và Credits.

---
## TỔNG KẾT MỐI LIÊN KẾT & LUỒNG DOANH THU:
Hệ thống **CHIPSTAROT** tạo thành một vòng lặp hoàn hảo cho việc giữ chân và kiếm tiền (Monetization):
1. User trải nghiệm **ReadingPage**, hết Credits -> hệ thống chặn bởi Paywall.
2. User chuyển hướng sang **ShopPage** và có 2 lựa chọn:
   - **Mua sản phẩm vật lý (Móc khóa NFC):** Mua đồ thật, chờ nhận hàng, quét chip trên móc khóa -> **NFCScannerOverlay** bắt sự kiện -> Ghi log vào `credit_transactions` -> Cộng `credits`.
   - **Mua trực tiếp Gói Xem Tarot (Digital Credit/Subscription):** Mua gói lượt bốc bài (VD: Gói 10 lượt, Gói tháng) -> Thanh toán xong hệ thống cộng thẳng `credits` mà không cần giao hàng vật lý.
3. User thanh toán tại **CheckoutPage** -> tạo Order/Payment.
4. User có lại Credits -> Quay về **ReadingPage** tiếp tục vòng lặp bốc bài.
