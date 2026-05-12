-- ================================================================
-- CHIPSTAROT — RBAC Migration Script
-- Phiên bản: 1.0 | Ngày: 2026-05-09
-- Chạy script này trong môi trường PostgreSQL local và production
-- ================================================================

-- ── 1. Tạo bảng roles (chuẩn RBAC.md) ──────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    key         TEXT UNIQUE NOT NULL,       -- 'super_admin' | 'admin' | 'customer'
    name        TEXT NOT NULL,              -- Tên hiển thị
    description TEXT,
    is_system   BOOLEAN NOT NULL DEFAULT TRUE
);

-- ── 2. Tạo bảng permissions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS permissions (
    id           SERIAL PRIMARY KEY,
    key          TEXT UNIQUE NOT NULL,      -- 'users.view'
    resource     TEXT NOT NULL,             -- 'users'
    action       TEXT NOT NULL,             -- 'view'
    display_name TEXT NOT NULL,
    description  TEXT
);

-- ── 3. Bảng liên kết role_permissions (M-N) ─────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ── 4. Bảng access_audit (ghi log RBAC.md Section 12) ───────────
CREATE TABLE IF NOT EXISTS access_audit (
    id          BIGSERIAL PRIMARY KEY,
    actor_id    UUID NOT NULL REFERENCES accounts(id),
    target_id   UUID,
    action      TEXT NOT NULL,              -- 'permission.checked.denied' | 'role.assigned'
    metadata    TEXT,                       -- JSON string
    ip_address  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON access_audit(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON access_audit(action, created_at DESC);

-- ── 5. Seed Roles ────────────────────────────────────────────────
INSERT INTO roles (id, key, name, description, is_system) VALUES
    (1, 'super_admin', 'Super Admin', 'Toàn quyền hệ thống, bypass mọi check', true),
    (2, 'admin',       'Admin',       'Quản lý vận hành hệ thống',             true),
    (3, 'customer',    'Customer',    'Người dùng cuối',                        true),
    (4, 'staff',       'Staff',       'Nhân viên quản lý kho & đơn hàng',      true),
    (5, 'editor',      'Editor',      'Biên tập viên nội dung & bài viết',     true)
ON CONFLICT (key) DO NOTHING;

-- Đồng bộ sequence
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- ── 6. Seed Permissions ──────────────────────────────────────────
INSERT INTO permissions (id, key, resource, action, display_name) VALUES
    (1, 'dashboard.view', 'dashboard', 'view',   'Xem thống kê tổng quan'),
    (2, 'users.view',     'users',     'view',   'Xem DS người dùng'),
    (3, 'users.manage',   'users',     'manage', 'Quản lý người dùng'),
    (4, 'cards.view',     'cards',     'view',   'Xem DS lá bài'),
    (5, 'cards.manage',   'cards',     'manage', 'Quản lý lá bài'),
    (6, 'products.view',  'products',  'view',   'Xem DS sản phẩm'),
    (7, 'products.manage','products',  'manage', 'Quản lý sản phẩm'),
    (8, 'packages.view',  'packages',  'view',   'Xem DS gói Tarot'),
    (9, 'packages.manage','packages',  'manage', 'Quản lý gói Tarot'),
    (10, 'orders.view',   'orders',    'view',   'Xem DS đơn hàng'),
    (11, 'orders.manage', 'orders',    'manage', 'Quản lý đơn hàng'),
    (12, 'nfc.view',      'nfc',       'view',   'Xem DS thẻ NFC'),
    (13, 'nfc.manage',    'nfc',       'manage', 'Quản lý thẻ NFC'),
    (14, 'content.view',  'content',   'view',   'Xem DS bài viết'),
    (15, 'content.manage','content',   'manage', 'Quản lý bài viết'),
    (16, 'reports.view',  'reports',   'view',   'Xem báo cáo hệ thống'),
    (17, 'settings.manage','settings', 'manage', 'Quản lý cấu hình'),
    (18, 'rbac.manage',   'rbac',      'manage', 'Quản lý phân quyền')
ON CONFLICT (key) DO UPDATE SET display_name = EXCLUDED.display_name;

-- Đồng bộ sequence
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));

-- ── 7. Gán quyền cho Role ────────────────────────────────────────
-- Super Admin: tất cả 18 quyền
INSERT INTO role_permissions (role_id, permission_id) VALUES
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9),
    (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18)
ON CONFLICT DO NOTHING;

-- Admin: 18 quyền (Toàn quyền ban đầu)
INSERT INTO role_permissions (role_id, permission_id) VALUES
    (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9),
    (2, 10), (2, 11), (2, 12), (2, 13), (2, 14), (2, 15), (2, 16), (2, 17), (2, 18)
ON CONFLICT DO NOTHING;

-- Staff: Quyền xem & quản lý sản phẩm và đơn hàng (6=products.view, 7=products.manage, 10=orders.view, 11=orders.manage)
INSERT INTO role_permissions (role_id, permission_id) VALUES
    (4, 6), (4, 7), (4, 10), (4, 11)
ON CONFLICT DO NOTHING;

-- Editor: Quyền xem & quản lý nội dung và lá bài (4=cards.view, 5=cards.manage, 14=content.view, 15=content.manage)
INSERT INTO role_permissions (role_id, permission_id) VALUES
    (5, 4), (5, 5), (5, 14), (5, 15)
ON CONFLICT DO NOTHING;

-- Customer: không có permission nào (chỉ dùng endpoints Authorize thường)

-- ── 8. Cập nhật cột role_id trên accounts ───────────────────────
-- Nếu bảng accounts đã tồn tại với role_id cũ (1=admin,2=customer),
-- cần migrate sang schema mới (1=super_admin,2=admin,3=customer)
-- Bỏ qua nếu cột role_id đã sử dụng các giá trị mới

-- Kiểm tra và cập nhật mapping cũ (1→2, 2→3) nếu cần:
-- UPDATE accounts SET role_id = 2 WHERE role_id = 1; -- Admin cũ → Admin mới
-- UPDATE accounts SET role_id = 3 WHERE role_id = 2; -- Customer cũ → Customer mới

-- ================================================================
-- KIỂM TRA KẾT QUẢ
-- ================================================================
-- SELECT r.key, p.key FROM roles r
-- JOIN role_permissions rp ON rp.role_id = r.id
-- JOIN permissions p ON p.id = rp.permission_id
-- ORDER BY r.id, p.id;
