# Sơ Đồ Luồng Đi (User Flow) - CHIPSTAROT

Sơ đồ dưới đây thể hiện toàn bộ vòng lặp trải nghiệm người dùng, từ lúc truy cập trang web, sử dụng các dịch vụ Tarot cốt lõi, đối mặt với Paywall (khi hết lượt), cho đến hành trình mua sắm để nạp năng lượng (thông qua nạp số hoặc quét NFC vật lý).

```mermaid
flowchart TD
    Start((Truy cập Web)) --> Home[🏠 Trang Chủ HomePage]
    
    %% Trải bài Tarot Flow
    Home --> Reading[🔮 Trải bài Tarot ReadingPage]
    Reading --> Step1[Nhập tên & Chọn chủ đề]
    Step1 --> Step2[Đặt câu hỏi chi tiết]
    Step2 --> Step3[Chọn 1 hoặc 3 lá bài]
    Step3 --> CheckCredit{Còn Credits không?}
    
    CheckCredit -- "✅ Còn (Trừ 1 Credit)" --> Result[Đọc thông điệp AI]
    Result -- Trải bài tiếp --> Reading
    
    CheckCredit -- "❌ Hết / Quá hạn" --> Paywall[Màn hình Paywall chặn lại]
    Paywall -- Bấm mua thêm --> Shop[🛍️ Cửa hàng ShopPage]
    Home --> Shop
    
    %% Mua sắm Flow
    Shop --> BuyType{Loại sản phẩm?}
    BuyType -- "Sản phẩm số (Gói Credits)" --> Digital[Chọn gói 5/10/50 lượt]
    BuyType -- "Vật lý (Móc khóa NFC)" --> Physical[Chọn mẫu móc khóa]
    
    Physical --> Cart[🛒 Giỏ hàng]
    Digital --> Cart
    Cart --> Checkout[💳 Thanh toán CheckoutPage]
    
    %% Logic cộng tiền
    Checkout -- Thanh toán gói số --> AddCreditDigi[(Cộng Credits CÓ HẠN\nvào Database)]
    Checkout -- Mua móc khóa --> Receive[Đợi giao hàng & Nhận hàng]
    Receive --> ScanNFC[Quét điện thoại vào chip NFC]
    ScanNFC --> AddCreditNFC[(Cộng Credits VÔ HẠN\nvào Database)]
    
    AddCreditDigi -. "Có lượt bốc bài mới" .-> Reading
    AddCreditNFC -. "Có lượt bốc bài mới" .-> Reading
    
    %% User/Auth
    Home --> Auth{Đăng nhập chưa?}
    Auth -- "Chưa" --> Login[🔐 Đăng nhập AuthPage]
    Login --> Profile[👤 Cá nhân ProfilePage]
    Auth -- "Rồi" --> Profile
    Profile --> CheckBal[Xem lịch sử & Số dư]

    %% Styling
    classDef page fill:#f3e8ff,stroke:#a855f7,stroke-width:2px,color:#000
    classDef action fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#000
    classDef decision fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#000
    classDef database fill:#bbf7d0,stroke:#22c55e,stroke-width:2px,color:#000
    
    class Home,Reading,Shop,Cart,Checkout,Login,Profile page
    class Step1,Step2,Step3,Result,Receive,ScanNFC,CheckBal action
    class CheckCredit,BuyType,Auth,Paywall decision
    class AddCreditDigi,AddCreditNFC database
```
