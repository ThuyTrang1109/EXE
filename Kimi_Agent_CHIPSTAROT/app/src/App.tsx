import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { useAuth } from '@/lib/AuthContext';

// Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Pages
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import AdminPage from '@/pages/AdminPage';
import ProfilePage from '@/pages/ProfilePage';
import AuthPage from '@/pages/AuthPage';
import ReadingPage from '@/pages/ReadingPage';
import CardsPage from '@/pages/CardsPage';
import GamePage from '@/pages/GamePage';
import BlogPage from '@/pages/BlogPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import AboutPage from '@/pages/AboutPage';
import NotFoundPage from '@/pages/NotFoundPage';
import PaymentPage from '@/pages/PaymentPage';
import NFCScannerOverlay from '@/components/NFCScannerOverlay';

export default function App() {
  // ── Auth (từ AuthContext — persistent qua reload) ──
  const { user, loading, credits, creditsExpired, expiryLabel, addCredits, consumeCredit, logout } = useAuth();

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

  // ── Cart helpers ──
  const addToCart = (p: any) => {
    const existing = cart.find(c => c.id === p.id);
    if (existing) setCart(cart.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c));
    else setCart([...cart, { ...p, qty: 1 }]);
  };
  const removeFromCart = (id: number) => setCart(cart.filter(c => c.id !== id));
  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) removeFromCart(id);
    else setCart(cart.map(c => c.id === id ? { ...c, qty } : c));
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100">
      <Header
        user={user}
        credits={credits}
        creditsExpired={creditsExpired}
        expiryLabel={expiryLabel}
        logout={logout}
        cartCount={cartCount}
      />

      <Routes>
        <Route path="/" element={<HomePage setPage={(p: any) => navigate(p === 'home' ? '/' : `/${p}`)} />} />
        <Route path="/home" element={<HomePage setPage={(p: any) => navigate(p === 'home' ? '/' : `/${p}`)} />} />
        <Route path="/reading" element={<ReadingPage user={user} consumeCredit={handleConsumeCredit} />} />
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
          user?.role_id === 1
            ? <AdminPage setPage={(p: any) => navigate(p === 'home' ? '/' : `/${p}`)} />
            : <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-yellow-900 flex items-center justify-center p-6">
                <div className="text-center text-white">
                  <div className="text-7xl mb-6">🚫</div>
                  <h1 className="text-3xl font-bold mb-3">Truy cập bị từ chối</h1>
                  <p className="text-purple-200 mb-8">{user ? 'Tài khoản của bạn không có quyền Admin.' : 'Vui lòng đăng nhập bằng tài khoản Admin.'}</p>
                  <button onClick={() => navigate(user ? '/' : '/auth')} className="bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-bold px-8 py-3 rounded-xl transition-all">
                    {user ? '← Về trang chủ' : '→ Đăng nhập'}
                  </button>
                </div>
              </div>
        } />
        <Route path="/profile" element={<ProfilePage user={user} onScanClick={() => setShowScanner(true)} />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

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
