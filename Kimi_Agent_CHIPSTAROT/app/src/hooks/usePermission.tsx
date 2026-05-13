import { useAuth } from '@/lib/AuthContext';

// ─────────────────────────────────────────────
// usePermission Hook
// Implements RBAC.md Section 6.1 — Frontend Gate
// "Frontend usePermission() chỉ là UX — BE phải check"
// ─────────────────────────────────────────────

export function usePermission() {
  const { user } = useAuth();

  const can = (permission: string): boolean => {
    if (!user) return false;
    // Super admin bypass tất cả check
    if (user.role === 'super_admin') return true;
    return user.permissions?.includes(permission) ?? false;
  };

  const canAny = (...permissions: string[]): boolean =>
    permissions.some((p) => can(p));

  const canAll = (...permissions: string[]): boolean =>
    permissions.every((p) => can(p));

  const hasRole = (role: string): boolean => user?.role === role;

  const isAdmin = (): boolean =>
    user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'staff' || user?.role === 'editor';

  const isCustomer = (): boolean => user?.role === 'customer';

  return { can, canAny, canAll, hasRole, isAdmin, isCustomer };
}

// ─────────────────────────────────────────────
// RequirePermission Component
// Gate route dựa trên permission — RBAC.md Section 6.3
// ─────────────────────────────────────────────

import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface RequirePermissionProps {
  permission?: string;
  role?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RequirePermission({
  permission,
  role,
  fallback,
  children,
}: RequirePermissionProps) {
  const { can, hasRole } = usePermission();

  const allowed =
    (permission ? can(permission) : true) && (role ? hasRole(role) : true);

  if (!allowed) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <ForbiddenPage />
    );
  }

  return <>{children}</>;
}

// ─────────────────────────────────────────────
// RequireAdmin Component — Chỉ cho phép Admin/Staff/Editor
// ─────────────────────────────────────────────

export function RequireAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAdmin } = usePermission();
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (!isAdmin() || user?.status !== 'active') {
    return fallback ? <>{fallback}</> : <ForbiddenPage />;
  }
  
  return <>{children}</>;
}


// ─────────────────────────────────────────────
// RequireAuth Component — Chỉ yêu cầu đăng nhập
// ─────────────────────────────────────────────

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (!user || user.status !== 'active') {
    navigate('/auth', { replace: true });
    return null;
  }
  return <>{children}</>;
}

// ─────────────────────────────────────────────
// ForbiddenPage — Trang 403 inline
// ─────────────────────────────────────────────

function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-yellow-900 flex items-center justify-center p-6">
      <div className="text-center text-white">
        <div className="text-7xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold mb-3">Truy cập bị từ chối</h1>
        <p className="text-purple-200 mb-8">
          {user
            ? 'Tài khoản của bạn không có quyền truy cập trang này.'
            : 'Vui lòng đăng nhập để tiếp tục.'}
        </p>
        <button
          onClick={() => navigate(user ? '/' : '/auth')}
          className="bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-bold px-8 py-3 rounded-xl transition-all"
        >
          {user ? '← Về trang chủ' : '→ Đăng nhập'}
        </button>
      </div>
    </div>
  );
}
