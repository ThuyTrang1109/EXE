# 🗺️ KẾ HOẠCH TRIỂN KHAI TOÀN DIỆN - DỰ ÁN CHIPSTAROT

> **Mục đích:** Đây là kế hoạch chi tiết từng bước để cấu hình, triển khai (Deploy), kiểm thử (Test) và bảo trì (Maintain) toàn bộ hệ thống CHIPSTAROT lên môi trường Production thực tế trên Internet.

---

## 📋 TỔNG QUAN KIẾN TRÚC TRIỂN KHAI

```
[Người dùng]
      │
      │ HTTPS
      ▼
[Vercel] ─── React Frontend (Vite) ─── chipstarot.vercel.app
      │
      │ API Calls (HTTPS/JSON)
      ▼
[Render.com] ─── .NET 9.0 Web API ─── chipstarot-api.onrender.com
      │
      │ PostgreSQL Connection
      ▼
[Supabase] ─── PostgreSQL Database ─── Singapore Region
      │
      │ (NFC vật lý)
      ▼
[Thẻ NFC Cứng] ─── URL redirect ─── chipstarot.vercel.app/nfc/{ID}
```

**Stack công nghệ triển khai:**
| Layer | Công nghệ | Nền tảng Deploy | Gói sử dụng |
|---|---|---|---|
| Frontend | React 18 + Vite | Vercel | Free |
| Backend | .NET 9.0 Web API | Render.com | Free / Starter $7/tháng |
| Database | PostgreSQL 15 | Supabase | Free (500MB) |
| AI | Google Gemini API | Google Cloud | Pay-as-you-go |
| CDN / SSL | Cloudflare (tùy chọn) | Cloudflare | Free |

---

## GIAI ĐOẠN 1: CHUẨN BỊ TÀI KHOẢN & HẠ TẦNG
**Thời gian ước tính:** ~1 tiếng

### 1.1 Tạo tài khoản các dịch vụ

**Supabase (Database):**
- [ ] Đăng ký tại https://supabase.com
- [ ] Tạo Project mới → Đặt tên `chipstarot-prod`
- [ ] Chọn Region: **Singapore** (ap-southeast-1) để tối ưu tốc độ VN
- [ ] Đặt Database Password mạnh (lưu lại, không được quên)
- [ ] Vào **Project Settings > Database > Connection String**
- [ ] Chọn tab **URI**, copy chuỗi kết nối (có dạng `postgresql://postgres.xxx:password@host/postgres`)

**Google Gemini AI:**
- [ ] Truy cập https://aistudio.google.com/app/apikey
- [ ] Click **"Create API Key"**
- [ ] Lưu chuỗi `AIzaSy...` vào file an toàn

**Render.com (Backend Hosting):**
- [ ] Đăng ký tại https://render.com (có thể login bằng GitHub)

**Vercel (Frontend Hosting):**
- [ ] Đăng ký tại https://vercel.com (login bằng GitHub để tự động deploy)

**GitHub (Source Control):**
- [ ] Tạo Repo mới (Public hoặc Private) → Tên: `chipstarot`
- [ ] Push toàn bộ source code lên GitHub

---

## GIAI ĐOẠN 2: CẤU HÌNH BIẾN MÔI TRƯỜNG (Environment Variables)
**Thời gian ước tính:** ~30 phút

### 2.1 Danh sách biến môi trường cần chuẩn bị

| Biến | Giá trị ví dụ | Ghi chú |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | `Host=aws-0...;Port=6543;Database=postgres;Username=postgres.xxx;Password=abc123` | Lấy từ Supabase |
| `Jwt__Secret` | `ChipStarot@2025!SuperSecretKey32Chars+` | Tự đặt, tối thiểu 32 ký tự |
| `Jwt__Issuer` | `chipstarot-api` | Giữ nguyên |
| `Jwt__Audience` | `chipstarot-app` | Giữ nguyên |
| `Gemini__ApiKey` | `AIzaSy...` | Lấy từ Google AI Studio |
| `Cors__AllowedOrigins__0` | `https://chipstarot.vercel.app` | URL Frontend sau khi deploy |
| `Email__SmtpHost` | `smtp.gmail.com` | Nếu dùng Gmail |
| `Email__FromEmail` | `noreply@chipstarot.com` | Email gửi đi |
| `Email__FromPassword` | `xxxx xxxx xxxx xxxx` | Gmail App Password (16 ký tự) |

> [!WARNING]
> **KHÔNG BAO GIỜ** commit các biến này vào Git. Chỉ đặt chúng trong Dashboard của Render và Vercel.

### 2.2 Chuẩn bị file `.env` local

Tạo file `app/.env.local` (cho Frontend local):
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Tạo file `backend/.env` (cho Backend local):
```
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=chipstarot_db;...
Jwt__Secret=local-dev-secret-at-least-32-chars-ok
Gemini__ApiKey=AIzaSy...
```

---

## GIAI ĐOẠN 3: TRIỂN KHAI DATABASE (Supabase)
**Thời gian ước tính:** ~20 phút

### 3.1 Khởi tạo Schema Database

**Phương án A (Khuyến nghị - Tự động qua BE):**
- [ ] Chạy BE local một lần với Connection String trỏ vào Supabase
- [ ] Backend sẽ tự gọi `context.Database.Migrate()` trong `Program.cs` và tạo toàn bộ bảng tự động
- [ ] Kiểm tra trên Supabase Dashboard > Table Editor → Phải thấy các bảng: `Accounts`, `CustomerProfiles`, `TarotCards`, `TarotReadings`, `PetGameLogs`, `NfcCards`, `Orders`...

**Phương án B (Thủ công):**
- [ ] Chạy lệnh từ thư mục `backend/src/ChipStarot.WebAPI`: 
  `dotnet ef database update --connection "chuoi-ket-noi-supabase"`

### 3.2 Seed dữ liệu ban đầu

- [ ] Chèn 78 lá bài Tarot vào bảng `TarotCards` (từ file SQL hoặc qua Admin Dashboard sau khi deploy)
- [ ] Tạo tài khoản Admin đầu tiên (hoặc đăng ký bình thường rồi set Role = `Admin` trực tiếp trong Supabase)

---

## GIAI ĐOẠN 4: TRIỂN KHAI BACKEND (.NET 9.0 lên Render.com)
**Thời gian ước tính:** ~45 phút (bao gồm thời gian build)

### 4.1 Chuẩn bị Dockerfile

Đảm bảo file `backend/Dockerfile` tồn tại với nội dung multi-stage build:
- Stage `build`: dùng `mcr.microsoft.com/dotnet/sdk:9.0`
- Stage `final`: dùng `mcr.microsoft.com/dotnet/aspnet:9.0`
- Expose port 80

### 4.2 Cấu hình trên Render.com

- [ ] Login Render > **New > Web Service**
- [ ] Chọn **"Deploy from a Git Repository"** → Connect GitHub
- [ ] Chọn Repo `chipstarot`
- [ ] Cấu hình:
  - **Name:** `chipstarot-api`
  - **Region:** Singapore (SG)
  - **Branch:** `main`
  - **Root Directory:** `backend`
  - **Environment:** `Docker`
  - **Instance Type:** Free (để thử) hoặc Starter $7/tháng (cho production)

### 4.3 Thiết lập Environment Variables trên Render

Vào tab **Environment** trên Render, thêm **toàn bộ** các biến đã liệt kê ở Giai đoạn 2.1.

### 4.4 Kiểm tra sau khi deploy

- [ ] Render cấp cho URL dạng: `https://chipstarot-api.onrender.com`
- [ ] Kiểm tra health check: `GET https://chipstarot-api.onrender.com/health` → Phải trả về `{"status":"ok"}`
- [ ] Swagger UI: `GET https://chipstarot-api.onrender.com/swagger` → Phải hiện giao diện Swagger

> [!NOTE]
> Render Free tier sẽ **"ngủ"** sau 15 phút không có request. Deploy Starter để BE luôn sẵn sàng.

---

## GIAI ĐOẠN 5: TRIỂN KHAI FRONTEND (React + Vite lên Vercel)
**Thời gian ước tính:** ~15 phút

### 5.1 Cấu hình trên Vercel

- [ ] Login Vercel > **Add New > Project**
- [ ] Import GitHub Repo `chipstarot`
- [ ] Cấu hình:
  - **Framework Preset:** Vite
  - **Root Directory:** `app`
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
  - **Install Command:** `npm install`

### 5.2 Thiết lập Environment Variables trên Vercel

Trong tab **Environment Variables**:
- [ ] `VITE_API_BASE_URL` = `https://chipstarot-api.onrender.com/api`
- [ ] `VITE_SUPABASE_URL` = `https://xxx.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJ...`

### 5.3 Thiết lập Custom Domain (tùy chọn)

- [ ] Mua domain tại NameCheap / GoDaddy (vd: `chipstarot.com`)
- [ ] Trong Vercel > **Domains** → Add domain `chipstarot.com`
- [ ] Cập nhật DNS của domain trỏ về Vercel (thêm CNAME record)

### 5.4 Cập nhật CORS trên Backend

Sau khi có URL Vercel thực tế, quay lại Render → Environment Variables:
- [ ] Cập nhật `Cors__AllowedOrigins__0` = URL thực của Vercel (vd: `https://chipstarot.vercel.app`)
- [ ] Trigger redeploy Backend

---

## GIAI ĐOẠN 6: CẤU HÌNH THẺ NFC VẬT LÝ
**Thời gian ước tính:** ~30 phút (tùy số lượng thẻ)

### 6.1 Chuẩn bị

- [ ] Có thẻ NFC NTAG213/215/216 (mua trên Shopee/Lazada, ~3-10k/thẻ)
- [ ] Cài app **NFC Tools** (iOS/Android) trên điện thoại

### 6.2 Ghi thẻ

Với mỗi thẻ NFC vật lý:
- [ ] Mở NFC Tools > **Write** > **Add a record** > **URL/URI**
- [ ] Nhập URL: `https://chipstarot.vercel.app/nfc/{CARD_ID}`
  - Ví dụ thẻ số 1: `https://chipstarot.vercel.app/nfc/CT-TAROT-001`
  - Ví dụ thẻ số 2: `https://chipstarot.vercel.app/nfc/CT-STAR-002`
- [ ] Bấm **Write** > Chạm điện thoại vào thẻ
- [ ] Ghi chú lại `CARD_ID` đã dùng cho từng thẻ vật lý

### 6.3 Kích hoạt thẻ trong Database

- [ ] Login tài khoản Admin trên web
- [ ] Vào Dashboard > Quản lý NFC → Thêm từng `CARD_ID` vừa ghi ở trên
- [ ] Set trạng thái thẻ = `available` (có thể quét)

---

## GIAI ĐOẠN 7: KIỂM THỬ TÍCH HỢP (Integration Testing)
**Thời gian ước tính:** ~2 tiếng

### 7.1 Test Luồng Authentication

| Test Case | Kết quả mong đợi | ✅ |
|---|---|---|
| Đăng ký tài khoản mới | Nhận email xác nhận, tài khoản tạo thành công | ☐ |
| Đăng nhập với tài khoản vừa tạo | Nhận JWT token, redirect vào app | ☐ |
| Đăng nhập sai mật khẩu 11 lần | Bị block, nhận lỗi Rate Limit (429) | ☐ |
| Token hết hạn (sau 60 phút) | Tự động logout hoặc refresh token | ☐ |

### 7.2 Test Luồng Tarot

| Test Case | Kết quả mong đợi | ✅ |
|---|---|---|
| Mở trang Reading | Load được danh sách chủ đề | ☐ |
| Chọn chủ đề, rút bài | 3 lá bài Tarot hiện ra, có animation | ☐ |
| AI phân tích bài | Nhận được văn bản giải thích từ Gemini | ☐ |
| Xem lại lịch sử | Danh sách các lần trải bài trước hiện ra đúng | ☐ |

### 7.3 Test Luồng Nuôi Thú Ảo (Gà Cưng)

| Test Case | Kết quả mong đợi | ✅ |
|---|---|---|
| Ấp trứng | Gà nở ra ngẫu nhiên 1 trong 10 loại | ☐ |
| Cho ăn 1 lần | Food -1, EXP +10, DB cập nhật | ☐ |
| Cho ăn đến 100 EXP | Gà lên Cấp 2, xuất hiện nút "Nhận Quà" | ☐ |
| Nhận quà Cấp 2 | Popup voucher mở ra, Food được cộng thêm | ☐ |
| Gà đạt Level 3 | Hào quang xuất hiện, animation đặc biệt kích hoạt | ☐ |

### 7.4 Test Luồng NFC

| Test Case | Kết quả mong đợi | ✅ |
|---|---|---|
| Quét thẻ NFC hợp lệ | Mở trình duyệt, animation quét 3D kích hoạt | ☐ |
| Quét thẻ NFC lần 2 trong ngày | Thông báo "Đã quét hôm nay" | ☐ |
| Quét thẻ NFC chưa kích hoạt | Thông báo lỗi "Thẻ chưa được kích hoạt" | ☐ |

### 7.5 Test trên các thiết bị

- [ ] **Desktop Chrome** (Windows)
- [ ] **Desktop Safari** (Mac)
- [ ] **Mobile Chrome** (Android)
- [ ] **Mobile Safari** (iPhone) – *Quan trọng nhất cho NFC*
- [ ] **Tablet** (iPad)

---

## GIAI ĐOẠN 8: QUY TRÌNH BẢO TRÌ ĐỊNH KỲ (Maintenance)
### 8.1 Hàng ngày (Daily)

- [ ] Kiểm tra **Render Dashboard** → Logs → Có error 500 nào không
- [ ] Kiểm tra **Supabase Dashboard** → Database Health → CPU/Memory
- [ ] Kiểm tra endpoint health: `GET https://chipstarot-api.onrender.com/health`

### 8.2 Hàng tuần (Weekly)

- [ ] Review lịch sử trải bài của users → Phát hiện patterns bất thường
- [ ] Kiểm tra số dư Gemini API quota → Đảm bảo không bị hết credit
- [ ] Backup Database (export từ Supabase Dashboard > Settings > Database > Backups)
- [ ] Review log lỗi tuần → Fix các bug thường gặp

### 8.3 Hàng tháng (Monthly)

- [ ] Cập nhật dependencies FE: `npm update` → Test lại build
- [ ] Cập nhật NuGet packages BE: `dotnet list package --outdated`
- [ ] Review chi phí hosting → Tối ưu nếu cần
- [ ] Xem báo cáo analytics (số users, số lần xem Tarot, lượng gà lên cap)
- [ ] Rotate JWT Secret (nếu cần)

### 8.4 Quy trình cập nhật code (Code Update)

```
1. Phát triển tính năng mới trên nhánh `feature/...`
2. Test local (localhost:3000 + localhost:5000)
3. Merge vào nhánh `main`
4. GitHub → Vercel và Render tự động Deploy lại (CI/CD)
5. Kiểm tra lại các test case chính sau khi deploy
```

---

## ⚡ BẢNG TỔNG HỢP THỜI GIAN VÀ THỨ TỰ ƯU TIÊN

| Thứ tự | Giai đoạn | Thời gian ước tính | Người thực hiện |
|---|---|---|---|
| 1 | Tạo tài khoản dịch vụ | 1 tiếng | Dev / PM |
| 2 | Chuẩn bị biến môi trường | 30 phút | Dev |
| 3 | Deploy Database + Migrate | 20 phút | Dev |
| 4 | Deploy Backend (Render) | 45 phút | Dev |
| 5 | Deploy Frontend (Vercel) | 15 phút | Dev |
| 6 | Ghi thẻ NFC vật lý | 30 phút / 10 thẻ | Dev / PM |
| 7 | Kiểm thử tích hợp | 2 tiếng | Dev + QA |
| 8 | Bàn giao & Training Admin | 1 tiếng | Dev → PM |
| **TỔNG** | | **~6 tiếng** | |

---

> [!IMPORTANT]
> **Điều kiện Go-Live (Launch):** Tất cả test case ở Giai đoạn 7 phải có dấu ✅ hết. Không được launch khi còn test case bị lỗi ở các luồng Auth, Tarot, và Pet.

> [!TIP]
> Nên deploy vào **giữa tuần (Thứ 3 hoặc Thứ 4)** thay vì cuối tuần. Nếu có sự cố sau deploy, team dev vẫn còn nguyên ngày làm việc để fix.
