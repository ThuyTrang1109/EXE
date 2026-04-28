# 📂 Báo Cáo Chi Tiết: Từng File, Chức Năng & Luồng Đi (Frontend)

Tài liệu này đi sâu vào chi tiết của từng file trong thư mục `src` của dự án **CHIPSTAROT**, giải thích rõ vai trò của chúng và cách dữ liệu luân chuyển (Data Flow) giữa các component.

---

## 1. CHI TIẾT TỪNG FILE & CHỨC NĂNG

### 📌 Thư mục gốc `/src`
*   **`main.tsx`**: Điểm khởi chạy (Entry Point) của ứng dụng React. Gọi `ReactDOM.createRoot` và bọc toàn bộ ứng dụng bằng `<AuthProvider>` để cung cấp dữ liệu phiên đăng nhập cho mọi component bên trong.
*   **`App.tsx`**: Trái tim của ứng dụng (Hub Controller).
    *   **Chức năng**: Quản lý State cốt lõi (Cart, Page routing bằng `window.history`), xử lý hiển thị các Modal hệ thống (NFC Scanner, Paywall hết lượt).
    *   **Luồng**: Lắng nghe sự kiện `popstate` để điều hướng trang. Chứa logic tổng về Cart (`addToCart`, `removeFromCart`) và truyền xuống các trang.
*   **`App.css` / `index.css`**: Chứa CSS tổng thể, config Tailwind và các animation (hiệu ứng 3D, pulse).

---

### 📌 Thư mục `/src/lib` (Core Services)
*   **`supabase.ts`**: Tệp trung tâm giao tiếp với Database.
    *   **Chức năng**: Khởi tạo Supabase client. Chứa các hàm nghiệp vụ: `fetchUserProfile` (Lấy dữ liệu User & Credit), `purchaseCreditPackage` (Xử lý mua gói VIP), `addCreditsToUser` (Cộng credit từ thẻ NFC), `consumeUserCredit` (Trừ 1 lượt khi xem bài).
*   **`AuthContext.tsx`**: Quản lý State đăng nhập toàn cục.
    *   **Chức năng**: Lắng nghe sự kiện `onAuthStateChange` của Supabase. Cung cấp object `user`, số dư `credits`, trạng thái `loading`, và các hàm `login`, `logout` cho toàn bộ ứng dụng qua `useAuth()`.

---

### 📌 Thư mục `/src/data` (Dữ liệu tĩnh)
*   **`constants.ts`**: Chứa toàn bộ logic tĩnh cho việc xem bài. Bao gồm `TAROT_DB` (78 lá bài), `TOPICS` (Tình yêu, Sự nghiệp...), và thông điệp cứng (do chưa nối API AI).
*   **`addressData.ts`**: Chứa JSON Tỉnh/Thành, Quận/Huyện, Phường/Xã Việt Nam dùng cho trang Checkout.

---

### 📌 Thư mục `/src/components` (Thành phần giao diện dùng chung)
*   **`Header.tsx`**: Thanh điều hướng trên cùng. Hiển thị Logo, Menu, Nút Đăng nhập/Profile, số dư Credit, và Giỏ hàng (kèm badge số lượng).
*   **`Footer.tsx`**: Chân trang đơn giản chứa liên kết mạng xã hội, bản quyền.
*   **`NFCScannerOverlay.tsx`**: Giao diện Modal mô phỏng việc quét thẻ cứng NFC. Quét xong sẽ gọi hàm cộng điểm từ `App.tsx`.

---

### 📌 Thư mục `/src/pages` (Các màn hình chức năng)
1.  **`HomePage.tsx`**: Landing page giới thiệu, banner, hướng dẫn cách sử dụng NFC & Tarot.
2.  **`ReadingPage.tsx`**: Màn hình "Trải Bài". Luồng 6 bước: Nhập tên -> Chọn chủ đề -> Câu hỏi phụ -> Câu hỏi chi tiết -> Chọn số lá bài (1 hoặc 3) -> Chọn bài. Gọi hàm `consumeCredit` khi mở bài.
3.  **`CardsPage.tsx`**: Cẩm nang/Từ điển Tarot. Hiển thị danh sách 78 lá bài từ `constants.ts`.
4.  **`ShopPage.tsx`**: Cửa hàng. Hiển thị danh sách các thẻ NFC, Móc khóa, và các "Gói Lượt Xem" (Subscription).
5.  **`ProductDetailPage.tsx`**: Hiển thị thông tin chi tiết một sản phẩm, cho phép thêm vào giỏ.
6.  **`CartPage.tsx`**: Quản lý danh sách sản phẩm đã chọn, tăng giảm số lượng, tính tổng tiền.
7.  **`CheckoutPage.tsx`**: Form điền thông tin giao hàng, tính phí ship, voucher, và nhấn "Đặt hàng" (Gửi data lên bảng `orders` ở Supabase).
8.  **`ProfilePage.tsx`**: Dashboard của khách hàng. Xem thông tin cá nhân, lịch sử giao dịch credit, và lịch sử đơn hàng.
9.  **`AuthPage.tsx`**: Form Đăng nhập & Đăng ký sử dụng Supabase Auth.
10. **`AdminPage.tsx`**: Trang dành riêng cho Role Admin. Vẽ biểu đồ Recharts thống kê đơn hàng, doanh thu và quản lý dữ liệu.
11. **`BlogPage.tsx` / `GamePage.tsx` / `AboutPage.tsx`**: Các trang nội dung bổ trợ.
12. **`NotFoundPage.tsx`**: Trang báo lỗi 404 khi vào sai đường dẫn.

---
---

## 2. PHÂN TÍCH LUỒNG ĐI (DATA & WORKFLOWS)

### 🌀 A. Luồng Khởi Động & Xác Thực (App Boot & Auth Flow)
1.  **Load Trang**: User vào `domain.com`. `main.tsx` chạy.
2.  **Check Session**: `<AuthProvider>` (trong `AuthContext.tsx`) gọi `supabase.auth.getSession()`.
    *   *Trường hợp chưa Login*: Trả về `user = null`. App tải lên `HomePage`.
    *   *Trường hợp đã Login*: Lấy `user.id` -> gọi `fetchUserProfile(id)` trong `supabase.ts` để lấy số dư `credits`, `role_id`.
3.  **Mount App**: Giao diện `App.tsx` render. Dựa vào URL hiện tại, biến `page` được set (ví dụ `home` hoặc `shop`), render Component tương ứng.

### 🌀 B. Luồng Trải Bài Tarot (Tarot Reading Flow)
1.  User nhấn **"Xem Bài"**, vào `ReadingPage.tsx`.
2.  Thực hiện chọn chủ đề, nhập câu hỏi (Bước 1 đến 5 - State lưu tại `ReadingPage`).
3.  **Bốc bài (Bước 6)**: User chọn 1 hoặc 3 lá bài. Component lật bài.
4.  **Kiểm tra Credit**:
    *   Hệ thống gọi hàm `consumeCredit()` (từ `AuthContext` -> `supabase.ts`).
    *   *Nếu hết lượt (hoặc hết hạn gói)*: Hàm trả về `false` -> `ReadingPage` báo lỗi -> `App.tsx` bắt lỗi, hiển thị **Paywall Modal** (Mời mua gói/NFC).
    *   *Nếu còn lượt*: Supabase trừ 1 credit trong bảng `customer_profiles`, ghi log vào `credit_transactions`. Trả về `true`.
5.  **Kết quả**: `ReadingPage` hiển thị ý nghĩa lá bài (đọc từ `constants.ts`).

### 🌀 C. Luồng Mua Sắm & Thanh Toán (E-commerce Flow)
1.  User ở `ShopPage.tsx` -> Bấm **Add to Cart**.
2.  Hàm `addToCart(product)` tại `App.tsx` chạy -> Update mảng `cart` -> Lưu đồng thời vào `localStorage('chipstarot_cart')` để f5 không mất.
3.  User sang `CartPage.tsx` kiểm tra, bấm **Thanh toán** -> Chuyển sang `CheckoutPage.tsx`.
4.  **Submit Order**: User điền form. Nhấn Đặt hàng. `CheckoutPage` gọi `supabase` insert data vào bảng `orders` và `order_items`. Xóa `cart` local sau khi thành công.

### 🌀 D. Luồng Kích Hoạt NFC (Phygital Flow)
1.  User dùng điện thoại quét Móc khóa NFC cứng mua từ Shop.
2.  Chip NFC mở URL có dạng: `https://chipstarot.vn?tagId=NFC12345`.
3.  `App.tsx` chạy, hook `useEffect` bắt được param `?tagId=...`.
4.  Giao diện bật **`NFCScannerOverlay.tsx`**. Hiển thị Animation đang quét.
5.  Quét xong, gọi hàm `handleScanSuccess()` -> gọi `addCreditsToUser()` (trong `supabase.ts`).
6.  Supabase cộng `credits` (vô thời hạn) vào tài khoản User và ghi log vào `credit_transactions`. Năng lượng đã được nạp thành công!
