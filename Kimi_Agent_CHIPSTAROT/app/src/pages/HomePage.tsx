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
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm font-semibold px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <span className="animate-pulse">✦</span> Được tin dùng bởi hơn 10,000+ người dùng <span className="animate-pulse">✦</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Khám Phá Thế Giới{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                Tarot
              </span>
            </h2>
            <p className="text-purple-200/70 max-w-xl mx-auto text-lg">
              CHIPSTAROT mang đến trải nghiệm Tarot độc đáo với phong cách đầy màu sắc
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: '✨',
                title: 'Trải Bài Tarot',
                desc: 'Bốc bài và nhận thông điệp cá nhân hóa từ vũ trụ qua AI',
                gradient: 'from-yellow-400 to-amber-500',
                glow: 'rgba(251, 191, 36, 0.3)',
                border: 'border-yellow-400/20',
                badge: '🔥 Hot',
                badgeColor: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
                page: 'reading',
              },
              {
                icon: '📖',
                title: 'Ý Nghĩa Lá Bài',
                desc: 'Khám phá toàn bộ 78 lá bài Tarot với ý nghĩa chi tiết',
                gradient: 'from-violet-400 to-purple-600',
                glow: 'rgba(167, 139, 250, 0.3)',
                border: 'border-purple-400/20',
                badge: '📚 78 lá',
                badgeColor: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
                page: 'cards',
              },
              {
                icon: '🛍️',
                title: 'Shop NFC',
                desc: 'Móc khóa đá phong thủy tích hợp chip NFC — chạm là xem',
                gradient: 'from-pink-400 to-rose-500',
                glow: 'rgba(244, 114, 182, 0.3)',
                border: 'border-pink-400/20',
                badge: '⚡ Phygital',
                badgeColor: 'bg-pink-400/20 text-pink-300 border-pink-400/30',
                page: 'shop',
              },
              {
                icon: '🐣',
                title: 'Nuôi Thú Ảo',
                desc: 'Xem Tarot mỗi ngày để nhận thức ăn, nuôi thú ảo tiến hóa và nhận quà tặng đặc biệt!',
                gradient: 'from-emerald-400 to-teal-500',
                glow: 'rgba(52, 211, 153, 0.3)',
                border: 'border-emerald-400/20',
                badge: '🍗 Có thưởng',
                badgeColor: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
                page: 'game',
              },
            ].map((f) => (
              <button
                key={f.title}
                onClick={() => setPage(f.page)}
                className={`group relative text-left rounded-3xl p-6 border ${f.border} bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 overflow-hidden`}
                style={{ boxShadow: `0 0 0 transparent`, ['--glow' as any]: f.glow }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 20px 60px ${f.glow}, 0 0 0 1px ${f.glow}`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 transparent')}
              >
                {/* Card inner glow top */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${f.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`} />

                {/* Badge */}
                <div className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border mb-5 ${f.badgeColor}`}>
                  {f.badge}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                  {f.title}
                </h3>
                <p className="text-purple-200/60 text-sm leading-relaxed">{f.desc}</p>

                {/* CTA arrow */}
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-yellow-400/70 group-hover:text-yellow-400 transition-all duration-300">
                  <span>Khám phá ngay</span>
                  <span className="transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                </div>

                {/* Bottom line decoration */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
              </button>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '78', label: 'Lá bài Tarot', icon: '🃏' },
              { value: '10K+', label: 'Người dùng', icon: '👥' },
              { value: '99%', label: 'Hài lòng', icon: '⭐' },
              { value: '24/7', label: 'Vũ trụ online', icon: '🔮' },
            ].map(s => (
              <div key={s.label} className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-5">
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-2xl font-black text-yellow-400">{s.value}</p>
                <p className="text-purple-300/60 text-xs mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Magic Garden Game Section */}
      <section className="relative py-24 overflow-hidden bg-[#0d0029] text-white">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-yellow-400/20 p-8 md:p-12 shadow-[0_0_50px_rgba(251,191,36,0.1)] flex flex-col md:flex-row items-center gap-12 group">
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-sm font-bold px-4 py-2 rounded-full mb-6">
                ✨ Tính năng mới
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Khu Vườn Phép Thuật <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500">
                  Nuôi Thú Ảo - Nhận Quà VIP
                </span>
              </h2>
              <p className="text-purple-200 text-lg mb-8 leading-relaxed">
                Hành trình tâm linh của bạn giờ đây thú vị hơn bao giờ hết! Mỗi lần xem Tarot, bạn sẽ nhận được <strong className="text-yellow-400">Lương Thực</strong>. Hãy dùng nó để ấp nở và nuôi lớn Linh Thú của riêng mình. Khi thú cưng tiến hóa đến cấp độ tối thượng, bạn sẽ mở khóa phần thưởng bí mật từ vũ trụ!
              </p>
              <button 
                onClick={() => setPage('game')} 
                className="btn-3d-yellow text-lg px-8 py-4 w-full md:w-auto flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <span>🐣</span> Vào chuồng ngay
              </button>
            </div>
            
            <div className="md:w-1/2 flex justify-center relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl group-hover:bg-yellow-400/40 transition-colors duration-700" />
              
              {/* Floating elements around */}
              <div className="absolute top-0 left-10 text-3xl animate-[bounce_3s_infinite]">🔮</div>
              <div className="absolute bottom-10 right-10 text-2xl animate-[bounce_4s_infinite]">🍗</div>
              <div className="absolute top-20 right-20 text-4xl animate-[pulse_2s_infinite]">⭐</div>
              
              {/* Main character */}
              <div 
                className="relative z-10 group-hover:scale-110 transition-transform duration-500 cursor-pointer w-64 h-64 md:w-80 md:h-80"
                onClick={() => setPage('game')}
              >
                <img 
                  src="/pet_mystic.png" 
                  alt="Gà Thần Vũ Trụ" 
                  className="w-full h-full object-contain animate-[wiggle_4s_ease-in-out_infinite] drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]"
                />
              </div>
            </div>
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
