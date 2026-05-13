import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Settings, LogOut, LogIn, ShoppingCart, Sparkles, AlertTriangle, Menu, X } from 'lucide-react';
import { usePermission } from '../hooks/usePermission';

interface HeaderProps {
  user: any;
  credits: number;
  creditsExpired?: boolean;
  expiryLabel?: { label: string; urgency: 'none' | 'ok' | 'warning' | 'expired' };
  logout: () => void;
  cartCount: number;
}

export default function Header({ user, credits, creditsExpired, expiryLabel, logout, cartCount }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { can, isAdmin } = usePermission();

  const navs = [
    { key: 'home', path: '/', label: 'Trang chủ' },
    { key: 'reading', path: '/reading', label: 'Xem Tarot' },
    { key: 'cards', path: '/cards', label: 'Ý nghĩa lá bài' },
    { key: 'shop', path: '/shop', label: 'Shop' },
    { key: 'blog', path: '/blog', label: 'Blog' },
    { key: 'game', path: '/game', label: 'Trò chơi' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0A1F]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-900 text-purple-100 text-center py-1.5 px-4 text-sm border-b border-purple-500/30">
        <span className="font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-300" /> Vũ trụ luôn ở bên bạn, tin tưởng vào hành trình của mình nhé! <Sparkles className="w-4 h-4 text-yellow-300" />
        </span>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/chicken-mascot.png" alt="" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-yellow-300 to-yellow-600 bg-clip-text text-transparent drop-shadow-md">CHIPSTAROT</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navs.map(n => (
              <button key={n.key} onClick={() => handleNav(n.path)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  (n.key === 'home' && location.pathname === '/') || location.pathname === n.path
                    ? 'text-yellow-300 bg-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]'
                    : 'text-purple-200 hover:text-yellow-300 hover:bg-white/5'
                }`}>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/cart')} className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-6 h-6 text-purple-200 hover:text-yellow-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-white/20">{cartCount}</span>}
            </button>
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <button onClick={() => navigate('/profile')} className="text-sm font-medium text-blue-300 hover:text-blue-100 bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Hồ sơ
                </button>
                {isAdmin() && (
                  <button onClick={() => navigate('/admin')} className="text-sm font-medium text-purple-300 hover:text-purple-100 bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Settings className="w-4 h-4" /> Admin
                  </button>
                )}
                <div className="relative group">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium cursor-help flex items-center gap-1 ${
                    creditsExpired ? 'bg-red-100 text-red-700' :
                    expiryLabel?.urgency === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {creditsExpired ? 'Hết hạn' : `${credits} lượt`}
                    {expiryLabel?.urgency === 'warning' && !creditsExpired && <AlertTriangle className="w-4 h-4" />}
                  </span>
                  {/* Tooltip */}
                  {expiryLabel && expiryLabel.urgency !== 'none' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-[200px] px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      {creditsExpired ? 'Lượt bốc bài đã hết hạn' : `Hạn dùng: ${expiryLabel.label}`}
                    </div>
                  )}
                </div>
                <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/auth')} className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full font-medium text-sm hover:from-yellow-600 hover:to-yellow-700 transition-all">
                <LogIn className="w-4 h-4" /> Đăng nhập
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-purple-200 hover:text-yellow-300">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            {navs.map(n => (
              <button key={n.key} onClick={() => handleNav(n.path)}
                className="block w-full text-left px-4 py-3 text-purple-200 hover:text-yellow-300 hover:bg-white/5 rounded-lg">{n.label}</button>
            ))}
            {user && (
              <>
                <button onClick={() => handleNav('/profile')} className="w-full text-left px-4 py-3 text-blue-300 hover:bg-white/5 rounded-lg font-medium flex items-center gap-3">
                  <User className="w-5 h-5" /> Hồ sơ của tôi
                </button>
                {isAdmin() && (
                  <button onClick={() => handleNav('/admin')} className="w-full text-left px-4 py-3 text-purple-300 hover:bg-white/5 rounded-lg font-medium flex items-center gap-3">
                    <Settings className="w-5 h-5" /> Admin Dashboard
                  </button>
                )}
                <button onClick={() => { logout(); navigate('/'); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 rounded-lg font-medium flex items-center gap-3">
                  <LogOut className="w-5 h-5" /> Đăng xuất
                </button>
              </>
            )}
            {!user && (
              <button onClick={() => handleNav('/auth')} className="w-full text-left px-4 py-3 text-yellow-400 hover:bg-white/5 rounded-lg font-medium flex items-center gap-3">
                <LogIn className="w-5 h-5" /> Đăng nhập
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
