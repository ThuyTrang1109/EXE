import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  
  const navLinks = [
    { k: '/', l: 'Bói Bài Tarot' },
    { k: '/cards', l: 'Ý Nghĩa Lá Bài' },
    { k: '/shop', l: 'Shop' },
    { k: '/game', l: 'Khu Vườn Phép Thuật' },
    { k: '/blog', l: 'Blog' },
    { k: '/about', l: 'Giới Thiệu' }
  ];

  return (
    <footer className="bg-gradient-to-br from-purple-900 via-purple-800 to-yellow-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4"><img src="/chicken-mascot.png" alt="" className="w-12 h-12" /><span className="text-2xl font-bold text-yellow-400">CHIPSTAROT</span></div>
            <p className="text-purple-200 text-sm">Khám phá bí ẩn vũ trụ qua 78 lá bài Tarot</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Liên Kết</h3>
            <ul className="space-y-2 text-purple-200 text-sm">
              {navLinks.map(l => (
                <li key={l.k}><button onClick={() => navigate(l.k)} className="hover:text-yellow-400 transition-colors">{l.l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Liên Hệ</h3>
            <ul className="space-y-2 text-purple-200 text-sm"><li>+84 867 774 023</li><li>hello@chipstarot.com</li><li>Ho Chi Minh City</li></ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Kết Nối</h3>
            <div className="flex gap-3">
              <a href="https://shopee.vn/geehandmade" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center hover:bg-yellow-500 transition-colors text-sm">S</a>
              <a href="https://tiktok.com/@geehandmade" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center hover:bg-yellow-500 transition-colors text-sm">T</a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-purple-700 text-center text-purple-300 text-sm">© 2024 CHIPSTAROT. All Rights Reserved.</div>
      </div>
    </footer>
  );
}
