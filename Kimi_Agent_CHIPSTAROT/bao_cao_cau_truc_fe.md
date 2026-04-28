# 📘 Báo Cáo Cấu Trúc Kiến Trúc Frontend — CHIPSTAROT

Tài liệu này cung cấp cái nhìn chi tiết về kiến trúc và cách thức tổ chức mã nguồn Frontend của dự án **CHIPSTAROT**.

---

## 🛠️ 1. Công Nghệ Sử Dụng (Tech Stack)

Frontend được xây dựng trên nền tảng Web hiện đại nhằm tối ưu hiệu năng và trải nghiệm người dùng:

*   **Core Library:** React 19 (với các tính năng cải tiến về render).
*   **Build Tool:** Vite 7 (đảm bảo tốc độ Hot Module Replacement cực nhanh).
*   **Language:** TypeScript (quản lý chặt chẽ kiểu dữ liệu `AppUser`, `Product`,...).
*   **Styling:** Tailwind CSS (tiện ích CSS) + Radix UI (Accessible primitives).
*   **Database & Auth:** Supabase JS SDK (BaaS).
*   **Visualization:** Recharts (vẽ biểu đồ trong trang Admin).

---

## 📂 2. Cấu Trúc Thư Mục Mã Nguồn (`/app/src`)

Mã nguồn FE được chia theo mô hình Modular rõ ràng:

```text
src/
├── components/       # Các UI Component tái sử dụng (Header, Footer, NFC Scanner)
├── data/             # Chứa dữ liệu tĩnh ( constants bài Tarot, API Địa chỉ VN)
├── lib/              # Khởi tạo cấu hình lõi (Supabase, Auth Context)
├── pages/            # 14 Màn hình chức năng độc lập
├── App.tsx           # Hub Router và điều hướng chính
├── main.tsx          # File khởi động hệ thống
└── App.css           # Toàn bộ style tùy biến & hiệu ứng
```

---

## 🔄 3. Phân Tích Các Luồng Xử Lý Lõi (Core Workflows)

### 🔑 A. Luồng Xác Thực (Authentication)
*   **Tập tin điều khiển:** `lib/AuthContext.tsx` & `lib/supabase.ts`
*   **Cơ chế:** Tự động bắt sự kiện login/logout của Supabase. Lưu trữ profile người dùng đồng bộ với cơ sở dữ liệu Postgres.
*   **Ủy quyền:** Dựa vào `role_id` được trả về để cho phép/chặn truy cập trang `/admin`.

### 🛒 B. Luồng Thanh Toán & Giỏ Hàng (E-Commerce)
*   Giỏ hàng được lưu trữ kết hợp giữa **State trong App.tsx** và **LocalStorage** để tránh mất dữ liệu khi reload.
*   Tích hợp cơ chế tự động tính toán: `Subtotal` -> `Shipping Fee` -> `Voucher Discount` -> `Total Amount`.

### 🔮 C. Luồng Trải Nghiệm Tarot & Quản Lý Credit
*   **Credit logic:** Tích hợp hệ thống đếm ngược và trừ lượt khi bốc bài qua `consumeUserCredit`.
*   **Mô hình tích hợp NFC:** Khách hàng quét chip trên sản phẩm -> Gọi API cộng credit vô thời hạn vào tài khoản.

---

## 🚀 4. Đánh Giá Ưu Điểm & Điểm Cần Cải Thiện

| Hạng mục | Hiện trạng | Đề xuất nâng cấp |
|---|---|---|
| **Routing** | Sử dụng `window.history` thủ công | Nên dùng `React Router Dom` chuẩn hóa |
| **AI Tarot** | Đang dùng data tĩnh | Tích hợp AI API qua Edge Function |
| **State UI** | Đang truyền prop khá sâu | Chuyển dịch dần sang `Zustand` hoặc `Redux` |

---
*Tài liệu được tạo tự động vào ngày 28/04/2026.*
