import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  supabase, isSupabaseConfigured,
  fetchUserProfile, addCreditsToUser, consumeUserCredit,
  purchaseCreditPackage, isCreditsValid, getExpiryLabel,
} from '@/lib/supabase';
import type { AppUser } from '@/lib/supabase';
import { CREDIT_PACKAGES } from '@/data/constants';
import { api } from '@/lib/api';

// ─────────────────────────────────────────────
// Context Types
// ─────────────────────────────────────────────

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isConfigured: boolean;

  // Auth actions
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, name: string) => Promise<string | null>;
  logout: () => Promise<void>;

  // Credits state
  credits: number;
  creditsExpiresAt: string | null;           // ISO string | null
  creditsExpired: boolean;                   // true nếu lượt đã hết hạn
  expiryLabel: { label: string; urgency: 'none' | 'ok' | 'warning' | 'expired' };

  // Credits actions
  addCredits: (amount: number, nfcTagId?: string) => Promise<void>;
  buyPackage: (packageId: string) => Promise<{ success: boolean; message: string }>;
  consumeCredit: () => Promise<boolean>;
  refreshCredits: () => Promise<void>;
  updateUserSession: (updates: Partial<AppUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [credits, setCredits] = useState(0);
  const [creditsExpiresAt, setCreditsExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Derived state ──
  const creditsExpired =
    credits > 0 &&
    creditsExpiresAt !== null &&
    new Date() >= new Date(creditsExpiresAt);

  const expiryLabel = getExpiryLabel(credits > 0 ? creditsExpiresAt : null);

  // ── Helper: sync state từ AppUser ──
  const syncFromProfile = (profile: AppUser) => {
    setUser(profile);
    setCredits(profile.credits);
    setCreditsExpiresAt(profile.creditsExpiresAt ?? null);
  };

  // ── Refresh credits from DB ──
  const refreshCredits = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getProfile();
      if (res.success) {
        // Map backend DTO to AppUser
        const p = res.data;
        const mappedUser: AppUser = {
          id: p.accountId,
          email: p.email,
          name: p.fullName || 'Người dùng',
          credits: p.credits,
          creditsExpiresAt: p.creditsExpiresAt,
          dailyAllowance: p.dailyAllowance,
          lastResetDate: p.lastResetDate,
          phoneNumber: p.phoneNumber,
          province: p.province, district: p.district, ward: p.ward, streetAddress: p.streetAddress,
          dateOfBirth: p.dateOfBirth, gender: p.gender, zodiacSign: p.zodiacSign, lifePathNumber: p.lifePathNumber,
          roleId: p.roleId, role: p.roleName, permissions: p.permissions || [],
          avatarUrl: p.avatarUrl,
          petExp: p.petExp, petFood: p.petFood, petType: p.petType, petName: p.petName,
          petStatus: p.petStatus, petClaimedLevels: JSON.stringify(p.petClaimedLevels || [])
        };
        syncFromProfile(mappedUser);
      }
    } catch (err) { console.error("Refresh failed", err); }
  }, [user]);

  // ── Bootstrap: Check existing token on mount ──
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('chipstarot_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            const p = res.data;
            const mappedUser: AppUser = {
              id: p.accountId, email: p.email, name: p.fullName || 'Người dùng',
              credits: p.credits, creditsExpiresAt: p.creditsExpiresAt,
              dailyAllowance: p.dailyAllowance, lastResetDate: p.lastResetDate,
              phoneNumber: p.phoneNumber,
              province: p.province, district: p.district, ward: p.ward, streetAddress: p.streetAddress,
              dateOfBirth: p.dateOfBirth, gender: p.gender, zodiacSign: p.zodiacSign, lifePathNumber: p.lifePathNumber,
              roleId: p.roleId, role: p.roleName, permissions: p.permissions || [],
              avatarUrl: p.avatarUrl,
              petExp: p.petExp, petFood: p.petFood, petType: p.petType, petName: p.petName,
              petStatus: p.petStatus, petClaimedLevels: JSON.stringify(p.petClaimedLevels || [])
            };
            syncFromProfile(mappedUser);
          } else {
            localStorage.removeItem('chipstarot_token');
          }
        } catch (err) {
          console.error("Bootstrap failed", err);
          localStorage.removeItem('chipstarot_token');
        }
      }
      setLoading(false);
    };
    bootstrap();
  }, []);

  // [FIX #5] Auto-refresh credits khi user quay lại tab (Page Visibility API)
  // Giải quyết vấn đề user mở app từ sáng, giữ đến 0h sang ngày mới — lượt không tự reset
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        const todayStr = new Date().toISOString().split('T')[0];
        // Nếu đang là ngày mới so với last_reset_date → refresh là tự ngày mới sẽ được reset bởi fetchUserProfile
        if (user.lastResetDate && user.lastResetDate !== todayStr) {
          refreshCredits();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, refreshCredits]);

  // ── Login ──
  // ── Login ──
  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    // ── Local Demo Fallback (If no Supabase and specific demo emails) ──
    if (!isSupabaseConfigured) {
      const demoAccounts: Record<string, any> = {
        'admin@chipstarot.com': { pass: 'admin123', role: 'admin', name: 'Thầy Tarot (Admin)', id: 'demo-admin' },
        'staff@chipstarot.com': { pass: 'staff123', role: 'staff', name: 'Nhân Viên Cửa Hàng', id: 'demo-staff' },
        'editor@chipstarot.com': { pass: 'editor123', role: 'editor', name: 'Biên Tập Viên', id: 'demo-editor' },
        'demo@chipstarot.com': { pass: '123456', role: 'customer', name: 'Lữ Khách Demo', id: 'demo-user' },
      };

      const demo = demoAccounts[email.toLowerCase()];
      if (demo && demo.pass === password) {
        const mockUser: AppUser = {
          id: demo.id,
          email: email.toLowerCase(),
          name: demo.name,
          credits: 10,
          creditsExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          dailyAllowance: 3,
          lastResetDate: new Date().toISOString().split('T')[0],
          phoneNumber: '0987654321',
          province: 'Hồ Chí Minh', district: 'Quận 1', ward: 'Bến Nghé', streetAddress: '123 Đồng Khởi',
          dateOfBirth: '1995-01-01', gender: 'male', zodiacSign: 'Ma Kết', lifePathNumber: 7,
          roleId: demo.role === 'admin' ? 2 : (demo.role === 'staff' ? 4 : 3),
          role: demo.role,
          permissions: demo.role === 'admin' 
            ? ['dashboard.view', 'users.view', 'users.manage', 'cards.view', 'cards.manage', 'products.view', 'products.manage', 'packages.view', 'packages.manage', 'orders.view', 'orders.manage', 'nfc.view', 'nfc.manage', 'content.view', 'content.manage', 'reports.view', 'settings.manage', 'rbac.manage']
            : (demo.role === 'staff' ? ['dashboard.view', 'orders.view', 'orders.manage', 'products.view', 'nfc.view'] : (demo.role === 'editor' ? ['cards.view', 'cards.manage', 'content.view', 'content.manage'] : [])),
          avatarUrl: null,
          petExp: 150, petFood: 5, petType: 'chicken_classic', petName: 'Chíp Chíp',
          petStatus: 'hatched', petClaimedLevels: '[]'
        };
        
        syncFromProfile(mockUser);
        localStorage.setItem('chipstarot_demo_user', JSON.stringify(mockUser));
        return null; // Success
      }
    }

    try {
      const res = await api.login({ email, password });
      if (res.success) {
        localStorage.setItem('chipstarot_token', res.data.token);
        // Sau khi login thành công, bootstrap sẽ tự chạy hoặc mình gọi fetch profile ở đây
        const profileRes = await api.getMe();
        if (profileRes.success) {
          const p = profileRes.data;
          const mappedUser: AppUser = {
            id: p.accountId, email: p.email, name: p.fullName || 'Người dùng',
            credits: p.credits, creditsExpiresAt: p.creditsExpiresAt,
            dailyAllowance: p.dailyAllowance, lastResetDate: p.lastResetDate,
            phoneNumber: p.phoneNumber,
            province: p.province, district: p.district, ward: p.ward, streetAddress: p.streetAddress,
            dateOfBirth: p.dateOfBirth, gender: p.gender, zodiacSign: p.zodiacSign, lifePathNumber: p.lifePathNumber,
            roleId: p.roleId, role: p.roleName, permissions: p.permissions || [],
            avatarUrl: p.avatarUrl,
            petExp: p.petExp, petFood: p.petFood, petType: p.petType, petName: p.petName,
            petStatus: p.petStatus, petClaimedLevels: JSON.stringify(p.petClaimedLevels || [])
          };
          syncFromProfile(mappedUser);
        }
        return null;
      }
      return res.message || 'Đăng nhập thất bại';
    } catch (err) {
      return (err as any).message || 'Lỗi kết nối máy chủ';
    }
  }, [isSupabaseConfigured, syncFromProfile]);

  // ── Register ──
  const register = useCallback(async (email: string, password: string, name: string): Promise<string | null> => {
    if (!isSupabaseConfigured) {
      // Demo mode: cho phép đăng ký bất kỳ email nào (trừ demo emails đã có)
      const mockUser: AppUser = {
        id: `demo-${Date.now()}`,
        email: email.toLowerCase(),
        name: name,
        credits: 3,
        creditsExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        dailyAllowance: 1,
        lastResetDate: new Date().toISOString().split('T')[0],
        phoneNumber: '',
        province: '', district: '', ward: '', streetAddress: '',
        dateOfBirth: '', gender: 'other', zodiacSign: 'Unknown', lifePathNumber: 0,
        roleId: 3,
        role: 'customer',
        permissions: [],
        avatarUrl: null,
        petExp: 0, petFood: 0, petType: 'egg', petName: 'Chưa đặt tên',
        petStatus: 'egg', petClaimedLevels: '[]'
      };
      
      // Tự động đăng nhập sau khi đăng ký thành công trong demo mode
      syncFromProfile(mockUser);
      localStorage.setItem('chipstarot_demo_user', JSON.stringify(mockUser));
      return null;
    }

    try {
      const res = await api.register({ email, password, fullName: name });
      if (res.success) return null;
      return res.message || 'Đăng ký thất bại';
    } catch (err) {
      return (err as any).message || 'Lỗi kết nối máy chủ';
    }
  }, [isSupabaseConfigured, syncFromProfile]);

  // ── Logout ──
  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Supabase signout failed", err);
    }
    
    localStorage.removeItem('chipstarot_token');
    localStorage.removeItem('chipstarot_demo_user');
    setUser(null);
    setCredits(0);
    setCreditsExpiresAt(null);
  }, []);

  // ── Add credits (NFC scan — có thời hạn 6 tháng) ──
  const addCredits = useCallback(async (amount: number, nfcTagId?: string) => {
    if (!user) return;

    if (!isSupabaseConfigured) {
      const newBalance = credits + amount;
      // Demo mode: tính 6 tháng kể từ hôm nay
      const base = creditsExpiresAt && new Date(creditsExpiresAt) > new Date()
        ? new Date(creditsExpiresAt)
        : new Date();
      base.setDate(base.getDate() + 180); // 6 tháng
      const newExpiresAt = base.toISOString();
      const todayStr = new Date().toISOString().split('T')[0];
      setCredits(newBalance);
      setCreditsExpiresAt(newExpiresAt);
      setUser(prev => prev ? { ...prev, credits: newBalance, creditsExpiresAt: newExpiresAt, dailyAllowance: amount, lastResetDate: todayStr } : null);
      return;
    }

    const { newBalance, newExpiresAt, error } = await addCreditsToUser(user.id, amount, nfcTagId);
    if (!error) {
      setCredits(newBalance);
      setCreditsExpiresAt(newExpiresAt || null);
      setUser(prev => prev ? { ...prev, credits: newBalance, creditsExpiresAt: newExpiresAt || null } : null);
    }
  }, [user, credits, creditsExpiresAt]);

  // ── Buy credit package (Digital) ──
  const buyPackage = useCallback(async (packageId: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Vui lòng đăng nhập trước!' };

    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return { success: false, message: 'Gói không hợp lệ!' };

    if (!isSupabaseConfigured) {
      // Demo mode: tính local
      const newBalance = pkg.dailyCredits; // Reset credit to daily package immediately
      const expiresDate = new Date();
      // Nếu đang còn thời hạn cũ → nối thêm sau
      const base = creditsExpiresAt && new Date(creditsExpiresAt) > new Date()
        ? new Date(creditsExpiresAt)
        : new Date();
      base.setDate(base.getDate() + pkg.expiryDays);
      const newExpiresAt = base.toISOString();
      const todayStr = new Date().toISOString().split('T')[0];

      setCredits(newBalance);
      setCreditsExpiresAt(newExpiresAt);
      setUser(prev => prev ? { ...prev, credits: newBalance, creditsExpiresAt: newExpiresAt, dailyAllowance: pkg.dailyCredits, lastResetDate: todayStr } : null);

      // Persist demo session
      const updatedUser = { ...user, credits: newBalance, creditsExpiresAt: newExpiresAt, dailyAllowance: pkg.dailyCredits, lastResetDate: todayStr } as AppUser;
      localStorage.setItem('chipstarot_demo_user', JSON.stringify(updatedUser));
      expiresDate.setTime(base.getTime());
      return {
        success: true,
        message: `✅ Mua gói thành công! Bạn có ${pkg.dailyCredits} lượt bốc bài/ngày. Hạn dùng: ${expiresDate.toLocaleDateString('vi-VN')}`,
      };
    }

    const { newBalance, newExpiresAt, error } = await purchaseCreditPackage(
      user.id, packageId, pkg.dailyCredits, pkg.expiryDays, pkg.price, 'demo'
    );

    if (error) return { success: false, message: `Lỗi: ${error}` };

    setCredits(newBalance);
    setCreditsExpiresAt(newExpiresAt);
    setUser(prev => prev ? { ...prev, credits: newBalance, creditsExpiresAt: newExpiresAt } : null);

    return {
      success: true,
      message: `✅ Mua thành công! Bạn có ${pkg.dailyCredits} lượt bốc bài/ngày. Hạn dùng đến ${new Date(newExpiresAt).toLocaleDateString('vi-VN')}`,
    };
  }, [user, creditsExpiresAt]);

  // ── Consume 1 credit for a reading ──
  const consumeCredit = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    if (credits <= 0) return false;

    // Kiểm tra thời hạn local trước
    if (creditsExpiresAt && new Date() >= new Date(creditsExpiresAt)) {
      setCredits(0);
      setCreditsExpiresAt(null);
      setUser(prev => prev ? { ...prev, credits: 0, creditsExpiresAt: null } : null);
      return false;
    }

    try {
      // Backend START_READING sẽ trừ credit
      // Ở đây ta có thể gọi api.startReading hoặc một endpoint cụ thể để trừ credit
      // Trong thiết kế hiện tại, StartReadingAsync trong TarotController thực hiện việc này.
      // Nên function này có thể chỉ cần sync lại state sau khi reading kết thúc, 
      // HOẶC gọi một endpoint 'consume-only' nếu cần validate trước.

      // Giả sử ta sync state thủ công để UI mượt mà
      const newBalance = credits - 1;
      setCredits(newBalance);
      setUser(prev => prev ? { ...prev, credits: newBalance, petFood: (prev.petFood || 0) + 1 } : null);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [user, credits, creditsExpiresAt]);


  // ── Demo mode: restore session from localStorage on mount ──
  useEffect(() => {
    if (!isSupabaseConfigured && !user) {
      const saved = localStorage.getItem('chipstarot_demo_user');
      if (saved) {
        try {
          const demoUser: AppUser = JSON.parse(saved);

          // Kiểm tra và reset hàng ngày cho demo
          const todayStr = new Date().toISOString().split('T')[0];
          let needsUpdate = false;

          if (demoUser.dailyAllowance && demoUser.dailyAllowance > 0 && demoUser.lastResetDate !== todayStr) {
            demoUser.credits = demoUser.dailyAllowance;
            demoUser.lastResetDate = todayStr;
            needsUpdate = true;
          }

          // Đồng bộ permissions với chipstarot_mock_rbac nếu có thay đổi
          const savedRbac = localStorage.getItem('chipstarot_mock_rbac');
          if (savedRbac) {
            try {
              const rbacData = JSON.parse(savedRbac);
              const permIds = rbacData.rolePermissions.filter((rp: any) => rp.roleId === demoUser.roleId).map((rp: any) => rp.permissionId);
              const latestPerms = rbacData.permissions.filter((p: any) => permIds.includes(p.id)).map((p: any) => p.key);

              // So sánh xem có khác biệt không, nếu có thì update (Dùng mảng tạm để tránh mutate mảng gốc)
              const currentPerms = [...(demoUser.permissions || [])].sort();
              const sortedLatest = [...latestPerms].sort();

              if (JSON.stringify(currentPerms) !== JSON.stringify(sortedLatest)) {
                demoUser.permissions = latestPerms;
                needsUpdate = true;
              }
            } catch (e) { }
          } else if (demoUser.role === 'admin' && demoUser.permissions.length < 18) {
            // Chỉ auto-migrate khi chưa có mock rbac
            demoUser.permissions = [
              'dashboard.view', 'users.view', 'users.manage', 'cards.view', 'cards.manage',
              'products.view', 'products.manage', 'packages.view', 'packages.manage',
              'orders.view', 'orders.manage', 'nfc.view', 'nfc.manage', 'content.view',
              'content.manage', 'reports.view', 'settings.manage', 'rbac.manage'
            ];
            needsUpdate = true;
          }

          if (needsUpdate) {
            localStorage.setItem('chipstarot_demo_user', JSON.stringify(demoUser));
          }

          setTimeout(() => syncFromProfile(demoUser), 0);
        } catch {
          localStorage.removeItem('chipstarot_demo_user');
        }
      }
    }
  }, [user]);

  const updateUserSession = useCallback((updates: Partial<AppUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updates };
      if (!isSupabaseConfigured) {
        localStorage.setItem('chipstarot_demo_user', JSON.stringify(nextUser));
      }
      return nextUser;
    });
  }, [isSupabaseConfigured]);

  const value: AuthContextValue = {
    user, loading, isConfigured: isSupabaseConfigured,
    login, register, logout,
    credits, creditsExpiresAt, creditsExpired, expiryLabel,
    addCredits, buyPackage, consumeCredit, refreshCredits, updateUserSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
