# Báo Cáo Tổng Quan Dự Án CHIPSTAROT

## 1. Tổng Quan Dự Án (Project Overview)
**CHIPSTAROT** là một ứng dụng web kết hợp giữa thương mại điện tử (bán các vật phẩm tâm linh, móc khóa) và trải nghiệm xem Tarot trực tuyến. Điểm nổi bật của dự án là việc tích hợp công nghệ **NFC (Near-Field Communication)**: khi người dùng mua các sản phẩm vật lý (như móc khóa NFC) và quét chúng, họ sẽ nhận được "credits" (lượt bốc bài) để thực hiện các phiên trải bài Tarot trực tuyến.

## 2. Công Nghệ Sử Dụng (Tech Stack)
### Frontend
- **Framework:** React 19 (với Vite làm module bundler)
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS, kết hợp với các component từ Radix UI và Lucide React cho icons.
- **State Management & Routing:** Quản lý state cục bộ kết hợp với Context API (`AuthContext`) và routing đơn giản qua window history.
- **Form & Validation:** React Hook Form và Zod.

### Backend & Cơ Sở Dữ Liệu
- **Backend Framework:** C# (ASP.NET Core API). Hệ thống API thực tế (tầng xử lý logic nghiệp vụ, quản lý đơn hàng, trừ điểm credits,...) sẽ được phát triển hoàn toàn bằng **C#**.
- **Cơ sở dữ liệu:** PostgreSQL hoặc SQL Server. File `schema.sql` hiện tại được viết theo chuẩn PostgreSQL, hoàn toàn tương thích để dùng chung với Entity Framework Core (EF Core) hoặc Dapper trong C#.
- **Lưu ý về Frontend hiện tại:** Các file như `supabase.ts` hay logic gọi DB trực tiếp từ React hiện đang đóng vai trò làm *Mockup/Demo (Giả lập)* để thiết kế và test hoàn chỉnh luồng UI/UX. Khi BE C# hoàn thiện, Frontend sẽ chuyển sang gọi các API endpoints RESTful bằng Axios/Fetch.

## 3. Phân Tích Cơ Sở Dữ Liệu (Database Schema)
Hệ thống cơ sở dữ liệu được thiết kế chặt chẽ trên PostgreSQL (Supabase) với 8 phân vùng chính:
1. **Phân Vùng Tiện Ích & Bảo Mật:** Quản lý Roles (`roles`), OTP (`otp_verifications`), gói đăng ký (`subscription_plans`), và thông báo (`notifications`).
2. **Phân Vùng Danh Tính:** Quản lý tài khoản (`accounts`), hồ sơ khách hàng (`customer_profiles`), và hồ sơ quản trị viên (`admin_profiles`).
3. **Phân Vùng Premium:** Quản lý các gói đăng ký trả phí của người dùng (`user_subscriptions`).
4. **Phân Vùng Sản Phẩm & Đánh Giá:** Lưu trữ danh mục (`product_categories`), sản phẩm (`products`), đánh giá (`product_reviews`), và đặc biệt là quản lý chip NFC (`nfc_chips`) liên kết giữa sản phẩm vật lý và phần mềm.
5. **Phân Vùng Bán Hàng & Khuyến Mãi:** Quản lý mã giảm giá (`vouchers`), giỏ hàng (`carts`, `cart_items`), đơn hàng (`orders`, `order_items`), thanh toán (`payments`), và banner quảng cáo (`hero_banners`).
6. **Phân Vùng Tarot & AI:** Quản lý danh sách các lá bài Tarot (`tarot_cards`), lịch sử các phiên trải bài (`tarot_readings` - có lưu thông tin prompt AI và đánh giá), và chi tiết từng lá trong phiên (`reading_details`).
7. **Phân Vùng Nội Dung:** Nền tảng cho blog/bài viết (`blog_posts`).
8. **Phân Vùng Phân Tích & Theo Dõi:** Theo dõi lịch sử trạng thái đơn hàng (`order_status_history`) và dòng chảy tín dụng/credits (`credit_transactions`).

## 4. Phân Tích Frontend (Architecture)
### Cấu trúc thư mục (`app/src/`)
- `components/`: Chứa các UI Component dùng chung (Header, Footer, NFCScannerOverlay...).
- `pages/`: Chứa giao diện các màn hình chính (HomePage, ShopPage, CartPage, ReadingPage, GamePage, AdminPage, AuthPage, ProfilePage, v.v.).
- `lib/`: Chứa logic nghiệp vụ cốt lõi, đặc biệt là kết nối Supabase (`supabase.ts`) và Quản lý xác thực/Credits (`AuthContext.tsx`).
- `hooks/`, `data/`: Các tiện ích và dữ liệu giả lập.

### Luồng Hoạt Động Cốt Lõi
- **Quản lý Định Tuyến (Routing):** Thay vì sử dụng react-router-dom, dự án hiện đang triển khai một bộ định tuyến tùy chỉnh nhẹ dựa trên trạng thái `page` trong `App.tsx` kết hợp với `window.history.pushState`.
- **Xác Thực Người Dùng (Authentication):** Được xử lý thông qua `AuthContext` kết nối với Supabase Auth. Hỗ trợ 2 chế độ:
  - *Demo Mode:* Cho phép duyệt app với dữ liệu giả lập lưu trong `localStorage` khi chưa cấu hình Supabase.
  - *Production Mode:* Xác thực thực tế qua Supabase, lấy thông tin hồ sơ và số dư credits.
- **Hệ Sinh Thái Credits & Mua Sắm (Monetization):**
  - Lượt bốc bài (credits) là đơn vị tiền tệ chính trong app để sử dụng dịch vụ Tarot.
  - Người dùng có 2 cách để nạp Credits:
    1. **Mua vật phẩm vật lý (Móc khóa NFC):** Mua hàng, chờ nhận hàng, sau đó quét chip NFC (`NFCScannerOverlay`) để được cộng lượt. Tham số `?tagId=` trên URL sẽ tự động kích hoạt overlay.
    2. **Mua gói xem Tarot (Digital Credits):** Mua gói nạp lượt bốc bài trực tiếp (ví dụ 10 lượt, 50 lượt) trên Shop, thanh toán xong được cộng ngay vào tài khoản mà không cần chờ giao hàng.
- **Mua Sắm & Giỏ Hàng:** Hệ thống e-commerce hỗ trợ bán cả Sản phẩm vật lý (cần địa chỉ giao hàng) và Sản phẩm số (gói Tarot, nạp thẳng). Lưu trữ giỏ hàng trong `localStorage`, và thanh toán.

## 5. Đánh Giá & Định Hướng
- **Ưu điểm:** Kiến trúc sạch sẽ, tích hợp công nghệ vật lý-số (Phygital) sáng tạo thông qua NFC. Cơ sở dữ liệu thiết kế rất đầy đủ cho một nền tảng mở rộng trong tương lai. Giao diện mang lại trải nghiệm hiện đại.
- **Tiềm năng phát triển:** Có thể mở rộng tích hợp thanh toán thực tế (Payment Gateway), hoàn thiện Admin Dashboard với các biểu đồ phân tích, và nâng cấp logic AI tạo lời giải Tarot sâu sắc hơn.
