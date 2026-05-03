import { useState } from 'react';

const CATEGORIES = ['Tất cả', 'Ý nghĩa lá bài', 'Phong thủy', 'Hướng dẫn', 'Cung hoàng đạo'];

const FULL_CONTENT: Record<number, string> = {
  1: `**The Fool** (Kẻ Ngốc) là lá bài số 0 trong bộ Major Arcana — con số 0 biểu tượng cho vô hạn và sự khởi đầu thuần túy.

🌟 **Hình ảnh lá bài:** Một người trẻ đứng ở mép vực, nhìn lên bầu trời với nụ cười hồn nhiên. Trong tay cầm một bó hành lý nhỏ và một bông hoa trắng. Chú chó nhỏ đang sủa phía sau — có thể là cảnh báo, hoặc cũng chỉ là người bạn đồng hành.

💫 **Ý nghĩa xuôi:** Khởi đầu mới, sự tự do, tinh thần phiêu lưu, niềm tin vào bản thân và vũ trụ. Đây là thời điểm bước ra khỏi vùng an toàn và đón nhận những điều chưa từng biết.

🔄 **Ý nghĩa ngược:** Liều lĩnh thiếu suy nghĩ, bốc đồng, bỏ lỡ các dấu hiệu cảnh báo quan trọng.

✨ **Lời khuyên:** Nếu bạn đang do dự trước một bước nhảy vọt mới — hãy lắng nghe The Fool. Đôi khi, sự "ngốc nghếch" dũng cảm chính là sự khôn ngoan cao nhất.`,
  2: `**Tarot và Cung Hoàng Đạo** có mối liên hệ sâu sắc trong hệ thống huyền học phương Tây.

♈ **Bạch Dương** → The Emperor (Hoàng Đế) — Sự lãnh đạo và quyền lực.
♉ **Kim Ngưu** → The Hierophant (Giáo Hoàng) — Truyền thống và ổn định.
♊ **Song Tử** → The Lovers (Đôi Tình Nhân) — Duality và lựa chọn.
♋ **Cự Giải** → The Chariot (Cỗ Xe) — Ý chí và chiến thắng.
♌ **Sư Tử** → Strength (Sức Mạnh) — Lòng dũng cảm và kiên nhẫn.
♍ **Xử Nữ** → The Hermit (Ẩn Sĩ) — Sự nội tâm và trí tuệ.

💫 Bằng cách kết hợp cung hoàng đạo của bạn với lá bài Tarot tương ứng, bạn có thể hiểu sâu hơn về năng lượng bẩm sinh của mình và những thách thức trong cuộc sống.`,
  3: `**Major Arcana** — 22 Bí Ẩn Lớn là hành trình tâm linh của linh hồn con người, từ The Fool (số 0) đến The World (số 21).

🌍 **Hành trình của Kẻ Ngốc:**
- The Fool khởi hành → gặp The Magician (học về ý chí)
- Gặp The High Priestess (học trực giác) → The Empress (tình yêu, sự phong phú)
- Đối mặt với The Tower (sự sụp đổ) → The Star (hy vọng)
- Cuối cùng đạt đến The World (hoàn thành)

🔮 Mỗi lá bài là một bài học. Khi một lá Major Arcana xuất hiện trong trải bài của bạn, đó là tín hiệu của một bài học lớn trong cuộc đời — không chỉ là tình huống nhỏ hàng ngày.`,
  4: `**Trải bài 3 lá** là phương pháp phổ biến nhất cho người mới bắt đầu học Tarot.

📖 **Cách thực hiện:**
1. Xáo bài trong khi tập trung vào câu hỏi
2. Rút 3 lá từ trái sang phải
3. Lá 1 (Trái): Quá khứ / Nguyên nhân
4. Lá 2 (Giữa): Hiện tại / Tình huống hiện tại
5. Lá 3 (Phải): Tương lai / Kết quả tiềm năng

💡 **Mẹo cho người mới:**
- Đừng cố học thuộc 78 ý nghĩa ngay — hãy tin vào trực giác đầu tiên
- Ghi nhật ký mỗi lần đọc bài
- Để ý đến cảm xúc khi lá bài lật lên
- Màu sắc và biểu tượng trong hình ảnh cũng mang ý nghĩa

✨ Với CHIPSTAROT, bạn có thể thực hành mỗi ngày với chỉ 1 lượt bốc bài — đủ để xây dựng thói quen tâm linh lành mạnh.`,
  5: `**Đá thạch anh** và Tarot là bộ đôi được sử dụng rộng rãi trong cộng đồng tâm linh toàn cầu.

💎 **Các loại đá và lá bài tương ứng:**
- **Thạch Anh Tím (Amethyst)** → The High Priestess — Tăng trực giác, khai mở tâm linh
- **Đá Mắt Hổ (Tiger's Eye)** → The Chariot — Cho sức mạnh và sự tự tin
- **Thạch Anh Hồng (Rose Quartz)** → The Lovers — Thu hút tình yêu và sự hài hòa
- **Thạch Anh Trắng (Clear Quartz)** → The Magician — Khuếch đại năng lượng

🌿 **Cách dùng:** Đặt đá lên bộ bài Tarot qua đêm dưới ánh trăng để "nạp năng lượng". Cầm đá trong tay khi trải bài để tăng kết nối trực giác.`,
  6: `**The Tower** (Tháp) — lá bài số 16 trong Major Arcana, thường khiến người xem e sợ. Nhưng sự thật là...

⚡ **The Tower không phải điềm xấu.** Đây là lá bài của sự thay đổi đột ngột, sự phá vỡ những cấu trúc lỗi thời.

🏰 **Hình ảnh:** Một tòa tháp bị sét đánh, hai người rơi xuống. Ngọn lửa, hỗn loạn. Nhưng chú ý: bầu trời sau cơn bão luôn trong xanh hơn.

💫 **Thông điệp thật sự:**
- Những gì cần sụp đổ thì sẽ sụp đổ
- Nếu mối quan hệ/công việc/dự án đang lung lay, The Tower chỉ đang đẩy nhanh điều không thể tránh khỏi
- Sau mỗi sự sụp đổ là cơ hội xây dựng lại tốt hơn

🌟 **Lời khuyên:** Đừng chống lại The Tower. Hãy để những thứ không còn phục vụ bạn ra đi, và tin rằng điều tốt đẹp hơn đang chờ phía sau.`
};

const POSTS = [
  {
    id: 1,
    title: 'The Fool – Lá Bài Của Sự Khởi Đầu Mới',
    summary: 'Khám phá ý nghĩa sâu xa của The Fool - lá bài số 0 trong bộ Major Arcana, biểu tượng của sự tự do và hành trình mới.',
    category: 'Ý nghĩa lá bài',
    emoji: '🃏',
    gradient: 'from-yellow-400 to-amber-500',
    date: '20/04/2025',
    author: 'Lan Anh',
    readTime: '5 phút',
    url: 'https://mystichouse.vn',
    featured: true,
  },
  {
    id: 2,
    title: 'Cung Hoàng Đạo và Tarot: Kết Nối Bí Ẩn',
    summary: 'Mỗi cung hoàng đạo đều có liên kết với một lá bài Tarot đặc biệt. Hãy khám phá mối quan hệ huyền bí này.',
    category: 'Cung hoàng đạo',
    emoji: '♊',
    gradient: 'from-purple-500 to-indigo-600',
    date: '18/04/2025',
    author: 'Minh Đức',
    readTime: '8 phút',
    url: 'https://mystichouse.vn',
    featured: false,
  },
  {
    id: 3,
    title: 'Major Arcana: 22 Bí Ẩn Lớn Của Vũ Trụ',
    summary: 'Tổng quan về 22 lá bài Major Arcana và ý nghĩa biểu tượng của chúng trong hành trình tâm linh.',
    category: 'Ý nghĩa lá bài',
    emoji: '🌌',
    gradient: 'from-indigo-500 to-purple-700',
    date: '15/04/2025',
    author: 'Lan Anh',
    readTime: '12 phút',
    url: 'https://mystichouse.vn',
    featured: false,
  },
  {
    id: 4,
    title: 'Cách Đọc Tarot 3 Lá Cho Người Mới Bắt Đầu',
    summary: 'Hướng dẫn chi tiết cách trải bài Tarot 3 lá đơn giản nhất cho người mới bắt đầu học Tarot.',
    category: 'Hướng dẫn',
    emoji: '📖',
    gradient: 'from-green-400 to-teal-500',
    date: '12/04/2025',
    author: 'Thị Hoa',
    readTime: '6 phút',
    url: 'https://mystichouse.vn',
    featured: false,
  },
  {
    id: 5,
    title: 'Đá Thạch Anh và Tarot: Bộ Đôi Hoàn Hảo',
    summary: 'Khám phá cách kết hợp đá thạch anh với bộ bài Tarot để tăng cường năng lượng và trực giác.',
    category: 'Phong thủy',
    emoji: '💎',
    gradient: 'from-pink-400 to-rose-500',
    date: '10/04/2025',
    author: 'Thị Hoa',
    readTime: '7 phút',
    url: 'https://mystichouse.vn',
    featured: false,
  },
  {
    id: 6,
    title: 'The Tower: Khi Mọi Thứ Sụp Đổ Để Tái Sinh',
    summary: 'The Tower không phải điềm xấu - đây là bài học về sự thay đổi đột ngột và cơ hội tái sinh mạnh mẽ hơn.',
    category: 'Ý nghĩa lá bài',
    emoji: '⚡',
    gradient: 'from-orange-400 to-red-500',
    date: '08/04/2025',
    author: 'Lan Anh',
    readTime: '9 phút',
    url: 'https://mystichouse.vn',
    featured: false,
  },
];

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: bold }} />;
  });
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedPost, setSelectedPost] = useState<typeof POSTS[0] | null>(null);

  const filtered = POSTS.filter(p => activeCategory === 'Tất cả' || p.category === activeCategory);
  const featured = filtered.find(p => p.featured) || filtered[0];
  const rest = filtered.filter(p => p.id !== featured?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            ✨ Kiến thức Tarot & Tâm linh
          </div>
          <h1 className="text-4xl font-black text-gray-800 mb-3">📚 Blog CHIPSTAROT</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Khám phá kiến thức Tarot, phong thủy và tâm linh từ đội ngũ chuyên gia nhiều năm kinh nghiệm
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 py-8 overflow-y-auto" onClick={() => setSelectedPost(null)}>
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className={`h-48 bg-gradient-to-br ${selectedPost.gradient} flex items-center justify-center relative`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:20px_20px]" />
                <span className="text-7xl drop-shadow-lg">{selectedPost.emoji}</span>
                <button onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 w-9 h-9 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center font-bold transition-colors">✕</button>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-bold">{selectedPost.category}</span>
                  <span>📅 {selectedPost.date}</span>
                  <span>•</span>
                  <span>✍️ {selectedPost.author}</span>
                  <span>•</span>
                  <span>⏱ {selectedPost.readTime}</span>
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-4">{selectedPost.title}</h2>
                <div className="text-gray-600 text-sm space-y-1 border-t border-gray-100 pt-4">
                  {renderContent(FULL_CONTENT[selectedPost.id] || selectedPost.summary)}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-400">📖 CHIPSTAROT Blog</span>
                  <button onClick={() => setSelectedPost(null)}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors">Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Featured Post */}
        {featured && (
          <button onClick={() => setSelectedPost(featured)} className="w-full block mb-10 group text-left">
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/40">
              <div className={`h-56 bg-gradient-to-br ${featured.gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:20px_20px]" />
                <span className="text-8xl drop-shadow-lg">{featured.emoji}</span>
                <div className="absolute top-4 left-4">
                  <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ Bài nổi bật
                  </span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className="bg-black/30 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                    {featured.category}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span>📅 {featured.date}</span>
                  <span>•</span>
                  <span>✍️ {featured.author}</span>
                  <span>•</span>
                  <span>⏱ {featured.readTime}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">{featured.title}</h2>
                <p className="text-gray-500 leading-relaxed mb-4">{featured.summary}</p>
                <span className="inline-flex items-center gap-1 text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Đọc tiếp <span>→</span>
                </span>
              </div>
            </div>
          </button>
        )}

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(post => (
            <button key={post.id} onClick={() => setSelectedPost(post)} className="bg-white rounded-2xl overflow-hidden blog-card-3d group hover:-translate-y-1 transition-all duration-300 border border-white/40 text-left">
              <div className={`h-36 bg-gradient-to-br ${post.gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:16px_16px]" />
                <span className="text-5xl drop-shadow-md">{post.emoji}</span>
                <div className="absolute top-3 right-3">
                  <span className="bg-black/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
                  <span>📅 {post.date}</span>
                  <span>•</span>
                  <span>⏱ {post.readTime}</span>
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">{post.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{post.summary}</p>
                <div className="mt-4 flex items-center gap-1 text-purple-600 text-sm font-medium group-hover:gap-2 transition-all">
                  Đọc thêm <span>→</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm mb-4">Hàng tuần có bài mới — theo dõi để không bỏ lỡ!</p>
          <a href="https://facebook.com/chipstarot" target="_blank" rel="noopener noreferrer" className="btn-3d-yellow">
            📱 Theo dõi CHIPSTAROT
          </a>
        </div>
      </div>
    </div>
  );
}
