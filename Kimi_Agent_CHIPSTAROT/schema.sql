-- ==========================================
-- CHIPSTAROT DATABASE SCHEMA
-- Phiên bản: v2.0 — Đồng bộ hoàn toàn với EF Core AppDbContext
-- Cập nhật: 2026-05-13
-- Lưu ý: Ưu tiên dùng EF Core Migrations. File này chỉ dùng để tham khảo / reset thủ công.
-- ==========================================

-- Kích hoạt UUID extension (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. PHÂN VÙNG PHÂN QUYỀN (RBAC)
-- ==========================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,             -- 'super_admin', 'admin', 'customer', 'staff', 'editor'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE              -- Vai trò hệ thống, không thể xóa
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,            -- 'dashboard.view', 'users.manage'...
    resource VARCHAR(50) NOT NULL,               -- 'dashboard', 'users', 'products'...
    action VARCHAR(50) NOT NULL,                 -- 'view', 'manage', 'create', 'delete'
    display_name VARCHAR(150) NOT NULL
);

CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Seed: Roles
INSERT INTO roles (id, key, name, description, is_system) VALUES
    (1, 'super_admin', 'Super Admin', 'Quản trị viên tối cao - bypass mọi kiểm tra quyền', TRUE),
    (2, 'admin',       'Admin',       'Quản trị viên hệ thống - có toàn quyền quản lý', TRUE),
    (3, 'customer',    'Customer',    'Khách hàng sử dụng dịch vụ Tarot', TRUE),
    (4, 'staff',       'Nhân viên kho', 'Nhân viên xử lý đơn hàng và quản lý sản phẩm', TRUE),
    (5, 'editor',      'Biên tập viên', 'Biên tập viên quản lý bài viết và nội dung Tarot', TRUE);

-- Seed: Permissions (20 quyền)
INSERT INTO permissions (id, key, resource, action, display_name) VALUES
    (1,  'dashboard.view',    'dashboard', 'view',   'Xem thống kê tổng quan'),
    (2,  'users.view',        'users',     'view',   'Xem DS người dùng'),
    (3,  'users.manage',      'users',     'manage', 'Quản lý người dùng'),
    (4,  'cards.view',        'cards',     'view',   'Xem DS lá bài'),
    (5,  'cards.manage',      'cards',     'manage', 'Quản lý lá bài'),
    (6,  'products.view',     'products',  'view',   'Xem DS sản phẩm'),
    (7,  'products.manage',   'products',  'manage', 'Quản lý sản phẩm'),
    (8,  'packages.view',     'packages',  'view',   'Xem DS gói Tarot'),
    (9,  'packages.manage',   'packages',  'manage', 'Quản lý gói Tarot'),
    (10, 'orders.view',       'orders',    'view',   'Xem DS đơn hàng'),
    (11, 'orders.manage',     'orders',    'manage', 'Quản lý đơn hàng'),
    (12, 'nfc.view',          'nfc',       'view',   'Xem DS thẻ NFC'),
    (13, 'nfc.manage',        'nfc',       'manage', 'Quản lý thẻ NFC'),
    (14, 'content.view',      'content',   'view',   'Xem DS bài viết'),
    (15, 'content.manage',    'content',   'manage', 'Quản lý bài viết'),
    (16, 'reports.view',      'reports',   'view',   'Xem báo cáo hệ thống'),
    (17, 'settings.manage',   'settings',  'manage', 'Quản lý cấu hình'),
    (18, 'rbac.manage',       'rbac',      'manage', 'Quản lý phân quyền'),
    (19, 'vouchers.view',     'vouchers',  'view',   'Xem danh sách Voucher'),
    (20, 'vouchers.manage',   'vouchers',  'manage', 'Quản lý Voucher');

-- Seed: Super Admin & Admin có tất cả 20 quyền
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;  -- super_admin

INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions;  -- admin

-- Staff: products.view/manage + orders.view/manage
INSERT INTO role_permissions (role_id, permission_id) VALUES (4,6),(4,7),(4,10),(4,11);

-- Editor: cards.view/manage + content.view/manage
INSERT INTO role_permissions (role_id, permission_id) VALUES (5,4),(5,5),(5,14),(5,15);


-- ==========================================
-- 2. PHÂN VÙNG DANH TÍNH (IDENTITY)
-- ==========================================

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INT REFERENCES roles(id) DEFAULT 3,   -- DEFAULT: customer
    is_verified BOOLEAN DEFAULT FALSE,
    account_status VARCHAR(20) DEFAULT 'active',  -- 'active' | 'banned' | 'unverified'
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
    credits INT DEFAULT 0,                              -- Lượt bốc bài hiện có
    daily_allowance INT DEFAULT 0,                      -- Lượt nhận được mỗi ngày từ gói
    last_reset_date DATE,                               -- Ngày reset gần nhất
    credits_expires_at TIMESTAMP WITH TIME ZONE,        -- Hết hạn gói
    pet_exp INT DEFAULT 0,
    pet_food INT DEFAULT 0,
    pet_type VARCHAR(50),
    pet_name VARCHAR(100),
    pet_status VARCHAR(50) DEFAULT 'egg',               -- 'egg' | 'hatched' | 'teen' | 'adult'
    pet_claimed_levels JSONB DEFAULT '[]'::jsonb,
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

CREATE TABLE otp_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    type VARCHAR(20) NOT NULL,             -- 'register' | 'reset_password'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'used' | 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- JWT Refresh Tokens (DB-backed, tồn tại sau khi server restart)
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_account ON refresh_tokens(account_id);


-- ==========================================
-- 3. PHÂN VÙNG SẢN PHẨM (PRODUCTS)
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
    old_price DECIMAL(12,2),
    image_url TEXT,
    stock_quantity INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    tag_text VARCHAR(50),
    tag_color VARCHAR(50),
    average_rating DECIMAL(2,1) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    nfc_credits_bonus INT DEFAULT 10,        -- Credits tặng khi kích hoạt NFC lần đầu
    is_active BOOLEAN DEFAULT TRUE,
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
    credits_granted INT DEFAULT 0,
    scan_count INT DEFAULT 0,
    last_scanned_at TIMESTAMP WITH TIME ZONE,
    activated_at TIMESTAMP WITH TIME ZONE
);

-- Nhật ký biến động tồn kho
CREATE TABLE inventory_logs (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id),
    change_amount INT NOT NULL,              -- Dương = nhập, Âm = xuất
    balance_after INT NOT NULL,
    type VARCHAR(30) NOT NULL,              -- 'restock' | 'damage' | 'audit' | 'sale'
    note TEXT,
    actor_id UUID REFERENCES accounts(id), -- Admin thực hiện
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 4. PHÂN VÙNG BÁN HÀNG (SALES)
-- ==========================================

CREATE TABLE vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    discount_percent INT CHECK (discount_percent > 0 AND discount_percent <= 100),
    max_discount_amount DECIMAL(12,2),
    min_order_amount DECIMAL(12,2) DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    usage_limit INT DEFAULT 100,
    used_count INT DEFAULT 0,
    assigned_to_account UUID REFERENCES accounts(id) -- NULL = public voucher
);

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

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID UNIQUE REFERENCES accounts(id) ON DELETE CASCADE, -- 1 user 1 giỏ hàng
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id),
    voucher_id INT REFERENCES vouchers(id),
    subtotal_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    shipping_fee DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    shipping_province VARCHAR(100) NOT NULL,
    shipping_district VARCHAR(100) NOT NULL,
    shipping_ward VARCHAR(100) NOT NULL,
    shipping_street VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(100),
    recipient_phone VARCHAR(20),
    recipient_email VARCHAR(255),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',        -- 'pending'|'processing'|'shipped'|'delivered'|'cancelled'
    payment_status VARCHAR(20) DEFAULT 'unpaid', -- 'unpaid'|'paid'|'refunded'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES accounts(id),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id),
    order_id UUID REFERENCES orders(id),
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100) UNIQUE,
    payment_type VARCHAR(20),  -- 'product_purchase' | 'subscription'
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 5. PHÂN VÙNG GÓI TAROT (SUBSCRIPTIONS)
-- ==========================================

CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    duration_days INT NOT NULL,
    description TEXT
);

CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    plan_id INT REFERENCES subscription_plans(id),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gói mua lượt Tarot
CREATE TABLE tarot_credit_packages (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    credits_per_day INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    old_price DECIMAL(12,2),
    expiry_days INT NOT NULL DEFAULT 30,
    icon VARCHAR(10),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credit_package_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    package_id VARCHAR(30) REFERENCES tarot_credit_packages(id),
    credits_per_day_granted INT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed: Gói lượt Tarot (khớp AppDbContext)
INSERT INTO tarot_credit_packages (id, name, credits_per_day, price, old_price, expiry_days, icon, description, display_order) VALUES
    ('cp_starter', 'Gói Khởi Đầu',  3,  29000,  39000,  30,  '🌙', '3 lượt/ngày trong 30 ngày', 1),
    ('cp_popular', 'Gói Phổ Biến',  5,  69000,  99000,  90,  '🔮', '5 lượt/ngày trong 90 ngày', 2),
    ('cp_premium', 'Gói Cao Cấp',   10, 179000, 290000, 365, '✨', '10 lượt/ngày trong 365 ngày', 3);

-- Seed: Voucher mẫu (khớp AppDbContext)
INSERT INTO vouchers (id, code, discount_percent, usage_limit, start_date) VALUES
    (1, 'CHIPSTAROT2024', 10, 100, NOW()),
    (2, 'HELLOSUMMER',    20, 50,  NOW());

-- Reset sequences sau seed
SELECT setval('vouchers_id_seq', 2);


-- ==========================================
-- 6. PHÂN VÙNG TAROT & AI
-- ==========================================

CREATE TABLE tarot_cards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    suit VARCHAR(20),
    arcana_type VARCHAR(20),
    element VARCHAR(20),
    meaning_general TEXT,
    meaning_upright TEXT,
    meaning_reversed TEXT,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'active'  -- 'active' | 'draft'
);

CREATE TABLE tarot_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id),
    nfc_tag_id VARCHAR(100) REFERENCES nfc_chips(nfc_tag_id),
    topic VARCHAR(50),
    topic_sub_answer VARCHAR(100),
    user_question TEXT,
    mood_input VARCHAR(50),
    card_count INT DEFAULT 1,
    ai_model_used VARCHAR(50),
    ai_prompt_tokens INT,
    ai_response_tokens INT,
    ai_response_story TEXT,
    user_rating INT CHECK (user_rating >= 1 AND user_rating <= 5),
    is_saved BOOLEAN DEFAULT FALSE,
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
-- 7. PHÂN VÙNG NỘI DUNG (BLOG)
-- ==========================================

CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES accounts(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    thumbnail_url TEXT,
    view_count INT DEFAULT 0,
    tags VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft',   -- 'draft' | 'published'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 8. PHÂN VÙNG PHÂN TÍCH (ANALYTICS)
-- ==========================================

CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    amount INT NOT NULL,              -- Dương = cộng, Âm = trừ
    balance_after INT NOT NULL,
    type VARCHAR(30) NOT NULL,       -- 'nfc_activation'|'tarot_reading'|'admin_grant'|'daily_reset'
    reference_id VARCHAR(100),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pet_game_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'feed'|'gain_exp_from_reading'|'claim_reward'|'hatch'|'evolution'
    amount INT NOT NULL DEFAULT 0,
    current_exp INT NOT NULL,
    current_food INT NOT NULL,
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50),                -- 'system'|'order'|'subscription'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit trail cho các thao tác RBAC / Admin nhạy cảm
CREATE TABLE access_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES accounts(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 9. CẤU HÌNH HỆ THỐNG (SYSTEM SETTINGS)
-- ==========================================

CREATE TABLE system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES accounts(id)
);

-- Seed: System Settings — key lowercase để khớp với code (ProfileController, DailyCreditsResetJob)
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    -- Gemini AI
    ('gemini_api_key',                  '',      'Google Gemini API Key'),
    -- Pet Game
    ('pet_evolution_teen_exp',          '200',   'EXP cần để thú cưng tiến hóa giai đoạn Teen'),
    ('pet_evolution_adult_exp',         '1000',  'EXP cần để thú cưng tiến hóa giai đoạn Adult'),
    ('chipstarot_admin_pet_food_cost',  '1',     'Số thức ăn tiêu thụ mỗi lần cho ăn'),
    ('chipstarot_admin_pet_exp_gain',   '10',    'EXP nhận được mỗi lần cho ăn'),
    ('chipstarot_admin_pet_rare_rate',  '5',     'Tỷ lệ % ra thú hiếm (golden) khi nở trứng'),
    ('nfc_activation_pet_exp',          '50',    'EXP nhận được khi kích hoạt NFC'),
    ('pet_exp_per_turn',                '20',    'Số EXP nhận được mỗi lần bốc bài'),
    ('chipstarot_admin_pet_food_daily', '5',     'Số thức ăn tặng mỗi ngày'),
    ('chipstarot_shipping_fee',         '30000', 'Phí vận chuyển mặc định'),
    -- System
    ('maintenance_mode',                'false', 'Bật/Tắt chế độ bảo trì (true/false)');


-- ==========================================
-- 10. INDEX TỐI ƯU HIỆU NĂNG
-- ==========================================

CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_role ON accounts(role_id);
CREATE INDEX idx_otp_email_status ON otp_verifications(email, status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_nfc_chips_account ON nfc_chips(account_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_orders_account ON orders(account_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_tarot_readings_account ON tarot_readings(account_id);
CREATE INDEX idx_reading_details_reading ON reading_details(reading_id);
CREATE INDEX idx_notifications_account ON notifications(account_id, is_read);
CREATE INDEX idx_credit_transactions_account ON credit_transactions(account_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_pet_game_logs_account ON pet_game_logs(account_id);
CREATE INDEX idx_credit_pkg_purchases_account ON credit_package_purchases(account_id);
CREATE INDEX idx_credit_pkg_purchases_expires ON credit_package_purchases(expires_at);
CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
