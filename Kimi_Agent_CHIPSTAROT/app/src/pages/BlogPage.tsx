export default function BlogPage() {
  const posts = [
    { id: 1, title: 'The Fool – Lá Bài Của Sự Khởi Đầu Mới', summary: 'Khám phá ý nghĩa sâu xa của The Fool - lá bài số 0 trong bộ Major Arcana, biểu tượng của sự tự do và hành trình mới.', image: '/hero-main.jpg', date: '20/04/2024', author: 'Mystic House', url: 'https://mystichouse.vn' },
    { id: 2, title: 'Cung Hoàng Đạo và Tarot: Kết Nối Bí Ẩn', summary: 'Mỗi cung hoàng đạo đều có liên kết với một lá bài Tarot đặc biệt. Hãy khám phá mối quan hệ huyền bí này.', image: '/hero-main.jpg', date: '18/04/2024', author: 'Mystic House', url: 'https://mystichouse.vn' },
    { id: 3, title: 'Major Arcana: 22 Bí Ẩn Lớn Của Vũ Trụ', summary: 'Tổng quan về 22 lá bài Major Arcana và ý nghĩa biểu tượng của chúng trong hành trình tâm linh.', image: '/hero-main.jpg', date: '15/04/2024', author: 'Mystic House', url: 'https://mystichouse.vn' },
    { id: 4, title: 'Cách Đọc Tarot 3 Lá Cho Người Mới', summary: 'Hướng dẫn chi tiết cách trải bài Tarot 3 lá đơn giản nhất cho người mới bắt đầu học Tarot.', image: '/hero-main.jpg', date: '12/04/2024', author: 'Mystic House', url: 'https://mystichouse.vn' },
    { id: 5, title: 'Đá Thạch Anh và Tarot: Bộ Đôi Hoàn Hảo', summary: 'Khám phá cách kết hợp đá thạch anh với bộ bài Tarot để tăng cường năng lượng và trực giác.', image: '/hero-main.jpg', date: '10/04/2024', author: 'Mystic House', url: 'https://mystichouse.vn' },
    { id: 6, title: 'The Tower: Khi Mọi Thứ Sụp Đổ Để Tái Sinh', summary: 'The Tower không phải điềm xấu - đây là bài học về sự thay đổi đột ngột và cơ hội tái sinh.', image: '/hero-main.jpg', date: '08/04/2024', author: 'Mystic House', url: 'https://mystichouse.vn' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">📚 Blog Tarot & Phong Thủy</h1>
          <p className="text-gray-600">Khám phá kiến thức Tarot, phong thủy và tâm linh</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <a key={post.id} href={post.url} target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-2xl overflow-hidden blog-card-3d group">
              <div className="aspect-video overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <span>📅 {post.date}</span>
                  <span>•</span>
                  <span>✍️ {post.author}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">{post.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-3">{post.summary}</p>
                <div className="mt-4 flex items-center text-yellow-600 text-sm font-medium">Đọc thêm →</div>
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-10">
          <a href="https://mystichouse.vn/blog/" target="_blank" rel="noopener noreferrer" className="btn-3d-yellow">📖 Xem thêm bài viết</a>
        </div>
      </div>
    </div>
  );
}
