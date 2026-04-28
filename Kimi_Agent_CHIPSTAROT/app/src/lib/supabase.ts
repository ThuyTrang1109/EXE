import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials are actually configured
export const isSupabaseConfigured =
  supabaseUrl !== '' &&
  supabaseUrl !== 'your_project_url_here' &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey !== '' &&
  supabaseAnonKey !== 'your_anon_key_here';

// Only create a real client when configured; otherwise use a safe no-op proxy
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://noop.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vb3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.fake');

// ─────────────────────────────────────────────
// Database Types (mirrors schema.sql)
// ─────────────────────────────────────────────

export interface Account {
  id: string;
  email: string;
  role_id: number;
  is_verified: boolean;
  created_at: string;
}

export interface CustomerProfile {
  account_id: string;
  full_name: string | null;
  phone_number: string | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  zodiac_sign: string | null;
  life_path_number: number | null;
  avatar_url: string | null;
  credits: number;
  credits_expires_at: string | null;  // ISO string | null = không hết hạn (từ NFC)
  updated_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  credits: number;
  credits_expires_at: string | null;  // Thời hạn hiệu lực của gói
  daily_allowance: number;            // Định mức lượt mỗi ngày
  last_reset_date: string | null;     // Ngày reset gần nhất (YYYY-MM-DD)
  role_id: number;
  avatar_url: string | null;
}

// ─────────────────────────────────────────────
// Credit Expiry Helpers (pure functions — không cần Supabase)
// ─────────────────────────────────────────────

/**
 * Kiểm tra xem thời hạn lượt của user có còn hiệu lực không.
 * - Nếu credits_expires_at === null → lượt từ NFC, không bao giờ hết hạn → true
 * - Nếu credits > 0 VÀ now < expires_at → còn hạn → true
 * - Nếu credits > 0 NHƯNG now >= expires_at → lượt đã hết hạn → false
 */
export function isCreditsValid(user: AppUser | null): boolean {
  if (!user) return false;
  if (user.credits <= 0) return false;
  if (!user.credits_expires_at) return true; // NFC credits: vô thời hạn
  return new Date() < new Date(user.credits_expires_at);
}

/**
 * Trả về thông tin thời hạn hiển thị cho UI.
 * VD: "Còn 12 ngày", "Hết hạn hôm nay", "Đã hết hạn"
 */
export function getExpiryLabel(creditsExpiresAt: string | null): {
  label: string;
  urgency: 'none' | 'ok' | 'warning' | 'expired';
} {
  if (!creditsExpiresAt) return { label: 'Vô thời hạn (NFC)', urgency: 'none' };

  const now = new Date();
  const expires = new Date(creditsExpiresAt);
  const diffMs = expires.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0)  return { label: 'Đã hết hạn', urgency: 'expired' };
  if (diffDays === 0) return { label: 'Hết hạn hôm nay!', urgency: 'warning' };
  if (diffDays <= 7)  return { label: `Còn ${diffDays} ngày`, urgency: 'warning' };
  return { label: `Còn ${diffDays} ngày`, urgency: 'ok' };
}

// ─────────────────────────────────────────────
// Auth Helpers
// ─────────────────────────────────────────────

/**
 * Lấy profile đầy đủ của user (join accounts + customer_profiles)
 */
export async function fetchUserProfile(userId: string): Promise<AppUser | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('customer_profiles')
    .select('account_id, full_name, credits, credits_expires_at, avatar_url, daily_allowance, last_reset_date')
    .eq('account_id', userId)
    .single();

  if (error || !data) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const expiresAt: string | null = data.credits_expires_at ?? null;
  let credits = data.credits ?? 0;
  const dailyAllowance = data.daily_allowance ?? 0;
  let lastResetDate = data.last_reset_date ?? null;
  const todayStr = new Date().toISOString().split('T')[0];

  if (expiresAt && new Date() >= new Date(expiresAt) && credits > 0) {
    // Gói đã hết hạn → reset về 0 (ghi log)
    credits = 0;
    await supabase.from('customer_profiles').update({
      credits: 0,
      daily_allowance: 0,
      credits_expires_at: null,
      updated_at: new Date().toISOString(),
    }).eq('account_id', userId);
    await supabase.from('credit_transactions').insert({
      account_id: userId,
      amount: -(data.credits),
      balance_after: 0,
      type: 'expiry_reset',
      note: `Gói hết hạn vào ${new Date(expiresAt).toLocaleDateString('vi-VN')}`,
    });
  } else if (dailyAllowance > 0 && lastResetDate !== todayStr && expiresAt && new Date() < new Date(expiresAt)) {
    // Sang ngày mới và gói còn hạn -> Reset lượt về định mức ngày
    credits = dailyAllowance; // Có thể cộng dồn hoặc reset đúng bằng định mức (tùy nghiệp vụ, ở đây là reset)
    lastResetDate = todayStr;
    await supabase.from('customer_profiles').update({
      credits: credits,
      last_reset_date: lastResetDate,
      updated_at: new Date().toISOString(),
    }).eq('account_id', userId);
  }

  return {
    id: userId,
    email: user.email || '',
    name: data.full_name || user.email?.split('@')[0] || 'Người dùng',
    credits,
    credits_expires_at: credits > 0 ? expiresAt : null,
    daily_allowance: dailyAllowance,
    last_reset_date: lastResetDate,
    role_id: 2,
    avatar_url: data.avatar_url,
  };
}

// ─────────────────────────────────────────────
// Credit Package Purchase
// ─────────────────────────────────────────────

/**
 * Xử lý mua gói lượt Tarot (Digital).
 * - Cộng credits vào customer_profiles
 * - Cập nhật credits_expires_at = MAX(NOW(), credits_expires_at cũ) + expiry_days
 *   → Nếu user còn hạn cũ, thêm vào SAU ngày hết hạn cũ (không bị reset)
 * - Ghi log vào credit_transactions + credit_package_purchases
 */
export async function purchaseCreditPackage(
  userId: string,
  packageId: string,
  credits: number,
  expiryDays: number,
  amountPaid: number,
  paymentMethod: string = 'demo'
): Promise<{ newBalance: number; newExpiresAt: string; error: string | null }> {
  if (!isSupabaseConfigured) {
    // Demo mode: tính toán local
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    return { newBalance: credits, newExpiresAt: expiresAt.toISOString(), error: null };
  }

  // 1. Lấy số dư và thời hạn hiện tại
  const { data: profile, error: fetchErr } = await supabase
    .from('customer_profiles')
    .select('credits, credits_expires_at')
    .eq('account_id', userId)
    .single();

  if (fetchErr || !profile) {
    return { newBalance: 0, newExpiresAt: '', error: 'Không tìm thấy hồ sơ người dùng' };
  }

  const now = new Date();
  const currentBalance = profile.credits ?? 0;
  const newBalance = currentBalance + credits;

  // 2. Tính expires_at mới:
  //    - Nếu còn hạn cũ và chưa hết → nối thêm sau ngày hết hạn cũ
  //    - Nếu hết hạn rồi hoặc null → tính từ NOW()
  const oldExpires = profile.credits_expires_at ? new Date(profile.credits_expires_at) : null;
  const baseDate = oldExpires && oldExpires > now ? oldExpires : now;
  const newExpires = new Date(baseDate);
  newExpires.setDate(newExpires.getDate() + expiryDays);
  const newExpiresAt = newExpires.toISOString();

  // 3. Cập nhật customer_profiles (thêm daily_allowance)
  const todayStr = new Date().toISOString().split('T')[0];
  const { error: updateErr } = await supabase
    .from('customer_profiles')
    .update({
      credits: newBalance,
      daily_allowance: credits, // Tham số credits lúc này truyền vào từ pkg.dailyCredits
      last_reset_date: todayStr,
      credits_expires_at: newExpiresAt,
      updated_at: now.toISOString(),
    })
    .eq('account_id', userId);

  if (updateErr) {
    return { newBalance: currentBalance, newExpiresAt: '', error: updateErr.message };
  }

  // 4. Ghi credit_transactions
  await supabase.from('credit_transactions').insert({
    account_id: userId,
    amount: credits,
    balance_after: newBalance,
    type: 'package_purchase',
    reference_id: packageId,
    note: `Mua gói ${packageId} — +${credits} lượt, hạn đến ${newExpires.toLocaleDateString('vi-VN')}`,
  });

  // 5. Ghi credit_package_purchases
  await supabase.from('credit_package_purchases').insert({
    account_id: userId,
    package_id: packageId,
    credits_granted: credits,
    expires_at: newExpiresAt,
    amount_paid: amountPaid,
    payment_method: paymentMethod,
    status: 'completed',
  });

  return { newBalance, newExpiresAt, error: null };
}

// ─────────────────────────────────────────────
// Add credits (NFC scan — vô thời hạn)
// ─────────────────────────────────────────────

/**
 * Cộng credits cho user sau khi quét NFC thành công.
 * NFC credits KHÔNG có thời hạn (credits_expires_at giữ nguyên giá trị cũ).
 * Ghi vào customer_profiles VÀ credit_transactions
 */
export async function addCreditsToUser(
  userId: string,
  amount: number,
  nfcTagId?: string
): Promise<{ newBalance: number; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { newBalance: 0, error: 'Supabase chưa được cấu hình' };
  }

  // 1. Lấy số dư hiện tại
  const { data: profile, error: fetchErr } = await supabase
    .from('customer_profiles')
    .select('credits, credits_expires_at')
    .eq('account_id', userId)
    .single();

  if (fetchErr || !profile) {
    return { newBalance: 0, error: 'Không tìm thấy hồ sơ người dùng' };
  }

  const currentCredits = profile.credits ?? 0;
  const newBalance = currentCredits + amount;

  // 2. Cập nhật credits — KHÔNG đụng tới credits_expires_at (NFC = vô thời hạn)
  const { error: updateErr } = await supabase
    .from('customer_profiles')
    .update({ credits: newBalance, updated_at: new Date().toISOString() })
    .eq('account_id', userId);

  if (updateErr) {
    return { newBalance: currentCredits, error: updateErr.message };
  }

  // 3. Ghi lịch sử vào credit_transactions
  await supabase.from('credit_transactions').insert({
    account_id: userId,
    amount: amount,
    balance_after: newBalance,
    type: 'nfc_activation',
    reference_id: nfcTagId || null,
    note: `Kích hoạt NFC${nfcTagId ? ` - Tag: ${nfcTagId}` : ''}`,
  });

  return { newBalance, error: null };
}

// ─────────────────────────────────────────────
// Consume credit (xem bài Tarot)
// ─────────────────────────────────────────────

/**
 * Trừ 1 credit khi xem bài Tarot.
 * TRƯỚC KHI trừ: kiểm tra credits_expires_at — nếu đã hết hạn thì từ chối.
 * Trả về số dư mới hoặc -1 nếu không đủ / hết hạn.
 */
export async function consumeUserCredit(userId: string, readingId?: string): Promise<number> {
  if (!isSupabaseConfigured) return -1;

  const { data: profile, error: fetchErr } = await supabase
    .from('customer_profiles')
    .select('credits, credits_expires_at')
    .eq('account_id', userId)
    .single();

  if (fetchErr || !profile || profile.credits <= 0) return -1;

  // ── Kiểm tra thời hạn ──
  const expiresAt = profile.credits_expires_at;
  if (expiresAt && new Date() >= new Date(expiresAt)) {
    // Hết hạn → reset credits về 0, không cho tiêu
    await supabase.from('customer_profiles').update({
      credits: 0,
      daily_allowance: 0,
      credits_expires_at: null,
      updated_at: new Date().toISOString(),
    }).eq('account_id', userId);
    await supabase.from('credit_transactions').insert({
      account_id: userId,
      amount: -(profile.credits),
      balance_after: 0,
      type: 'expiry_reset',
      note: `Gói hết hạn vào ${new Date(expiresAt).toLocaleDateString('vi-VN')}`,
    });
    return -1; // Trả về -1 để App.tsx biết và hiện Paywall
  }

  const newBalance = profile.credits - 1;

  const { error: updateErr } = await supabase
    .from('customer_profiles')
    .update({ credits: newBalance, updated_at: new Date().toISOString() })
    .eq('account_id', userId);

  if (updateErr) return -1;

  // Ghi lịch sử
  await supabase.from('credit_transactions').insert({
    account_id: userId,
    amount: -1,
    balance_after: newBalance,
    type: 'tarot_reading',
    reference_id: readingId || null,
    note: 'Trải bài Tarot',
  });

  return newBalance;
}
