import { useNavigate } from 'react-router-dom';

const TEAM = [
  { name: 'Nguyễn Lan Anh', role: 'CEO & Co-founder', icon: '👩‍💼', desc: 'Chuyên gia Tarot 7 năm kinh nghiệm, đam mê kết hợp tâm linh và công nghệ.' },
  { name: 'Trần Minh Đức', role: 'CTO & Co-founder', icon: '👨‍💻', desc: 'Software engineer chuyên về IoT & NFC, từng làm tại các công ty Tech hàng đầu.' },
  { name: 'Phạm Thị Hoa', role: 'Head of Design', icon: '🎨', desc: 'UI/UX designer với tầm nhìn kết hợp phong thủy vào thiết kế hiện đại.' },
];

const VALUES = [
  { icon: '🔮', title: 'Huyền bí & Hiện đại', desc: 'Chúng tôi kết hợp văn hóa tâm linh Á Đông với công nghệ NFC tiên tiến, tạo ra trải nghiệm Phygital độc nhất vô nhị.' },
  { icon: '💛', title: 'Tận tâm với cộng đồng', desc: 'Mỗi thông điệp Tarot được thiết kế để thực sự có ý nghĩa, chứ không chỉ là câu chữ ngẫu nhiên.' },
  { icon: '🌱', title: 'Phát triển bền vững', desc: 'Sản phẩm của chúng tôi được làm từ đá tự nhiên và vật liệu thân thiện với môi trường.' },
  { icon: '⚡', title: 'Công nghệ dẫn đầu', desc: 'Chip NFC thế hệ mới nhất đảm bảo độ nhạy và tốc độ kết nối vượt trội, tương thích 100% với iOS & Android.' },
];

const STATS = [
  { value: '10K+', label: 'Người dùng tin tưởng', icon: '👥' },
  { value: '78', label: 'Lá bài Tarot', icon: '🃏' },
  { value: '99%', label: 'Đánh giá tích cực', icon: '⭐' },
  { value: '2023', label: 'Năm thành lập', icon: '🚀' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-yellow-400 animate-pulse"
              style={{
                width: `${((i * 3 + 1) % 4) + 1}px`,
                height: `${((i * 3 + 1) % 4) + 1}px`,
                left: `${(i * 7.3) % 100}%`,
                top: `${(i * 13.7) % 100}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span className="animate-pulse">✦</span> Phygital Tarot Platform <span className="animate-pulse">✦</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Về{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              CHIPSTAROT
            </span>
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto leading-relaxed">
            Sứ mệnh của chúng tôi là kết nối thế giới tâm linh truyền thống với công nghệ NFC hiện đại, 
            mang vũ trụ vào lòng bàn tay bạn mỗi ngày.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 -mt-8 relative z-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-xl p-6 text-center border border-white/40 hover:-translate-y-1 transition-transform">
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="text-3xl font-black text-purple-700">{s.value}</p>
              <p className="text-gray-500 text-xs mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-5">Câu chuyện của chúng tôi 🌟</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                CHIPSTAROT ra đời vào năm 2023 từ một ý tưởng táo bạo: <strong className="text-purple-700">tại sao không tích hợp chip NFC vào đá phong thủy?</strong> 
                Khi đó, người dùng chỉ cần chạm điện thoại vào món trang sức yêu thích là lập tức được kết nối với vũ trụ Tarot.
              </p>
              <p>
                Nhóm sáng lập gồm ba người — một chuyên gia Tarot, một kỹ sư NFC và một nhà thiết kế — 
                đã cùng nhau xây dựng hệ sinh thái <strong className="text-yellow-600">Phygital</strong> đầu tiên tại Việt Nam trong lĩnh vực tâm linh.
              </p>
              <p>
                Chỉ sau 1 năm ra mắt, hơn <strong>10,000 người dùng</strong> đã tin tưởng CHIPSTAROT để đồng hành cùng hành trình tâm linh của mình.
              </p>
            </div>
            <button onClick={() => navigate('/reading')} className="btn-3d-yellow mt-8">
              ✨ Trải nghiệm ngay
            </button>
          </div>
          <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-bold text-yellow-400">Liên hệ hỗ trợ</h3>
              {[
                { icon: '📧', text: 'cskh@chipstarot.vn' },
                { icon: '📞', text: '0867 774 023' },
                { icon: '📍', text: 'Khu Công Nghệ Cao, Quận 9, TP.HCM' },
                { icon: '🕘', text: 'T2 - T6: 09:00 - 18:00' },
              ].map(c => (
                <div key={c.text} className="flex items-center gap-3 text-purple-100">
                  <span className="text-xl w-8">{c.icon}</span>
                  <span className="text-sm">{c.text}</span>
                </div>
              ))}
              <div className="flex gap-3 mt-4">
                {['Facebook', 'TikTok', 'Instagram'].map(s => (
                  <button key={s} className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors border border-white/10">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-950 to-indigo-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Giá trị cốt lõi</h2>
            <p className="text-purple-300">Những nguyên tắc dẫn dắt mọi quyết định của chúng tôi</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-purple-300 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Đội ngũ sáng lập</h2>
            <p className="text-gray-500">Những con người đứng sau CHIPSTAROT</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map(m => (
              <div key={m.name} className="bg-white rounded-3xl shadow-xl p-8 text-center hover:-translate-y-2 transition-transform border border-white/40">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
                  {m.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{m.name}</h3>
                <p className="text-purple-600 font-medium text-sm mb-3">{m.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-yellow-400 to-amber-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Bắt đầu hành trình tâm linh của bạn</h2>
          <p className="text-yellow-900/80 mb-8 text-lg">Khám phá bí ẩn vũ trụ qua 78 lá bài Tarot — miễn phí 3 lượt đầu tiên!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/reading')} className="px-10 py-4 bg-white text-yellow-600 font-black text-lg rounded-full shadow-xl hover:-translate-y-1 transition-all">
              ✨ Bốc Bài Ngay
            </button>
            <button onClick={() => navigate('/shop')} className="px-10 py-4 bg-yellow-900/20 text-white font-bold text-lg rounded-full border-2 border-white/50 hover:bg-yellow-900/30 transition-all">
              🛍️ Xem Shop
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
