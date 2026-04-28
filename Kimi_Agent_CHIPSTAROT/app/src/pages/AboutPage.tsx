export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-black text-purple-900 mb-4">🔮 Về CHIPSTAROT</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Sứ mệnh của chúng tôi là kết nối thế giới tâm linh truyền thống với công nghệ hiện đại thông qua mô hình Phygital độc đáo.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-white/40">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Câu chuyện của chúng tôi</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              CHIPSTAROT ra đời từ niềm đam mê mãnh liệt với nghệ thuật Tarot và khát khao mang đến trải nghiệm tiện lợi, an toàn cho cộng đồng yêu thích bộ môn này.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Bằng cách tích hợp công nghệ NFC vào các vật phẩm phong thủy (như móc khóa, đá quý), người dùng không chỉ sở hữu một món phụ kiện đẹp mắt mà còn là chiếc chìa khóa vạn năng mở ra vũ trụ thông điệp mỗi ngày.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl" />
            <h2 className="text-2xl font-bold mb-6 relative z-10 text-yellow-400">Liên hệ hỗ trợ</h2>
            <div className="space-y-4 relative z-10 text-purple-100">
              <p className="flex items-center gap-3">
                <span className="text-xl">📧</span> cskh@chipstarot.vn
              </p>
              <p className="flex items-center gap-3">
                <span className="text-xl">📞</span> 0867 774 023
              </p>
              <p className="flex items-center gap-3">
                <span className="text-xl">📍</span> Khu Công Nghệ Cao, Quận 9, TP.HCM
              </p>
            </div>
            <div className="mt-8 relative z-10 bg-black/20 p-4 rounded-2xl border border-white/10">
              <p className="font-bold mb-1 text-yellow-400">Giờ làm việc:</p>
              <p className="text-sm text-purple-200">Thứ 2 - Thứ 6: 09:00 - 18:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
