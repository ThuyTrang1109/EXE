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
            <p className="text-purple-200 text-sm mb-4">Khám phá bí ẩn vũ trụ qua 78 lá bài Tarot. Công nghệ NFC Phygital độc nhất Việt Nam.</p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 bg-purple-700 rounded-full text-purple-200">📍 Hồ Chí Minh</span>
              <span className="text-xs px-2 py-1 bg-purple-700 rounded-full text-purple-200">📧 hello@chipstarot.com</span>
            </div>
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
            <ul className="space-y-2 text-purple-200 text-sm">
              <li className="flex items-center gap-2">📞 +84 867 774 023</li>
              <li className="flex items-center gap-2">📧 hello@chipstarot.com</li>
              <li className="flex items-center gap-2">📍 Ho Chi Minh City, Việt Nam</li>
              <li className="flex items-center gap-2">⏰ Hỗ trợ: 8:00 – 22:00 hàng ngày</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Kết Nối</h3>
            <div className="flex gap-3 mb-4">
              <a href="https://shopee.vn/geehandmade" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center hover:bg-orange-400 transition-colors text-sm font-bold" title="Shopee">S</a>
              <a href="https://tiktok.com/@geehandmade" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors text-sm font-bold" title="TikTok">T</a>
              <a href="https://facebook.com/chipstarot" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-500 transition-colors text-sm font-bold" title="Facebook">f</a>
              <a href="https://zalo.me/chipstarot" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-300 transition-colors text-sm font-bold" title="Zalo">Z</a>
            </div>
            <div className="bg-purple-800/50 rounded-xl p-3 text-xs text-purple-200">
              <p className="font-semibold text-yellow-400 mb-1">📦 Giao hàng toàn quốc</p>
              <p>Miễn phí ship đơn trên 200.000đ</p>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-purple-700 flex flex-col md:flex-row justify-between items-center text-purple-300 text-sm gap-2">
          <span>© 2026 CHIPSTAROT. All Rights Reserved.</span>
          <span>Made with ❤️ in Vietnam 🇻🇳</span>
        </div>
      </div>
    </footer>
  );
}
