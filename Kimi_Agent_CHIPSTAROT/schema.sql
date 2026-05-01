-- ==========================================
-- 1. PHÂN VÙNG TIỆN ÍCH & BẢO MẬT (UTILITIES & SECURITY)
-- ==========================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE otp_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    duration_days INT NOT NULL,
    description TEXT
);

-- Quản lý thông báo người dùng
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50), -- 'system', 'order', 'subscription'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (role_name) VALUES ('Admin'), ('Customer');
INSERT INTO subscription_plans (plan_name, price, duration_days, description) 
VALUES 
('Monthly', 19000, 30, 'Gói trải nghiệm tháng'),
('Yearly', 149000, 365, 'Gói năm tiết kiệm 35%');

-- ==========================================
-- 2. PHÂN VÙNG DANH TÍNH (IDENTITY)
-- ==========================================

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INT REFERENCES roles(id) DEFAULT 2,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_profiles (
    account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    phone_number VARCHAR(20),
    province VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    street_address VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20),
    zodiac_sign VARCHAR(50),
    life_path_number INT,
    avatar_url TEXT,
    credits INT DEFAULT 0,                              -- Lượt bốc bài có sẵn cho ngày hôm nay (reset hàng ngày hoặc từ NFC)
    daily_allowance INT DEFAULT 0,                      -- Định mức lượt nhận được MỖI NGÀY từ Gói
    last_reset_date DATE,                               -- Ngày reset lượt bốc bài gần nhất (YYYY-MM-DD)
    credits_expires_at TIMESTAMP WITH TIME ZONE,        -- Thời hạn sử dụng gói (NULL = không có gói)
    pet_exp INT DEFAULT 0,                              -- Kinh nghiệm thú ảo
    pet_food INT DEFAULT 0,                             -- Thức ăn thú ảo
    pet_claimed_levels JSONB DEFAULT '[]'::jsonb,       -- Mảng các cấp độ đã nhận thưởng
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_profiles (
    account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    department VARCHAR(100),
    admin_level INT DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. PHÂN VÙNG PREMIUM (SUBSCRIPTIONS)
-- ==========================================

CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    plan_id INT REFERENCES subscription_plans(id),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. PHÂN VÙNG SẢN PHẨM & ĐÁNH GIÁ (LOGISTICS & REVIEWS)
-- ==========================================

CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INT REFERENCES product_categories(id),
    gemstone_type VARCHAR(50),
    description TEXT,
    base_price DECIMAL(12,2) NOT NULL,
    old_price DECIMAL(12,2),                    -- Giá cũ để hiển thị % giảm giá
    image_url TEXT,
    stock_quantity INT DEFAULT 0,                -- Quản lý kho hàng
    is_featured BOOLEAN DEFAULT FALSE,           -- Sản phẩm nổi bật trang chủ
    tag_text VARCHAR(50),                        -- VD: 'Bán chạy', 'Mới'
    tag_color VARCHAR(50),                       -- VD: 'bg-red-500'
    average_rating DECIMAL(2,1) DEFAULT 0.0,     -- Cache sao trung bình (tính từ product_reviews)
    review_count INT DEFAULT 0,                  -- Cache số lượng đánh giá
    nfc_credits_bonus INT DEFAULT 10,            -- Số credits tặng khi kích hoạt NFC sản phẩm này
    is_active BOOLEAN DEFAULT TRUE,              -- Ẩn/hiện sản phẩm (soft delete)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nfc_chips (
    nfc_tag_id VARCHAR(100) PRIMARY KEY,
    product_id INT REFERENCES products(id),
    account_id UUID REFERENCES accounts(id),
    status VARCHAR(20) DEFAULT 'unactivated', -- 'unactivated' | 'activated' | 'transferred'
    credits_granted INT DEFAULT 0,            -- Số credits đã tặng khi kích hoạt
    scan_count INT DEFAULT 0,                 -- Số lần chip được quét
    last_scanned_at TIMESTAMP WITH TIME ZONE, -- Lần quét gần nhất
    activated_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 5. PHÂN VÙNG BÁN HÀNG & KHUYẾN MÃI (SALES & PROMOTIONS)
-- ==========================================

-- Mã giảm giá
CREATE TABLE vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    discount_percent INT CHECK (discount_percent > 0 AND discount_percent <= 100),
    max_discount_amount DECIMAL(12,2),
    min_order_amount DECIMAL(12,2) DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    usage_limit INT DEFAULT 100,
    used_count INT DEFAULT 0
);

-- Banner trang chủ
CREATE TABLE hero_banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    button_text VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- Gói Mua Lượt Tarot (Digital Credit Packages)
-- Người dùng mua gói → credits cộng tức thì, expires_at = NOW() + expiry_days
-- ─────────────────────────────────────────────
CREATE TABLE tarot_credit_packages (
    id VARCHAR(30) PRIMARY KEY,              -- VD: 'cp_starter', 'cp_popular', 'cp_premium'
    name VARCHAR(100) NOT NULL,              -- Tên gói hiển thị
    credits_per_day INT NOT NULL,           -- Số lượt bốc bài MỖI NGÀY
    price DECIMAL(12,2) NOT NULL,           -- Giá bán
    old_price DECIMAL(12,2),               -- Giá gốc (để hiện % giảm giá)
    expiry_days INT NOT NULL DEFAULT 30,   -- *** THỜI HẠN SỬ DỤNG LỢT (ngày kể từ ngày mua) ***
    icon VARCHAR(10),                       -- Emoji icon hiển thị
    description TEXT,                       -- Mô tả ngắn
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lịch sử giao dịch mua gói lượt Tarot
CREATE TABLE credit_package_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    package_id VARCHAR(30) REFERENCES tarot_credit_packages(id),
    credits_per_day_granted INT NOT NULL,           -- Số lượt MỖI NGÀY đã cấp vào tài khoản
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- *** Gói này hết hạn lúc nào ***
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),            -- 'momo', 'vnpay', 'demo'
    transaction_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'refunded'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index để query nhanh giao dịch theo account
CREATE INDEX idx_credit_pkg_purchases_account ON credit_package_purchases(account_id);
CREATE INDEX idx_credit_pkg_purchases_expires ON credit_package_purchases(expires_at);

-- Seed dữ liệu ban đầu cho các gói lượt
-- expiry_days: Gói Khởi Đầu = 30 ngày, Gói Phổ Biến = 90 ngày, Gói Cao Cấp = 365 ngày
INSERT INTO tarot_credit_packages (id, name, credits_per_day, price, old_price, expiry_days, icon, description, display_order)
VALUES
    ('cp_starter', 'Gói Khởi Đầu',   3,  29000,  39000,  30,  '🌙', '3 lượt bốc bài/ngày trong suốt 30 ngày, phù hợp người mới.',              1),
    ('cp_popular', 'Gói Phổ Biến',  5,  69000,  99000,  90,  '🔮', '5 lượt bốc bài/ngày trong 90 ngày — tối đa hiệu quả tâm linh.',         2),
    ('cp_premium', 'Gói Cao Cấp',   10, 179000, 290000,  365, '✨', '10 lượt bốc bài/ngày trong cả năm — dành cho tín đồ Tarot.',        3);


-- Giỏ hàng (Carts)
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chi tiết giỏ hàng (Cart Items)
CREATE TABLE cart_items (
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (cart_id, product_id)
);

-- Đơn hàng
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id),
    voucher_id INT REFERENCES vouchers(id),
    subtotal_amount DECIMAL(12,2) NOT NULL,       -- Tổng tiền hàng trước giảm giá
    discount_amount DECIMAL(12,2) DEFAULT 0,      -- Số tiền được giảm
    shipping_fee DECIMAL(12,2) DEFAULT 0,         -- Phí vận chuyển
    total_amount DECIMAL(12,2) NOT NULL,          -- Tổng thanh toán cuối cùng
    shipping_province VARCHAR(100) NOT NULL,
    shipping_district VARCHAR(100) NOT NULL,
    shipping_ward VARCHAR(100) NOT NULL,
    shipping_street VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(100),                  -- Tên người nhận
    recipient_phone VARCHAR(20),                  -- SĐT người nhận
    recipient_email VARCHAR(255),                 -- Email người nhận (Hỗ trợ Guest Checkout)
    notes TEXT,                                   -- Ghi chú đơn hàng
    status VARCHAR(20) DEFAULT 'pending',         -- 'pending'|'processing'|'shipped'|'delivered'|'cancelled'
    payment_status VARCHAR(20) DEFAULT 'unpaid',  -- 'unpaid'|'paid'|'refunded'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chi tiết đơn hàng
CREATE TABLE order_items (
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id),
    order_id UUID REFERENCES orders(id), -- Liên kết với đơn hàng
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100) UNIQUE,
    payment_type VARCHAR(20), -- 'product_purchase', 'subscription'
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. PHÂN VÙNG TAROT & AI INTERACTION
-- ==========================================

CREATE TABLE tarot_cards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    suit VARCHAR(20),
    arcana_type VARCHAR(20),
    meaning_upright TEXT,
    meaning_reversed TEXT,
    image_url TEXT
);

CREATE TABLE tarot_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id),
    nfc_tag_id VARCHAR(100) REFERENCES nfc_chips(nfc_tag_id),
    topic VARCHAR(50),                       -- 'love'|'career'|'finance'|'health'|'study'|'general'...
    topic_sub_answer VARCHAR(100),           -- Câu trả lời câu hỏi phụ (VD: 'crush', 'stuck')
    user_question TEXT,                      -- Câu hỏi cụ thể người dùng nhập
    mood_input VARCHAR(50),                  -- Tâm trạng: 'happy'|'anxious'|'tired'...
    card_count INT DEFAULT 1,                -- 1 hoặc 3 lá
    ai_model_used VARCHAR(50),               -- VD: 'gemini-1.5-flash', 'gpt-4o'
    ai_prompt_tokens INT,                    -- Số token prompt (tính chi phí)
    ai_response_tokens INT,                  -- Số token response
    ai_response_story TEXT,                  -- Lời giải AI sinh ra (cache - không gọi lại)
    user_rating INT CHECK (user_rating >= 1 AND user_rating <= 5), -- Đánh giá lời giải
    is_saved BOOLEAN DEFAULT FALSE,          -- User đánh dấu lưu lại
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reading_details (
    reading_id UUID REFERENCES tarot_readings(id) ON DELETE CASCADE,
    card_id INT REFERENCES tarot_cards(id),
    position_order INT,
    is_reversed BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (reading_id, position_order)
);

-- ==========================================
-- 7. PHÂN VÙNG NỘI DUNG (CONTENT/BLOG)
-- ==========================================

CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES accounts(id), -- Tác giả (phải là Admin)
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    thumbnail_url TEXT,
    view_count INT DEFAULT 0,              -- Số lượt xem
    tags VARCHAR(255),                     -- Tags phân cách bằng dấu phẩy: 'tarot,tình yêu'
    status VARCHAR(20) DEFAULT 'draft',    -- 'draft' | 'published'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. PHÂN VÙNG PHÂN TÍCH & THEO DÕI (ANALYTICS)
-- ==========================================

-- Lịch sử thay đổi trạng thái đơn hàng
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES accounts(id), -- Admin thay đổi
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lịch sử biến động Credits
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    amount INT NOT NULL,                          -- Dương = cộng, Âm = trừ
    balance_after INT NOT NULL,                   -- Số dư sau giao dịch
    type VARCHAR(30) NOT NULL,                    -- 'nfc_activation'|'tarot_reading'|'admin_grant'|'subscription'
    reference_id VARCHAR(100),                    -- ID liên quan (reading_id, order_id...)
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 9. INDEX TỐI ƯU HIỆU NĂNG (PERFORMANCE INDEXES)
-- ==========================================

CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_role ON accounts(role_id);
CREATE INDEX idx_otp_email_status ON otp_verifications(email, status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_nfc_chips_tag ON nfc_chips(nfc_tag_id);
CREATE INDEX idx_nfc_chips_account ON nfc_chips(account_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_orders_account ON orders(account_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_tarot_readings_account ON tarot_readings(account_id);
CREATE INDEX idx_tarot_readings_topic ON tarot_readings(topic);
CREATE INDEX idx_reading_details_reading ON reading_details(reading_id);
CREATE INDEX idx_notifications_account ON notifications(account_id, is_read);
CREATE INDEX idx_credit_transactions_account ON credit_transactions(account_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
