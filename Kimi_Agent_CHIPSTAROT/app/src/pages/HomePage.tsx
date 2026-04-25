import { useState, useEffect } from 'react';

export default function HomePage({ setPage }: any) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { const t = setInterval(() => setFlipped(f => !f), 3000); return () => clearInterval(t); }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-main.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-transparent to-yellow-900/50" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 bg-clip-text text-transparent">CHIPSTAROT</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-light drop-shadow">
            Khám phá bí ẩn vũ trụ qua 78 lá bài Tarot<br />
            <span className="text-yellow-300 font-medium">Mang vũ trụ bên mình - Chạm để chữa lành</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setPage('reading')} className="btn-3d-yellow">✨ Bốc Bài Ngay</button>
            <button onClick={() => setPage('shop')} className="btn-3d-white">🛒 Khám Phá Shop</button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Khám Phá Thế Giới <span className="text-yellow-500">Tarot</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">CHIPSTAROT mang đến trải nghiệm Tarot độc đáo với phong cách đầy màu sắc</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '✨', title: 'Trải Bài Tarot', desc: 'Bốc bài và nhận thông điệp từ vũ trụ', color: 'from-yellow-400 to-yellow-500', page: 'reading' },
              { icon: '📖', title: 'Ý Nghĩa Lá Bài', desc: 'Khám phá 78 lá bài Tarot', color: 'from-purple-400 to-purple-500', page: 'cards' },
              { icon: '🛍️', title: 'Shop NFC', desc: 'Móc khóa đá phong thủy tích hợp NFC', color: 'from-pink-400 to-pink-500', page: 'shop' },
              { icon: '🎮', title: 'Trò Chơi', desc: 'Chơi game con gà vượt chướng ngại!', color: 'from-green-400 to-green-500', page: 'game' },
            ].map(f => (
              <button key={f.title} onClick={() => setPage(f.page)} className="feature-card-3d text-left">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 text-2xl`}>{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
                <div className="mt-4 flex items-center text-yellow-600 text-sm font-medium">Khám phá →</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* About with Rotating Card */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 flex justify-center">
              <div className="card-flip-container">
                <div className={`card-flip ${flipped ? 'flipped' : ''}`}>
                  <div className="card-front"><img src="/card-back-rotating.png" alt="" className="w-72 h-auto rounded-2xl shadow-2xl" /></div>
                  <div className="card-back"><img src="/card-back.png" alt="" className="w-72 h-auto rounded-2xl shadow-2xl" /></div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Chíp Tarot Say <span className="text-yellow-500">"Hiii"</span> 👋</h2>
              <div className="space-y-4 text-gray-600">
                <p><span className="font-semibold text-yellow-600">🐥 Chạm là xem:</span> Áp điện thoại vào đá tích hợp NFC → Tự động trải và giải mã Tarot</p>
                <p><span className="font-semibold text-yellow-600">💰 Tiết kiệm:</span> Không mất thời gian học thuộc bài, không tốn tiền đi xem bên ngoài</p>
                <p><span className="font-semibold text-yellow-600">✨ Đa năng:</span> Dễ dàng xem cho bản thân và bạn bè mọi lúc mọi nơi</p>
              </div>
              <button onClick={() => setPage('shop')} className="btn-3d-yellow mt-8">💖 Tìm Hiểu Thêm</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
