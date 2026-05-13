import { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { RequirePermission, RequireAdmin, RequireAuth } from '@/hooks/usePermission';

// Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NFCScannerOverlay from '@/components/NFCScannerOverlay';
import { CosmosBackground } from './components/CosmosBackground';

// Pages - Lazy Loaded for Performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const ReadingPage = lazy(() => import('@/pages/ReadingPage'));
const CardsPage = lazy(() => import('@/pages/CardsPage'));
const GamePage = lazy(() => import('@/pages/GamePage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const PaymentPage = lazy(() => import('@/pages/PaymentPage'));

export default function App() {
  // ── Auth (từ AuthContext — persistent qua reload) ──
  const { user, loading, credits, creditsExpired, expiryLabel, addCredits, consumeCredit, refreshCredits, logout, setLastScannedTagId } = useAuth();

  // ── Navigation ──
  const navigate = useNavigate();
  const location = useLocation();

  const [showScanner, setShowScanner] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [cart, setCart] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('chipstarot_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── Sync cart to localStorage ──
  useEffect(() => {
    localStorage.setItem('chipstarot_cart', JSON.stringify(cart));
  }, [cart]);

  // ── FIX: Load giỏ hàng từ backend khi user đăng nhập (sync giỮa thiết bị) ──
  const syncCartFromBackend = useCallback(async () => {
    if (!user || user.id.startsWith('demo-')) return; // bỏ qua demo mode
    try {
      const res = await api.getCart();
      if (res.success && res.data?.items?.length > 0) {
        const backendCart = res.data.items.map((item: any) => ({
          id: item.productId,
          name: item.productName,
          price: item.price,
          image: item.imageUrl,
          qty: item.quantity,
        }));
        setCart(backendCart);
      }
    } catch {
      // giữ nguyên giỏ hàng local nếu backend bị lỗi
    }
  }, [user]);

  // Load cart từ backend mỗi khi user thay đổi (login/logout)
  useEffect(() => {
    if (user) {
      syncCartFromBackend();
    } else {
      // Logout: xóa giỏ hàng local
      setCart([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Handle NFC tagId from URL ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tagId = params.get('tagId');
    if (tagId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowScanner(true);
      // Clear the query param without refreshing
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // ── Navigation helper ──
  const viewProduct = (id: number) => {
    navigate(`/product/${id}`);
    window.scrollTo(0, 0);
  };

  // ── NFC scan success: cộng credits vào DB ──
  const handleScanSuccess = async (addedCredits: number, nfcTagId?: string) => {
    await addCredits(addedCredits, nfcTagId);
    if (nfcTagId) setLastScannedTagId(nfcTagId);
    setShowScanner(false);
  };

  // ── Consume credit for reading ──
  const handleConsumeCredit = async (): Promise<boolean> => {
    if (credits <= 0) {
      setShowPaywall(true);
      return false;
    }
    const success = await consumeCredit();
    if (!success) {
      setShowPaywall(true);
      return false;
    }
    return true;
  };

  // ── FIX: Cart helpers — optimistic update + backend sync ──
  const addToCart = async (p: any) => {
    // Optimistic: cập nhật local state trước
    const existing = cart.find(c => c.id === p.id);
    if (existing) setCart(cart.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c));
    else setCart([...cart, { ...p, qty: 1 }]);

    // Backend sync cho user thật (không phải demo)
    if (user && !user.id.startsWith('demo-')) {
      try { await api.addToCart(p.id, 1); }
      catch { /* giữ optimistic update nếu backend lỗi */ }
    }
  };

  const removeFromCart = async (id: number) => {
    setCart(cart.filter(c => c.id !== id));
    if (user && !user.id.startsWith('demo-')) {
      try { await api.removeFromCart(id); } catch { }
    }
  };

  const updateQty = async (id: number, qty: number) => {
    if (qty <= 0) {
      await removeFromCart(id);
    } else {
      setCart(cart.map(c => c.id === id ? { ...c, qty } : c));
      if (user && !user.id.startsWith('demo-')) {
        try { await api.updateCartItem(id, qty); } catch { }
      }
    }
  };
  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  // ── Loading screen khi đang kiểm tra session ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-yellow-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl animate-bounce mb-6">🔮</div>
          <p className="text-purple-200 text-lg">Đang kết nối vũ trụ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white">
      <CosmosBackground />
      <Header
        user={user}
        credits={credits}
        creditsExpired={creditsExpired}
        expiryLabel={expiryLabel}
        logout={logout}
        cartCount={cartCount}
      />

      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">Đang tải trang...</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage setPage={(p: any) => navigate(p === 'home' ? '/' : `/${p}`)} />} />
          <Route path="/home" element={<HomePage setPage={(p: any) => navigate(p === 'home' ? '/' : `/${p}`)} />} />
          <Route path="/reading" element={<ReadingPage user={user} consumeCredit={handleConsumeCredit} refreshCredits={refreshCredits} onScanClick={() => setShowScanner(true)} />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/shop" element={<ShopPage addToCart={addToCart} viewProduct={viewProduct} />} />
          <Route path="/product/:productId" element={<ProductDetailPage addToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage cart={cart} updateQty={updateQty} removeFromCart={removeFromCart} total={cartTotal} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} total={cartTotal} />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={
            <RequireAdmin>
              <AdminPage setPage={(p: any) => navigate(p === 'home' ? '/' : `/${p}`)} />
            </RequireAdmin>
          } />
          <Route path="/profile" element={
            <RequireAuth>
              <ProfilePage user={user} onScanClick={() => setShowScanner(true)} />
            </RequireAuth>
          } />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Footer />

      {/* Paywall Modal */}
      {showPaywall && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPaywall(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-8 text-center relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-2xl font-bold mb-2">
              {creditsExpired ? 'Lượt bốc bài đã hết hạn!' : 'Hết lượt bốc bài!'}
            </h2>
            <p className="text-gray-600 mb-5">
              {user 
                ? (creditsExpired ? 'Gói Tarot của bạn đã quá hạn sử dụng.' : 'Bạn đã sử dụng hết toàn bộ lượt.') 
                : 'Bạn đã dùng hết lượt miễn phí.'}
            </p>

            {/* Option 1: Mua gói lượt số */}
            <button
              onClick={() => { setShowPaywall(false); navigate('/shop'); }}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-2xl mb-3 hover:opacity-90 transition-all active:scale-95"
            >
              ⚡ Mua Gói Lượt Tarot — nạp ngay!
              <p className="text-xs text-purple-200 font-normal mt-0.5">Từ 29.000đ / 3 lượt mỗi ngày — cộng tức thì</p>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">hoặc</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Option 2: Mua móc khóa vật lý */}
            <button
              onClick={() => { setShowPaywall(false); navigate('/shop'); }}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-bold py-4 rounded-2xl mb-4 hover:opacity-90 transition-all active:scale-95"
            >
              📿 Mua Móc Khóa NFC
              <p className="text-xs text-yellow-900 font-normal mt-0.5">Tặng 3 lượt/ngày trong 6 tháng — quét chip khi nhận hàng</p>
            </button>

            <button onClick={() => setShowPaywall(false)} className="text-gray-400 hover:text-gray-600 text-sm">
              Để sau
            </button>
          </div>
        </div>
      )}

      {/* NFC Scanner Overlay */}
      {showScanner && (
        <NFCScannerOverlay
          onSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
          userId={user?.id}
        />
      )}
    </div>
  );
}
