import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  supabase, isSupabaseConfigured,
  fetchUserProfile, addCreditsToUser, consumeUserCredit,
  purchaseCreditPackage, isCreditsValid, getExpiryLabel,
} from '@/lib/supabase';
import type { AppUser } from '@/lib/supabase';
import { CREDIT_PACKAGES } from '@/data/constants';

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
    setCreditsExpiresAt(profile.credits_expires_at ?? null);
  };

  // ── Refresh credits from DB ──
  const refreshCredits = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return;
    const profile = await fetchUserProfile(user.id);
    if (profile) syncFromProfile(profile);
  }, [user]);

  // ── Bootstrap: check existing Supabase session on mount ──
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          syncFromProfile(profile);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.email?.split('@')[0] || 'Người dùng',
            credits: 0,
            credits_expires_at: null,
            daily_allowance: 0,
            last_reset_date: null,
            role_id: 2,
            avatar_url: null,
          });
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) syncFromProfile(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCredits(0);
        setCreditsExpiresAt(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // [FIX #5] Auto-refresh credits khi user quay lại tab (Page Visibility API)
  // Giải quyết vấn đề user mở app từ sáng, giữ đến 0h sang ngày mới — lượt không tự reset
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        const todayStr = new Date().toISOString().split('T')[0];
        // Nếu đang là ngày mới so với last_reset_date → refresh là tự ngày mới sẽ được reset bởi fetchUserProfile
        if (user.last_reset_date && user.last_reset_date !== todayStr) {
          refreshCredits();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, refreshCredits]);

  // ── Login ──
  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!isSupabaseConfigured) {
      // ── Demo Admin account ──
      if (email === 'admin@chipstarot.com' && password === 'admin123') {
        const adminUser: AppUser = {
          id: 'demo-admin',
          email,
          name: 'Admin CHIPSTAROT',
          credits: 999,
          credits_expires_at: null,
          daily_allowance: 999,
          last_reset_date: new Date().toISOString().split('T')[0],
          role_id: 1,
          avatar_url: null,
        };
        syncFromProfile(adminUser);
        localStorage.setItem('chipstarot_demo_user', JSON.stringify(adminUser));
        return null;
      }
      // ── Demo Customer account ──
      if (email === 'demo@chipstarot.com' && password === '123456') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);
        const todayStr = new Date().toISOString().split('T')[0];
        const demoUser: AppUser = {
          id: 'demo-user', email, name: 'Tarot Lover',
          credits: 3, credits_expires_at: expiresAt.toISOString(),
          daily_allowance: 3, last_reset_date: todayStr,
          role_id: 2, avatar_url: null,
        };
        syncFromProfile(demoUser);
        localStorage.setItem('chipstarot_demo_user', JSON.stringify(demoUser));
        return null;
      }
      return 'Email hoặc mật khẩu không chính xác!\n\n👑 Admin: admin@chipstarot.com / admin123\n👤 Customer: demo@chipstarot.com / 123456';
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) return 'Email hoặc mật khẩu không chính xác!';
      if (error.message.includes('Email not confirmed')) return 'Vui lòng xác thực email trước khi đăng nhập!';
      return error.message;
    }
    return null;
  }, []);

  // ── Register ──
  const register = useCallback(async (email: string, password: string, name: string): Promise<string | null> => {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });

    if (error) return error.message;

    if (data.user) {
      await supabase.from('customer_profiles').insert({
        account_id: data.user.id,
        full_name: name,
        credits: 0,
        daily_allowance: 0,
        credits_expires_at: null,
      });
    }

    return null;
  }, []);

  // ── Logout ──
  const logout = useCallback(async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('chipstarot_demo_user');
    } else {
      await supabase.auth.signOut();
    }
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
      setUser(prev => prev ? { ...prev, credits: newBalance, credits_expires_at: newExpiresAt, daily_allowance: amount, last_reset_date: todayStr } : null);
      return;
    }

    const { newBalance, newExpiresAt, error } = await addCreditsToUser(user.id, amount, nfcTagId);
    if (!error) {
      setCredits(newBalance);
      setCreditsExpiresAt(newExpiresAt || null);
      setUser(prev => prev ? { ...prev, credits: newBalance, credits_expires_at: newExpiresAt || null } : null);
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
      setUser(prev => prev ? { ...prev, credits: newBalance, credits_expires_at: newExpiresAt, daily_allowance: pkg.dailyCredits, last_reset_date: todayStr } : null);

      // Persist demo session
      const updatedUser = { ...user, credits: newBalance, credits_expires_at: newExpiresAt, daily_allowance: pkg.dailyCredits, last_reset_date: todayStr } as AppUser;
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
    setUser(prev => prev ? { ...prev, credits: newBalance, credits_expires_at: newExpiresAt } : null);

    return {
      success: true,
      message: `✅ Mua thành công! Bạn có ${pkg.dailyCredits} lượt bốc bài/ngày. Hạn dùng đến ${new Date(newExpiresAt).toLocaleDateString('vi-VN')}`,
    };
  }, [user, creditsExpiresAt]);

  // ── Consume 1 credit for a reading ──
  const consumeCredit = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    if (credits <= 0) return false;

    // ── Kiểm tra thời hạn TRƯỚC KHI tiêu ──
    if (!isCreditsValid(user)) {
      // Hết hạn → reset state local
      setCredits(0);
      setCreditsExpiresAt(null);
      setUser(prev => prev ? { ...prev, credits: 0, credits_expires_at: null } : null);
      return false;
    }

    if (!isSupabaseConfigured) {
      const newBalance = credits - 1;
      setCredits(newBalance);
      setUser(prev => prev ? { ...prev, credits: newBalance } : null);
      return true;
    }

    const newBalance = await consumeUserCredit(user.id);
    if (newBalance === -1) {
      // Server báo hết hạn → sync state
      setCredits(0);
      setCreditsExpiresAt(null);
      setUser(prev => prev ? { ...prev, credits: 0, credits_expires_at: null } : null);
      return false;
    }

    setCredits(newBalance);
    setUser(prev => prev ? { ...prev, credits: newBalance } : null);
    return true;
  }, [user, credits]);


  // ── Demo mode: restore session from localStorage on mount ──
  useEffect(() => {
    if (!isSupabaseConfigured && !user) {
      const saved = localStorage.getItem('chipstarot_demo_user');
      if (saved) {
        try {
          const demoUser: AppUser = JSON.parse(saved);
          
          // Kiểm tra và reset hàng ngày cho demo
          const todayStr = new Date().toISOString().split('T')[0];
          if (demoUser.daily_allowance && demoUser.daily_allowance > 0 && demoUser.last_reset_date !== todayStr) {
            demoUser.credits = demoUser.daily_allowance;
            demoUser.last_reset_date = todayStr;
            localStorage.setItem('chipstarot_demo_user', JSON.stringify(demoUser));
          }

          setTimeout(() => syncFromProfile(demoUser), 0);
        } catch {
          localStorage.removeItem('chipstarot_demo_user');
        }
      }
    }
  }, [user]);

  const value: AuthContextValue = {
    user, loading, isConfigured: isSupabaseConfigured,
    login, register, logout,
    credits, creditsExpiresAt, creditsExpired, expiryLabel,
    addCredits, buyPackage, consumeCredit, refreshCredits,
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
