# KẾ HOẠCH PHÁT TRIỂN BACKEND & DEPLOYMENT CHIPSTAROT

Tài liệu này mô tả chi tiết lộ trình xây dựng và triển khai hệ thống Backend cho dự án CHIPSTAROT, định hướng sử dụng C# (.NET Core) theo kiến trúc Modular Monolith để đảm bảo hiệu năng cao, dễ quản lý và sẵn sàng mở rộng (scale) thành Microservices trong tương lai.

## 1. TECH STACK (CÔNG NGHỆ SỬ DỤNG)
*   **Framework:** ASP.NET Core 8 Web API (Hiệu năng cao, mạnh mẽ, bảo mật tốt).
*   **Database:** PostgreSQL (Tương thích tốt, giữ nguyên từ Supabase hiện tại).
*   **ORM:** Entity Framework Core (EF Core) + Dapper (Dapper tối ưu cho các câu query báo cáo phức tạp của Admin).
*   **Real-time:** SignalR (Xử lý thông báo quét thẻ NFC thành công và cập nhật trạng thái thú cưng realtime).
*   **Background Jobs:** Hangfire hoặc .NET Hosted Service (Thực thi các tác vụ chạy ngầm như tự động reset lượt bốc bài lúc 00:00).
*   **Authentication:** JWT (JSON Web Tokens) kết hợp Refresh Token, mã hóa an toàn.

---

## 2. LỘ TRÌNH PHÁT TRIỂN (4 PHASES)

### Phase 1: Nền tảng (Foundation) & Authentication (1-2 Tuần)
*Mục tiêu: Dựng khung sườn dự án vững chắc, kết nối CSDL và thiết lập hệ thống bảo mật.*
1.  **Cấu trúc dự án:** Thiết lập theo **Clean Architecture** (phân lớp Domain, Application, Infrastructure, WebAPI rõ ràng).
2.  **Database Migration:** Chuyển đổi `schema.sql` hiện tại thành các Entity trong EF Core và thiết lập Code-First Migration.
3.  **Authentication & Authorization:**
    *   Xây dựng API Đăng ký, Đăng nhập. Sinh JWT và Refresh Token (lưu an toàn trong HttpOnly Cookie).
    *   Phân quyền Role-based (Phân tách rõ ràng luồng User thường và Admin `role_id=1`).
4.  **Cross-cutting Concerns:**
    *   Cấu hình Serilog để quản lý log hệ thống.
    *   Thiết lập Global Exception Handler (chuẩn hóa format lỗi trả về JSON).
    *   Thiết lập chính sách CORS chặt chẽ (chỉ cho phép domain Frontend gọi API).

### Phase 2: Core Business (E-commerce & NFC) (2 Tuần)
*Mục tiêu: Đảm bảo luồng mua hàng cốt lõi và định danh thẻ vật lý hoạt động trơn tru.*
1.  **Module Product & Order:** 
    *   Cung cấp API CRUD Sản phẩm, Quản lý giỏ hàng.
    *   Xử lý luồng Checkout (Lưu địa chỉ giao hàng 3 cấp, SĐT).
2.  **Module NFC (Cốt lõi Phygital):** 
    *   API sinh mã định danh NFC cho xưởng sản xuất.
    *   **Logic trọng tâm:** API nhận diện quét NFC. Kiểm tra tính hợp lệ của thẻ -> Kích hoạt thẻ (Trạng thái Active) -> Kích hoạt gói quyền lợi "Cộng 3 lượt/ngày × 6 tháng" cho User tương ứng.

### Phase 3: The "Magic" (AI Tarot & Pet Game) (2 Tuần)
*Mục tiêu: Xây dựng "linh hồn" của ứng dụng, giữ chân người dùng.*
1.  **Module Tarot & AI:**
    *   Tích hợp SDK/HTTP Client kết nối **Gemini API**.
    *   Thiết lập cơ chế bảo mật API Key của Gemini cực kỳ nghiêm ngặt tại Backend.
    *   Logic trừ Credit khi bốc bài. Implement cơ chế Rollback (hoàn lại Credit) nếu AI gặp sự cố không trả lời được.
2.  **Module Magic Garden (Game Hóa):**
    *   Thuật toán tính toán EXP khi quét thẻ hoặc bốc bài.
    *   API cập nhật trạng thái Pet (Tăng level, Cho ăn, Tính toán chỉ số Vui vẻ/Đói).
3.  **Background Jobs (Tác vụ ngầm):**
    *   Viết Background Worker (Hosted Service) tự động kích hoạt vào lúc **00:00:00** mỗi ngày để reset/cộng lại số lượt bốc bài cho người dùng có thẻ NFC Active.

### Phase 4: Admin Dashboard & Tối ưu hóa (1 Tuần)
*Mục tiêu: Cung cấp công cụ quản trị dữ liệu mạnh mẽ và sẵn sàng Deploy.*
1.  **Admin APIs:** API thống kê doanh thu, biểu đồ tăng trưởng người dùng, trạng thái thẻ NFC (Sử dụng Dapper để query dữ liệu lớn với tốc độ cao).
2.  **Security & Performance:**
    *   Áp dụng **Rate Limiting** (Giới hạn truy cập: ví dụ 5 requests/phút cho API AI) để chống spam, tránh cạn kiệt ngân sách API Gemini.
    *   Sử dụng Caching (Redis/In-Memory) cho các dữ liệu ít thay đổi (VD: Danh sách 78 lá bài Tarot, Danh mục sản phẩm).

---

## 3. CHIẾN LƯỢC DEPLOYMENT (TỐI ƯU CHI PHÍ & SCALE)

Chiến lược chủ đạo: **"Dockerize mọi thứ"** để ứng dụng có thể chạy trên mọi nền tảng Cloud mà không bị Vendor Lock-in.

### Giai đoạn 1: MVP & Beta Testing (Tối ưu chi phí)
*Phù hợp cho giai đoạn test nội bộ và Launch V1.*
*   **Mã nguồn / CI-CD:** Tích hợp **GitHub Actions**. Tự động chạy Test, Build Docker Image và Deploy mỗi khi có code mới trên nhánh `main`.
*   **Database:** Tiếp tục sử dụng gói miễn phí của **Supabase** (PostgreSQL) hoặc Render.
*   **Backend Hosting:** Sử dụng **Render.com**, **Railway.app** hoặc thuê một VPS Linux (DigitalOcean / Hetzner) (khoảng $5/tháng). Setup Docker để chạy Container Backend.
*   **Frontend:** Deploy tĩnh lên Vercel, Netlify hoặc GitHub Pages.

### Giai đoạn 2: Scale up cho Production (Sẵn sàng tải cao)
*Khi ứng dụng có dòng tiền và lượng truy cập lớn.*
*   **Kiến trúc Cloud:** Chuyển đổi lên **AWS** (Amazon Web Services) hoặc **Azure**.
*   **Cơ sở dữ liệu:** Nâng cấp lên AWS RDS (PostgreSQL) để có tính năng tự động Backup, Multi-AZ (chống down server).
*   **File Storage:** Chuyển toàn bộ hình ảnh (Pet, Sản phẩm, Bài Tarot) lên AWS S3, phân phối qua mạng lưới CDN (CloudFront) để tối ưu tốc độ tải trang cho người dùng toàn cầu.
*   **Bảo mật:** Sử dụng **Cloudflare** làm Proxy phía trước để chống tấn công DDoS, mã hóa SSL/HTTPS và ẩn IP thật của Backend.

---

## 4. CHECKLIST BẮT BUỘC TRƯỚC KHI BE GO-LIVE 🚨

- [ ] **Môi trường (Enviroment Variables):** Toàn bộ JWT Secret, Gemini API Key, Chuỗi kết nối DB phải lưu trong file `.env` hoặc Secret Manager (Azure Key Vault / AWS Secrets). TUYỆT ĐỐI không hardcode trong source code.
- [ ] **Idempotency (Tính bất biến):** Đảm bảo API quét thẻ NFC chỉ kích hoạt 1 lần duy nhất trên 1 thẻ, loại trừ hoàn toàn rủi ro spam click hoặc network lỗi gửi 2 lần.
- [ ] **Rate Limiting:** Bảo vệ nghiêm ngặt API gọi Gemini, tránh bị lợi dụng làm sập hạn mức API.
- [ ] **Database Transaction:** Áp dụng nguyên tắc Transaction chặt chẽ cho luồng mua hàng và trừ Credit (Tiến hành trừ tiền/credit -> Lưu lịch sử). Nếu có lỗi ở bất kỳ bước nào, toàn bộ chuỗi thao tác phải được Rollback.
- [ ] **CORS Policy:** Đảm bảo chỉ có các Domain hợp lệ (Ví dụ: `https://chipstarot.com`) mới được phép gọi API.
