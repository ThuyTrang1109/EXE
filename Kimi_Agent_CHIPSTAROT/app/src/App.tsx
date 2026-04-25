import { useState, useEffect } from 'react';
import './App.css';

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

// Heavy pages (still in separate files)
import ReadingPage from '@/pages/ReadingPage';
import CardsPage from '@/pages/CardsPage';
import GamePage from '@/pages/GamePage';
import BlogPage from '@/pages/BlogPage';

// IDE Refresh trigger

type PageType = 'home' | 'reading' | 'cards' | 'shop' | 'game' | 'blog' | 'cart' | 'checkout' | 'admin' | 'profile' | 'auth';

export default function App() {
  const [page, setPage] = useState<PageType>(() => {
    const path = window.location.pathname.substring(1);
    const validPages = ['home', 'reading', 'cards', 'shop', 'game', 'blog', 'cart', 'checkout', 'admin', 'profile', 'auth'];
    return validPages.includes(path) ? (path as PageType) : 'home';
  });
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [cart, setCart] = useState<any[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    window.history.pushState({}, '', page === 'home' ? '/' : `/${page}`);
  }, [page]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1);
      const validPages = ['home', 'reading', 'cards', 'shop', 'game', 'blog', 'cart', 'checkout', 'admin', 'profile', 'auth'];
      setPage(validPages.includes(path) ? (path as PageType) : 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const logout = () => { setUser(null); setCredits(0); setPage('home'); };
  const consumeCredit = () => {
    if (credits > 0) { setCredits(credits - 1); return true; }
    setShowPaywall(true);
    return false;
  };
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100">
      <Header
        page={page}
        setPage={setPage}
        user={user}
        credits={credits}
        logout={logout}
        cartCount={cartCount}
      />

      {page === 'home' && <HomePage setPage={setPage} user={user} />}
      {page === 'reading' && <ReadingPage user={user} consumeCredit={consumeCredit} setPage={setPage} />}
      {page === 'cards' && <CardsPage />}
      {page === 'shop' && <ShopPage addToCart={addToCart} />}
      {page === 'cart' && <CartPage cart={cart} updateQty={updateQty} removeFromCart={removeFromCart} total={cartTotal} setPage={setPage} />}
      {page === 'checkout' && <CheckoutPage cart={cart} total={cartTotal} setPage={setPage} />}
      {page === 'game' && <GamePage />}
      {page === 'blog' && <BlogPage />}
      {page === 'admin' && <AdminPage setPage={setPage} />}
      {page === 'profile' && <ProfilePage user={user} setPage={setPage} />}
      {page === 'auth' && <AuthPage setUser={setUser} setCredits={setCredits} setPage={setPage} />}

      <Footer setPage={setPage} />

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPaywall(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-2xl font-bold mb-2">Hết lượt bốc bài!</h2>
            <p className="text-gray-600 mb-4">Bạn đã sử dụng hết 3 lượt miễn phí.</p>
            <div className="bg-gradient-to-r from-purple-100 to-yellow-100 rounded-xl p-4 mb-6">
              <p className="font-semibold text-purple-700">💎 Mua móc khóa NFC để nhận thêm lượt!</p>
              <p className="text-sm text-gray-600 mt-1">Mỗi sản phẩm đi kèm 10 lượt bốc bài</p>
            </div>
            <button onClick={() => { setShowPaywall(false); setPage('shop'); }} className="btn-3d-yellow w-full mb-3">Khám phá Shop ngay</button>
            <button onClick={() => setShowPaywall(false)} className="text-gray-500 hover:text-gray-700 text-sm">Để sau</button>
          </div>
        </div>
      )}
    </div>
  );
}
