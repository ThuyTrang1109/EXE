import { useState, useEffect } from 'react';
import { Sparkles, BookOpen, ShoppingBag, Egg, Flame, Zap, Gift, Star } from 'lucide-react';

export default function HomePage({ setPage }: any) {
  const [flipped, setFlipped] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t = setInterval(() => setFlipped(f => !f), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="relative">

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">

        {/* Dynamic mouse-follow glow */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none transition-all duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
            left: `${mousePos.x * 100}%`,
            top: `${mousePos.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Floating cosmic orbs */}
        <div className="absolute top-20 left-10 w-3 h-3 bg-yellow-300 rounded-full blur-sm animate-[pulse_3s_infinite] opacity-60" />
        <div className="absolute top-40 right-20 w-2 h-2 bg-purple-300 rounded-full blur-sm animate-[pulse_4s_infinite_1s] opacity-50" />
        <div className="absolute bottom-32 left-24 w-4 h-4 bg-blue-300 rounded-full blur-sm animate-[pulse_5s_infinite_2s] opacity-40" />
        <div className="absolute bottom-20 right-16 w-2 h-2 bg-pink-300 rounded-full blur-sm animate-[pulse_3.5s_infinite_0.5s] opacity-50" />

        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-purple-500/10 animate-[spin_40s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-yellow-400/5 animate-[spin_60s_linear_infinite_reverse]" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm font-semibold px-5 py-2 rounded-full mb-8 backdrop-blur-sm">
            <span className="animate-pulse">✦</span>
            Nền tảng Tarot AI hàng đầu Việt Nam
            <span className="animate-pulse">✦</span>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tight">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 30%, #f59e0b 50%, #fbbf24 70%, #fde68a 100%)',
                backgroundSize: '200% auto',
                animation: 'text-shimmer 4s linear infinite',
              }}
            >
              CHIPSTAROT
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-purple-100/80 mb-4 max-w-2xl mx-auto font-light">
            Khám phá bí ẩn vũ trụ qua 78 lá bài Tarot
          </p>
          <p className="text-lg text-yellow-300/80 mb-12 font-medium">
            ✨ Mang vũ trụ bên mình — Chạm để chữa lành ✨
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setPage('reading')} className="btn-3d-yellow text-lg px-8 py-4">
              ✨ Bốc Bài Ngay
            </button>
            <button onClick={() => setPage('shop')} className="btn-3d-white text-lg px-8 py-4">
              🛒 Khám Phá Shop
            </button>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative max-w-4xl mx-auto group z-20">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-yellow-400/10 to-pink-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d2b] via-transparent to-transparent opacity-60 z-10" />
              <img 
                src="/hero-main.jpg" 
                alt="CHIPSTAROT Hero" 
                className="w-full h-auto object-cover aspect-[21/9] sm:aspect-[21/9] hover:scale-105 transition-transform duration-700 relative z-0"
              />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-purple-300/50 animate-bounce">
            <span className="text-xs tracking-widest uppercase">Khám phá</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative py-24 overflow-hidden">
        {/* Subtle divider glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

        {/* Background blobs to add depth over cosmos */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />

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
            <p className="text-purple-200/60 max-w-xl mx-auto text-lg">
              CHIPSTAROT mang đến trải nghiệm Tarot độc đáo với phong cách đầy màu sắc
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <Sparkles className="w-8 h-8 text-white" />,
                title: 'Trải Bài Tarot',
                desc: 'Bốc bài và nhận thông điệp cá nhân hóa từ vũ trụ qua AI',
                gradient: 'from-yellow-400 to-amber-500',
                glow: 'rgba(251, 191, 36, 0.3)',
                border: 'border-yellow-400/20',
                badge: <div className="flex items-center gap-1"><Flame className="w-3 h-3" /> Hot</div>,
                badgeColor: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
                page: 'reading',
              },
              {
                icon: <BookOpen className="w-8 h-8 text-white" />,
                title: 'Ý Nghĩa Lá Bài',
                desc: 'Khám phá toàn bộ 78 lá bài Tarot với ý nghĩa chi tiết',
                gradient: 'from-violet-400 to-purple-600',
                glow: 'rgba(167, 139, 250, 0.3)',
                border: 'border-purple-400/20',
                badge: <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> 78 lá</div>,
                badgeColor: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
                page: 'cards',
              },
              {
                icon: <ShoppingBag className="w-8 h-8 text-white" />,
                title: 'Shop NFC',
                desc: 'Móc khóa đá phong thủy tích hợp chip NFC — chạm là xem',
                gradient: 'from-pink-400 to-rose-500',
                glow: 'rgba(244, 114, 182, 0.3)',
                border: 'border-pink-400/20',
                badge: <div className="flex items-center gap-1"><Zap className="w-3 h-3" /> Phygital</div>,
                badgeColor: 'bg-pink-400/20 text-pink-300 border-pink-400/30',
                page: 'shop',
              },
              {
                icon: <Egg className="w-8 h-8 text-white" />,
                title: 'Nuôi Thú Ảo',
                desc: 'Xem Tarot mỗi ngày để nhận thức ăn, nuôi thú ảo tiến hóa và nhận quà tặng đặc biệt!',
                gradient: 'from-emerald-400 to-teal-500',
                glow: 'rgba(52, 211, 153, 0.3)',
                border: 'border-emerald-400/20',
                badge: <div className="flex items-center gap-1"><Gift className="w-3 h-3" /> Có thưởng</div>,
                badgeColor: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
                page: 'game',
              },
            ].map((f) => (
              <button
                key={f.title}
                onClick={() => setPage(f.page)}
                className={`group relative text-left rounded-3xl p-6 border ${f.border} bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-2 overflow-hidden`}
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
              <div key={s.label} className="text-center bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-5 hover:bg-white/[0.07] transition-colors">
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-2xl font-black text-yellow-400">{s.value}</p>
                <p className="text-purple-300/60 text-xs mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </section>

      {/* ── GAME PROMO ── */}
      <section className="relative py-24 overflow-hidden">
        {/* Cosmic nebula effect specific to this section */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/5 via-transparent to-emerald-900/5 pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <div
            className="bg-white/[0.04] backdrop-blur-xl rounded-3xl border border-yellow-400/20 p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 group"
            style={{ boxShadow: '0 0 80px rgba(251,191,36,0.05), inset 0 0 80px rgba(251,191,36,0.02)' }}
          >
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-sm font-bold px-4 py-2 rounded-full mb-6">
                ✨ Tính năng mới
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white">
                Khu Vườn Phép Thuật <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500">
                  Nuôi Thú Ảo - Nhận Quà VIP
                </span>
              </h2>
              <p className="text-purple-200/70 text-lg mb-8 leading-relaxed">
                Hành trình tâm linh của bạn giờ đây thú vị hơn bao giờ hết! Mỗi lần xem Tarot, bạn sẽ nhận được{' '}
                <strong className="text-yellow-400">Lương Thực</strong>. Hãy dùng nó để ấp nở và nuôi lớn Linh Thú của riêng mình.
                Khi thú cưng tiến hóa đến cấp độ tối thượng, bạn sẽ mở khóa phần thưởng bí mật từ vũ trụ!
              </p>
              <button
                onClick={() => setPage('game')}
                className="btn-3d-yellow text-lg px-8 py-4 w-full md:w-auto flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <span>🐣</span> Vào chuồng ngay
              </button>
            </div>

            <div className="md:w-1/2 flex justify-center relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-yellow-400/15 rounded-full blur-3xl group-hover:bg-yellow-400/30 transition-colors duration-700" />

              {/* Floating elements around */}
              <div className="absolute top-0 left-10 text-3xl animate-[bounce_3s_infinite]">🔮</div>
              <div className="absolute bottom-10 right-10 text-2xl animate-[bounce_4s_infinite]">🍗</div>
              <div className="absolute top-20 right-20 text-4xl animate-[pulse_2s_infinite]">⭐</div>

              {/* Stars orbit */}
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${deg}deg) translateX(130px)`,
                    animation: `spin ${8 + i}s linear infinite`,
                    opacity: 0.5 + i * 0.08,
                  }}
                />
              ))}

              {/* Main character */}
              <div
                className="relative z-10 group-hover:scale-110 transition-transform duration-500 cursor-pointer w-64 h-64 md:w-80 md:h-80"
                onClick={() => setPage('game')}
              >
                <img
                  src="/pet_mystic.png"
                  alt="Gà Thần Vũ Trụ"
                  className="w-full h-full object-contain animate-[wiggle_4s_ease-in-out_infinite] drop-shadow-[0_0_40px_rgba(251,191,36,0.9)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT / ROTATING CARD ── */}
      <section className="relative py-24 overflow-hidden">
        {/* Top glow divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />

        {/* Cosmic accent for this section */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-800/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section badge */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-400/10 border border-purple-400/20 text-purple-300 text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm">
              <Star className="w-3.5 h-3.5" /> Về CHIPSTAROT
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Rotating Card */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-purple-500/20 to-pink-400/20 blur-3xl rounded-full scale-125" />
                {/* Stars around card */}
                {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} text-yellow-300 text-xl animate-[pulse_${2 + i}s_infinite]`}>✦</div>
                ))}
                <div className="card-flip-container relative z-10">
                  <div className={`card-flip ${flipped ? 'flipped' : ''}`}>
                    <div className="card-front">
                      <img
                        src="/card-back-rotating.png"
                        alt=""
                        className="w-72 h-auto rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.4)]"
                      />
                    </div>
                    <div className="card-back">
                      <img
                        src="/card-back.png"
                        alt=""
                        className="w-72 h-auto rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.4)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Chíp Tarot Say{' '}
                <span className="text-yellow-400">"Hiii"</span>{' '}
                👋
              </h2>
              <div className="space-y-5">
                {[
                  {
                    icon: '🐥',
                    label: 'Chạm là xem:',
                    text: 'Áp điện thoại vào đá tích hợp NFC → Tự động trải và giải mã Tarot',
                    color: 'text-yellow-400',
                  },
                  {
                    icon: '💰',
                    label: 'Tiết kiệm:',
                    text: 'Không mất thời gian học thuộc bài, không tốn tiền đi xem bên ngoài',
                    color: 'text-yellow-400',
                  },
                  {
                    icon: '✨',
                    label: 'Đa năng:',
                    text: 'Dễ dàng xem cho bản thân và bạn bè mọi lúc mọi nơi',
                    color: 'text-yellow-400',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] hover:border-yellow-400/20 transition-all duration-300"
                  >
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <p className="text-purple-100/80 text-sm leading-relaxed">
                      <span className={`font-semibold ${item.color}`}>{item.label}</span>{' '}
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
              <button onClick={() => setPage('shop')} className="btn-3d-yellow mt-8">
                💖 Tìm Hiểu Thêm
              </button>
            </div>
          </div>
        </div>

        {/* Bottom cosmic fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050510]/60 to-transparent pointer-events-none" />
      </section>
    </div>
  );
}
