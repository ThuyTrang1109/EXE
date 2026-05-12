# BÁO CÁO: CHUYỂN ĐỔI DỮ LIỆU TĨNH SANG QUẢN LÝ ĐỘNG (DATABASE-DRIVEN)
**Dự án:** CHIPSTAROT Platform
**Ngày thực hiện:** 05/05/2026
**Trạng thái:** Đang triển khai (In Progress)

---

## 1. Mục tiêu và Lý do (Rationale)
Hiện tại, các thành phần cốt lõi của trải nghiệm Tarot (Chủ đề, Câu hỏi phụ, Câu hỏi gợi ý) đang được lưu trữ dưới dạng biến hằng số (`constants`) trong mã nguồn Frontend. 

**Vấn đề:**
- Muốn thay đổi nội dung phải sửa code và deploy lại.
- Khó khăn trong việc cập nhật các chủ đề theo mùa (Valentine, Tết).
- Admin không có quyền can thiệp vào kịch bản bốc bài của ứng dụng.

**Giải pháp:** Di chuyển toàn bộ dữ liệu này vào Database (Supabase) và xây dựng giao diện quản lý (Admin Dashboard).

---

## 2. Phân tích Cấu trúc Dữ liệu mới

### 2.1. Sơ đồ Database (Schema)
Hệ thống sử dụng 3 bảng mới để chuẩn hóa dữ liệu:

| Bảng | Chức năng | Dữ liệu lưu trữ |
| :--- | :--- | :--- |
| `tarot_topics` | Danh mục chủ đề chính | ID, Tên, Mô tả, Màu sắc, Icon, Thứ tự hiển thị |
| `tarot_topic_sub_questions` | Câu hỏi phân loại sau khi chọn chủ đề | Câu hỏi chính, Mảng JSON các tùy chọn (Options) |
| `tarot_topic_suggestions` | Bong bóng câu hỏi gợi ý | Danh sách các câu hỏi mẫu để người dùng bấm chọn nhanh |

### 2.2. Cơ chế Vận hành (Flow)
1. **Khởi tạo:** Khi người dùng vào trang bốc bài, Frontend sẽ gọi API lấy dữ liệu từ 3 bảng trên.
2. **Dự phòng (Fallback):** Nếu Database gặp sự cố, hệ thống sẽ tự động dùng dữ liệu mặc định trong code để đảm bảo trải nghiệm không bị ngắt quãng.
3. **Quản lý:** Admin có thể cập nhật thông tin trong tab Settings, thay đổi sẽ có hiệu lực ngay lập tức cho tất cả người dùng.

---

## 3. Các thành phần cần triển khai

### 📂 SQL Migration (`app_settings_migration.sql`)
- Khởi tạo cấu trúc bảng.
- Nạp dữ liệu gốc (Seed data) từ các hằng số cũ vào Database để đảm bảo tính kế thừa.

### 📂 Thư viện Xử lý (`appContent.ts`)
- Xây dựng các hàm `getAppTopics()`, `getAppSubQuestions()`, `getAppSuggestions()`.
- Tích hợp logic xử lý lỗi và fallback về hằng số tĩnh.
- Xây dựng các hàm `upsert` (thêm/sửa) dành cho Admin.

### 📂 Giao diện Admin (`AdminPage.tsx`)
- Thêm section **"Quản lý Chủ đề & Câu hỏi"** trong tab Cài đặt.
- Hiển thị danh sách các chủ đề hiện có và trạng thái của các câu hỏi liên quan.
- Xây dựng các Modal chỉnh sửa chi tiết nội dung.

---

## 4. Lợi ích kỹ thuật & Kinh doanh
- **Tính linh hoạt:** Admin có thể thay đổi "vibe" của ứng dụng chỉ trong 30 giây.
- **Tối ưu SEO/Nội dung:** Có thể dễ dàng đổi tên chủ đề hoặc thêm các từ khóa hot-trend vào câu hỏi gợi ý để thu hút người dùng.
- **Sẵn sàng cho Backend C#:** Cấu trúc dữ liệu đã được chuẩn hóa, giúp việc tích hợp với API C# .NET Core sau này trở nên cực kỳ đơn giản.

---

## 5. Kết luận
Việc chuyển đổi sang dữ liệu động là bước đi cần thiết để đưa CHIPSTAROT từ một ứng dụng web tĩnh thành một nền tảng (Platform) chuyên nghiệp, cho phép vận hành và cập nhật nội dung linh hoạt mà không cần can thiệp vào mã nguồn.

---
*Người lập báo cáo: Antigravity AI Assistant*
