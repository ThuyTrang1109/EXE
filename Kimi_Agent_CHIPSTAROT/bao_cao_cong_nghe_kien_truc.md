# 📋 BÁO CÁO CÔNG NGHỆ, KIẾN TRÚC & HOẠT ĐỘNG DỰ ÁN CHIPSTAROT

**Dự án:** CHIPSTAROT - Nền tảng Tarot Phygital (Vật lý kết hợp Số)
**Ngày lập:** 09/05/2026
**Mục tiêu:** Cung cấp cái nhìn toàn diện về công nghệ sử dụng, cấu trúc mã nguồn và luồng hoạt động nghiệp vụ của toàn bộ hệ thống.

---

## 1. TỔNG QUAN CÔNG NGHỆ (TECHNOLOGY STACK)

Hệ thống CHIPSTAROT được xây dựng theo kiến trúc **Client-Server** hiện đại, phân tách rõ ràng giữa Frontend và Backend, kết hợp với các dịch vụ đám mây tiên tiến.

### 1.1. Frontend (Giao diện người dùng)
Được tối ưu hóa cho trải nghiệm Web/Mobile Web, tập trung vào UI/UX mượt mà và hiệu ứng đẹp mắt.
*   **Framework cốt lõi:** React 19.2.0
*   **Ngôn ngữ:** TypeScript (~5.9.3) đảm bảo type-safety.
*   **Build Tool:** Vite 7.2 (tốc độ build cực nhanh).
*   **Styling & UI:** TailwindCSS 3.4, Radix UI (Unstyled Primitives), Lucide React (Icons).
*   **State Management & Routing:** React Router v7, React Hook Form (quản lý form) + Zod (validation).
*   **Data Visualization:** Recharts (dùng cho Admin Dashboard).

### 1.2. Backend (Máy chủ xử lý logic)
Sử dụng **Clean Architecture** để đảm bảo khả năng mở rộng, dễ bảo trì và test.
*   **Framework:** ASP.NET Core 9 Web API (C#).
*   **ORM:** Entity Framework Core (EF Core) 9.
*   **Xác thực (Authentication):** JWT Bearer Tokens (JSON Web Tokens).
*   **Bảo mật:** Rate Limiting (chống spam AI & Brute force), CORS policy.

### 1.3. Cơ Sở Dữ Liệu (Database)
*   **Hệ quản trị:** PostgreSQL 15 (triển khai trên NeonDB hoặc dịch vụ tương đương).
*   **Thiết kế:** Lược đồ CSDL chuẩn hóa với 22 bảng chính, chia thành 9 phân vùng (Bảo mật, Tài khoản, Sản phẩm, Bán hàng, Tarot, Game, v.v.), tích hợp 17 Indexes để tối ưu hiệu năng truy vấn.

### 1.4. Công Nghệ Tích Hợp (Third-party & Hardware)
*   **Trí tuệ nhân tạo (AI):** Google Gemini Pro/Flash API (@google/generative-ai) dùng để giải nghĩa bài Tarot cá nhân hóa.
*   **Công nghệ phần cứng:** Chip NFC NTAG213/215 (gắn trong móc khóa đá phong thủy).
*   **Thanh toán:** Tích hợp SDK VNPAY, MoMo (dự kiến trong pha thanh toán).

---

## 2. CẤU TRÚC DỰ ÁN (PROJECT STRUCTURE)

Dự án được chia làm 2 thư mục chính độc lập: `app` (Frontend) và `backend` (Backend).

### 2.1. Cấu Trúc Frontend (`/app`)
Áp dụng mô hình Component-based:
```text
app/src/
├── components/       # Các UI Component dùng chung (Header, Footer, NFCScannerOverlay)
├── data/             # Dữ liệu tĩnh (constants.ts - chứa danh sách thẻ, gói credits)
├── hooks/            # Custom React hooks (use-mobile.ts)
├── lib/              # Logic cốt lõi & Utils
│   ├── AuthContext.tsx # Quản lý trạng thái đăng nhập & Reset lượt bốc bài ngày
│   ├── gemini.ts       # Service gọi API AI Gemini
│   ├── supabase.ts     # (Tạm thời) Client kết nối DB / Logic xử lý dữ liệu Frontend
│   └── utils.ts        # Các hàm tiện ích (format tiền, ngày tháng...)
├── pages/            # Chứa 14 trang chính của ứng dụng
│   ├── HomePage.tsx, AuthPage.tsx, ReadingPage.tsx (Luồng bốc bài)
│   ├── ShopPage.tsx, ProductDetailPage.tsx, CartPage.tsx, CheckoutPage.tsx (Thương mại)
│   ├── ProfilePage.tsx, GamePage.tsx (Thú ảo), AdminPage.tsx (Quản trị)
├── App.tsx           # Khởi tạo Router chính, Paywall và NFC Listener
└── index.css         # Global CSS và Animations
```

### 2.2. Cấu Trúc Backend (`/backend/src`)
Áp dụng **Clean Architecture** (Kiến trúc củ hành):
```text
backend/src/
├── ChipStarot.Domain/          # Tầng Lõi: Chứa Entities (Models DB), Interfaces, Exceptions. (Không phụ thuộc vào bất cứ tầng nào).
├── ChipStarot.Application/     # Tầng Nghiệp Vụ: Chứa Use Cases, DTOs, Services interface, Logic (Ví dụ: logic trừ tiền, cộng exp).
├── ChipStarot.Infrastructure/  # Tầng Cơ Sở Hạ Tầng: Triển khai EF Core DbContext, Migrations, Background Jobs (reset lượt mỗi ngày), gọi External APIs (Gemini).
└── ChipStarot.WebAPI/          # Tầng Trình Diễn (Entry Point): Chứa Controllers, Program.cs (cấu hình DI, JWT, Swagger, CORS, Rate Limiting).
```

---

## 3. CÁCH THỨC HOẠT ĐỘNG (HOW IT WORKS)

Nền tảng vận hành qua sự phối hợp của 4 luồng nghiệp vụ chính:

### 3.1. Luồng Trải Nghiệm "Phygital" (NFC)
Đây là điểm chạm khác biệt nhất của dự án (Kết hợp Vật lý và Số):
1. **Sản xuất:** Admin dùng thiết bị (như ACR122U) để ghi URL có mã định danh (vd: `https://chipstarot.com/?tagId=NFC-1234`) vào chip NFC trong sản phẩm (móc khóa).
2. **Kích hoạt:** Khách hàng mua móc khóa, dùng điện thoại chạm vào chip.
3. **Xử lý:** Điện thoại tự mở trình duyệt. Ứng dụng React nhận diện tham số `?tagId=` trên URL, hiện popup xác nhận.
4. **Phản hồi:** Hệ thống kiểm tra mã trên Database. Nếu hợp lệ và chưa kích hoạt, user được cộng gói "3 lượt/ngày trong 6 tháng". Mã NFC chuyển trạng thái `activated`.

### 3.2. Vòng Đời Lượt Bốc Bài (Credits Lifecycle)
Quản lý quyền lợi của người dùng để tạo doanh thu (Subscription Model):
*   **Hạn mức ngày (`daily_allowance`):** Số lượt tối đa được cấp mỗi ngày (dựa trên gói hoặc NFC đang sở hữu).
*   **Số lượt hiện tại (`credits`):** Số lượt thực tế còn lại trong ngày để sử dụng.
*   **Reset hàng ngày:**
    *   *Backend:* Một Background Job (như `DailyCreditsResetJob.cs`) chạy vào 00:00 mỗi ngày.
    *   *Logic:* Nếu tài khoản còn hạn (`credits_expires_at > now`), hệ thống reset `credits = daily_allowance`.
*   **Tiêu dùng:** Mỗi lần bốc bài, hệ thống kiểm tra và trừ 1 credit bằng thao tác Atomic (Update ... where credits > 0) để tránh lỗi đa luồng (race condition).
*   **Hết hạn:** Khi hết gói, người dùng gặp Paywall và được điều hướng sang `/shop` để mua Gói Lượt (Bằng VNPAY/MoMo).

### 3.3. Luồng Bốc Bài Tarot bằng AI (Gemini Reading Flow)
1. **Thu thập dữ liệu (ReadingPage):** User chọn Chủ đề (Tình yêu, Sự nghiệp...), chọn Câu hỏi gợi ý hoặc tự nhập, sau đó chọn số lượng bài (1 hoặc 3 lá).
2. **Rút bài:** Hệ thống Random sinh ra các lá bài (kèm chiều xuôi/ngược) cùng hiệu ứng lật bài mượt mà.
3. **Xây dựng Prompt:** Thông tin (Tên user, Chủ đề, Câu hỏi, Tên lá bài, Chiều) được tổng hợp thành một Prompt cấu trúc chuẩn.
4. **Gọi AI:** Gửi Prompt đến Google Gemini. API sẽ trả về câu trả lời đóng vai "Vũ trụ", phân tích ý nghĩa kết hợp với hoàn cảnh của user.
5. **Ghi nhận:** Kết quả được lưu vào Lịch sử (bảng `tarot_readings`) và người dùng nhận điểm Kinh nghiệm (EXP) cho Thú ảo.

### 3.4. Hệ Thống Gamification (Khu Vườn Phép Thuật)
*   Để giữ chân người dùng truy cập hàng ngày (Retention), hệ thống tích hợp game nuôi thú ảo.
*   **Logic:** Mỗi lần bốc bài Tarot -> Tăng EXP. Đăng nhập hàng ngày -> Tặng thức ăn (Food).
*   Thú ảo có 5 cấp độ tiến hóa. Mọi trạng thái (exp, cấp độ) được lưu vào bảng `customer_profiles` và đồng bộ qua API `syncPetProgress`.

---

**TỔNG KẾT:**
CHIPSTAROT sở hữu một kiến trúc vững chắc, chia tách rõ ràng trách nhiệm. Việc dùng React/Vite cho tốc độ và UI/UX xuất sắc ở Frontend, kết hợp sức mạnh của C# .NET + PostgreSQL ở Backend đảm bảo tính ổn định, bảo mật và khả năng xử lý hàng vạn yêu cầu đọc bài Tarot cùng lúc. Mảnh ghép NFC và AI đóng vai trò "cú đấm thép" tạo nên sự độc đáo của sản phẩm.
