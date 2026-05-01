import { useState } from 'react';

const CATEGORIES = ['Tất cả', 'Ý nghĩa lá bài', 'Phong thủy', 'Hướng dẫn', 'Cung hoàng đạo'];

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

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');

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

        {/* Featured Post */}
        {featured && (
          <a
            href={featured.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-10 group"
          >
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
          </a>
        )}

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(post => (
            <a key={post.id} href={post.url} target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-2xl overflow-hidden blog-card-3d group hover:-translate-y-1 transition-all duration-300 border border-white/40">
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
            </a>
          ))}
        </div>

        {/* Load more */}
        <div className="text-center mt-12">
          <a
            href="https://mystichouse.vn/blog/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-3d-yellow"
          >
            📖 Xem tất cả bài viết
          </a>
        </div>
      </div>
    </div>
  );
}
