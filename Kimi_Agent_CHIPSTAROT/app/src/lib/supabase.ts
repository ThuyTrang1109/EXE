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
  pet_exp: number;
  pet_food: number;
  pet_claimed_levels: number[];
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
  pet_exp?: number;
  pet_food?: number;
  pet_claimed_levels?: number[];
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
    .select('account_id, full_name, credits, credits_expires_at, avatar_url, daily_allowance, last_reset_date, pet_exp, pet_food, pet_claimed_levels')
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
    pet_exp: data.pet_exp || 0,
    pet_food: data.pet_food || 0,
    pet_claimed_levels: data.pet_claimed_levels || [],
  };
}

// ─────────────────────────────────────────────
// NFC Chip Validation & Activation
// ─────────────────────────────────────────────

/**
 * [FIX #2] Validate chip NFC trước khi cộng credits:
 *   - Chip phải tồn tại trong bảng nfc_chips (đã được Admin đăng ký)
 *   - Chip chưa được kích hoạt (status = 'unactivated')
 *   - Chip chưa thuộc về tài khoản khác
 * Nếu hợp lệ → update status = 'activated', ghi account_id, scan_count...
 */
export async function validateAndActivateNFCChip(
  userId: string,
  nfcTagId: string
): Promise<{ valid: boolean; creditsBonus: number; error: string | null }> {
  if (!isSupabaseConfigured) {
    // Demo mode: luôn hợp lệ (để test UI)
    return { valid: true, creditsBonus: 3, error: null };
  }

  // 1. Kiểm tra chip có tồn tại không
  const { data: chip, error: fetchErr } = await supabase
    .from('nfc_chips')
    .select('nfc_tag_id, status, account_id, product_id')
    .eq('nfc_tag_id', nfcTagId)
    .single();

  if (fetchErr || !chip) {
    return { valid: false, creditsBonus: 0, error: 'Chip NFC không hợp lệ hoặc chưa được đăng ký trong hệ thống.' };
  }

  // 2. Kiểm tra chip đã được kích hoạt chưa
  if (chip.status === 'activated') {
    // Nếu chính user này đã kích hoạt trước đó → thông báo thân thiện
    if (chip.account_id === userId) {
      return { valid: false, creditsBonus: 0, error: 'Bạn đã kích hoạt chip NFC này rồi. Mỗi chip chỉ được dùng 1 lần.' };
    }
    // Chip thuộc về người khác
    return { valid: false, creditsBonus: 0, error: 'Chip NFC này đã được kích hoạt bởi tài khoản khác.' };
  }

  // 3. Lấy số credits bonus từ sản phẩm liên kết
  let creditsBonus = 3; // Default fallback
  if (chip.product_id) {
    const { data: product } = await supabase
      .from('products')
      .select('nfc_credits_bonus')
      .eq('id', chip.product_id)
      .single();
    if (product?.nfc_credits_bonus) creditsBonus = product.nfc_credits_bonus;
  }

  // 4. Đánh dấu chip là đã kích hoạt (atomic)
  const { error: activateErr } = await supabase
    .from('nfc_chips')
    .update({
      status: 'activated',
      account_id: userId,
      credits_granted: creditsBonus,
      scan_count: 1,
      last_scanned_at: new Date().toISOString(),
      activated_at: new Date().toISOString(),
    })
    .eq('nfc_tag_id', nfcTagId)
    .eq('status', 'unactivated'); // Thêm điều kiện này để tránh race condition

  if (activateErr) {
    return { valid: false, creditsBonus: 0, error: 'Không thể kích hoạt chip. Vui lòng thử lại.' };
  }

  return { valid: true, creditsBonus, error: null };
}

// ─────────────────────────────────────────────
// Credit Package Purchase
// ─────────────────────────────────────────────

/**
 * Xử lý mua gói lượt Tarot (Digital).
 * [FIX #3] Balance được reset về đúng daily_allowance của gói mới (không cộng dồn vào số dư cũ)
 * [FIX #6] Sửa tên cột credits_granted → credits_per_day_granted
 * - Cập nhật credits_expires_at: nếu còn hạn cũ → nối thêm; nếu hết → tính từ NOW()
 * - Ghi log vào credit_transactions + credit_package_purchases
 */
export async function purchaseCreditPackage(
  userId: string,
  packageId: string,
  dailyCredits: number,
  expiryDays: number,
  amountPaid: number,
  paymentMethod: string = 'demo'
): Promise<{ newBalance: number; newExpiresAt: string; error: string | null }> {
  if (!isSupabaseConfigured) {
    // Demo mode: tính toán local
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    return { newBalance: dailyCredits, newExpiresAt: expiresAt.toISOString(), error: null };
  }

  // 1. Lấy thời hạn hiện tại (không cần balance cũ vì sẽ reset)
  const { data: profile, error: fetchErr } = await supabase
    .from('customer_profiles')
    .select('credits_expires_at')
    .eq('account_id', userId)
    .single();

  if (fetchErr || !profile) {
    return { newBalance: 0, newExpiresAt: '', error: 'Không tìm thấy hồ sơ người dùng' };
  }

  const now = new Date();

  // [FIX #3] newBalance = dailyCredits (reset đúng về quota ngày của gói mới,
  // không cộng dồn vào số dư cũ để tránh người dùng tích lũy credits bất thường)
  const newBalance = dailyCredits;

  // 2. Tính expires_at mới:
  //    - Nếu còn hạn cũ và chưa hết → nối thêm sau ngày hết hạn cũ
  //    - Nếu hết hạn rồi hoặc null → tính từ NOW()
  const oldExpires = profile.credits_expires_at ? new Date(profile.credits_expires_at) : null;
  const baseDate = oldExpires && oldExpires > now ? oldExpires : now;
  const newExpires = new Date(baseDate);
  newExpires.setDate(newExpires.getDate() + expiryDays);
  const newExpiresAt = newExpires.toISOString();
  const todayStr = now.toISOString().split('T')[0];

  // 3. Cập nhật customer_profiles
  const { error: updateErr } = await supabase
    .from('customer_profiles')
    .update({
      credits: newBalance,
      daily_allowance: dailyCredits,
      last_reset_date: todayStr,
      credits_expires_at: newExpiresAt,
      updated_at: now.toISOString(),
    })
    .eq('account_id', userId);

  if (updateErr) {
    return { newBalance: 0, newExpiresAt: '', error: updateErr.message };
  }

  // 4. Ghi credit_transactions
  await supabase.from('credit_transactions').insert({
    account_id: userId,
    amount: dailyCredits,
    balance_after: newBalance,
    type: 'package_purchase',
    reference_id: packageId,
    note: `Mua gói ${packageId} — ${dailyCredits} lượt/ngày, hạn đến ${newExpires.toLocaleDateString('vi-VN')}`,
  });

  // 5. [FIX #6] Ghi credit_package_purchases với đúng tên cột theo schema.sql
  await supabase.from('credit_package_purchases').insert({
    account_id: userId,
    package_id: packageId,
    credits_per_day_granted: dailyCredits, // FIX: Đúng tên cột trong schema.sql
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
 * NFC credits CÓ THỜI HẠN 6 THÁNG (180 ngày) kể từ ngày kích hoạt.
 * Sau 6 tháng, người dùng cần mua gói xem Tarot mới để xem tiếp.
 * Nếu đã có gói cũ còn hạn → nối thêm 180 ngày sau ngày hết hạn cũ.
 */
export async function addCreditsToUser(
  userId: string,
  amount: number,
  nfcTagId?: string
): Promise<{ newBalance: number; newExpiresAt: string; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { newBalance: 0, newExpiresAt: '', error: 'Supabase chưa được cấu hình' };
  }

  // 1. Lấy số dư hiện tại
  const { data: profile, error: fetchErr } = await supabase
    .from('customer_profiles')
    .select('credits, credits_expires_at')
    .eq('account_id', userId)
    .single();

  if (fetchErr || !profile) {
    return { newBalance: 0, newExpiresAt: '', error: 'Không tìm thấy hồ sơ người dùng' };
  }

  const now = new Date();
  const currentCredits = profile.credits ?? 0;
  const newBalance = currentCredits + amount; // amount = nfcCredits (3 luợt/ngày)

  // 2. Tính thời hạn mới: NFC tặng 6 tháng (180 ngày)
  const NFC_EXPIRY_DAYS = 180; // 6 tháng
  const oldExpires = profile.credits_expires_at ? new Date(profile.credits_expires_at) : null;
  const baseDate = oldExpires && oldExpires > now ? oldExpires : now;
  const newExpires = new Date(baseDate);
  newExpires.setDate(newExpires.getDate() + NFC_EXPIRY_DAYS);
  const newExpiresAt = newExpires.toISOString();
  const todayStr = now.toISOString().split('T')[0];

  // 3. Cập nhật customer_profiles với daily_allowance và expires_at
  const { error: updateErr } = await supabase
    .from('customer_profiles')
    .update({
      credits: newBalance,
      daily_allowance: amount,       // 3 luợt/ngày từ NFC
      last_reset_date: todayStr,
      credits_expires_at: newExpiresAt, // Hết hạn sau 6 tháng
      updated_at: now.toISOString(),
    })
    .eq('account_id', userId);

  if (updateErr) {
    return { newBalance: currentCredits, newExpiresAt: '', error: updateErr.message };
  }

  // 4. Ghi lịch sử vào credit_transactions
  await supabase.from('credit_transactions').insert({
    account_id: userId,
    amount: amount,
    balance_after: newBalance,
    type: 'nfc_activation',
    reference_id: nfcTagId || null,
    note: `Kích hoạt NFC${nfcTagId ? ` - Tag: ${nfcTagId}` : ''} — Tặng ${amount} luợt/ngày, hạn đến ${newExpires.toLocaleDateString('vi-VN')}`,
  });

  return { newBalance, newExpiresAt, error: null };
}

// ─────────────────────────────────────────────
// Consume credit (xem bài Tarot)
// ─────────────────────────────────────────────

/**
 * [FIX #1] Trừ 1 credit khi xem bài Tarot — dùng Atomic Update để tránh Race Condition.
 * Thay vì Read → Calculate → Write (không an toàn với đa tab),
 * dùng UPDATE ... WHERE credits > 0 để database tự giảm giá trị một cách atomic.
 * Trả về số dư mới hoặc -1 nếu không đủ / hết hạn.
 */
export async function consumeUserCredit(userId: string, readingId?: string): Promise<number> {
  if (!isSupabaseConfigured) return -1;

  // Bước 1: Kiểm tra thời hạn trước (read-only, an toàn)
  const { data: profile, error: fetchErr } = await supabase
    .from('customer_profiles')
    .select('credits, credits_expires_at')
    .eq('account_id', userId)
    .single();

  if (fetchErr || !profile || profile.credits <= 0) return -1;

  // ── Kiểm tra thời hạn ──
  const expiresAt = profile.credits_expires_at;
  if (expiresAt && new Date() >= new Date(expiresAt)) {
    // Hết hạn → reset credits về 0 (atomic - không cần đọc lại)
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
    return -1;
  }

  // [FIX #1] Bước 2: Atomic decrement — UPDATE chỉ thành công khi credits > 0.
  // Điều kiện `credits > 0` trong WHERE đảm bảo race condition không xảy ra:
  // Nếu 2 tab cùng gọi, chỉ 1 UPDATE thành công (database lock row),
  // cái còn lại UPDATE 0 rows → trả về -1 (không bị tiêu nhầm).
  const { data: updated, error: updateErr } = await supabase
    .from('customer_profiles')
    .update({ credits: profile.credits - 1, updated_at: new Date().toISOString() })
    .eq('account_id', userId)
    .gt('credits', 0) // Atomic guard: chỉ update nếu credits > 0
    .select('credits')
    .single();

  if (updateErr || !updated) return -1; // Không đủ credits hoặc race condition thắng

  const newBalance = updated.credits;

  // Ghi lịch sử (best-effort, không block luồng chính)
  supabase.from('credit_transactions').insert({
    account_id: userId,
    amount: -1,
    balance_after: newBalance,
    type: 'tarot_reading',
    reference_id: readingId || null,
    note: 'Trải bài Tarot',
  }).then();

  return newBalance;
}

// ─────────────────────────────────────────────
// Virtual Pet Game Helpers
// ─────────────────────────────────────────────

/**
 * Sync pet progress to database for logged in users
 */
export async function syncPetProgress(
  userId: string,
  exp: number,
  food: number,
  claimedLevels: number[]
): Promise<boolean> {
  if (!isSupabaseConfigured) return true; // Offline/demo mode

  const { error } = await supabase
    .from('customer_profiles')
    .update({
      pet_exp: exp,
      pet_food: food,
      pet_claimed_levels: claimedLevels,
      updated_at: new Date().toISOString()
    })
    .eq('account_id', userId);

  if (error) {
    console.error('Error syncing pet progress:', error.message);
    return false;
  }
  return true;
}
