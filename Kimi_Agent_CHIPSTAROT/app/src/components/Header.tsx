import { useState } from 'react';

interface HeaderProps {
  page: string;
  setPage: (p: any) => void;
  user: any;
  credits: number;
  logout: () => void;
  cartCount: number;
}

export default function Header({ page, setPage, user, credits, logout, cartCount }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navs = [
    { key: 'home', label: 'Trang chủ' },
    { key: 'reading', label: 'Xem Tarot' },
    { key: 'cards', label: 'Ý nghĩa lá bài' },
    { key: 'shop', label: 'Shop' },
    { key: 'blog', label: 'Blog' },
    { key: 'game', label: 'Trò chơi' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-yellow-200 shadow-sm">
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-white text-center py-1.5 px-4 text-sm">
        <span className="font-medium">Vũ trụ luôn ở bên bạn, tin tưởng vào hành trình của mình nhé!</span>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setPage('home')} className="flex items-center gap-2">
            <img src="/chicken-mascot.png" alt="" className="w-10 h-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">CHIPSTAROT</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navs.map(n => (
              <button key={n.key} onClick={() => setPage(n.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${page === n.key ? 'text-yellow-600 bg-yellow-100' : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'}`}>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setPage('cart')} className="relative p-2 hover:bg-yellow-50 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
            </button>
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <button onClick={() => setPage('profile')} className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-100 px-3 py-1 rounded-full">👤 Hồ sơ</button>
                <button onClick={() => setPage('admin')} className="text-sm font-medium text-purple-600 hover:text-purple-800 bg-purple-100 px-3 py-1 rounded-full">Admin</button>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">{credits} lượt</span>
                <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">Đăng xuất</button>
              </div>
            ) : (
              <button onClick={() => setPage('auth')} className="hidden md:block px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full font-medium text-sm hover:from-yellow-600 hover:to-yellow-700 transition-all">Đăng nhập</button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-yellow-100">
            {navs.map(n => (
              <button key={n.key} onClick={() => { setPage(n.key); setMenuOpen(false); }}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:bg-yellow-50 rounded-lg">{n.label}</button>
            ))}
            {user && (
              <>
                <button onClick={() => { setPage('profile'); setMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium">👤 Hồ sơ của tôi</button>
                <button onClick={() => { setPage('admin'); setMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-purple-600 hover:bg-purple-50 rounded-lg font-medium">⚙️ Admin Dashboard</button>
              </>
            )}
            {!user && <button onClick={() => { setPage('auth'); setMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-yellow-600 hover:bg-yellow-50 rounded-lg">Đăng nhập</button>}
          </div>
        )}
      </div>
    </header>
  );
}
