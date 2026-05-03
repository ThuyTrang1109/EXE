import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/constants';

interface ProductDetailPageProps {
  addToCart: (p: any) => void;
}

export default function ProductDetailPage({ addToCart }: ProductDetailPageProps) {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const id = parseInt(productId || '0');
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  
  const [activeTab, setActiveTab] = useState<'desc' | 'nfc' | 'reviews'>('desc');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/')} className="hover:text-yellow-600 transition-colors">Trang chủ</button>
          <span>/</span>
          <button onClick={() => navigate('/shop')} className="hover:text-yellow-600 transition-colors">Shop</button>
          <span>/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Product Image */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 shadow-xl product-card-3d">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-auto rounded-2xl object-cover aspect-square"
                onError={e => (e.currentTarget.src = '/hero-main.jpg')}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-white rounded-xl overflow-hidden cursor-pointer hover:border-2 border-yellow-500 transition-all opacity-60 hover:opacity-100">
                   <img src={product.image} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.src = '/hero-main.jpg')} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="mb-6">
                {product.tag && (
                  <span className={`${product.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block`}>
                    {product.tag}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">{'⭐'.repeat(Math.round(product.rating))}</div>
                  <span className="text-gray-500 text-sm">({product.reviews} đánh giá) | Đã bán 500+</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-red-500">{product.price.toLocaleString()}đ</span>
                  <span className="text-gray-400 line-through text-lg">{product.oldPrice.toLocaleString()}đ</span>
                  <span className="bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-lg text-sm">
                    -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                  <span className="text-2xl">✨</span>
                  <p className="text-sm text-yellow-800">
                    <strong>Ưu đãi:</strong> Tặng ngay 3 lượt bốc bài/ngày trong suốt 6 tháng khi sử dụng NFC trên sản phẩm này!
                  </p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <span className="text-2xl">🚚</span>
                  <p className="text-sm text-purple-800">
                    <strong>Vận chuyển:</strong> Miễn phí giao hàng cho đơn từ 250k. Giao nhanh 2h tại TP.HCM.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => addToCart(product)}
                  className="btn-3d-yellow w-full py-4 text-lg"
                >
                  🛒 Thêm vào giỏ hàng
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <a href="https://shopee.vn" target="_blank" className="flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-2xl font-medium hover:bg-orange-600 transition-all">
                    <span>Shopee</span>
                  </a>
                  <a href="https://tiktok.com" target="_blank" className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl font-medium hover:bg-gray-800 transition-all">
                    <span>TikTok Shop</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Tabs for detailed info */}
            <div className="mt-8">
              <div className="flex border-b border-gray-200 mb-6">
                <button 
                  onClick={() => setActiveTab('desc')}
                  className={`px-6 py-3 font-bold transition-all border-b-2 ${activeTab === 'desc' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  Mô tả sản phẩm
                </button>
                <button 
                  onClick={() => setActiveTab('nfc')}
                  className={`px-6 py-3 font-bold transition-all border-b-2 ${activeTab === 'nfc' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  Cách dùng NFC
                </button>
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-3 font-bold transition-all border-b-2 ${activeTab === 'reviews' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  Đánh giá
                </button>
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8">
                {activeTab === 'desc' && (
                  <div className="prose prose-yellow max-w-none text-gray-600">
                    <p className="mb-4">{product.desc}</p>
                    <p>Sản phẩm móc khóa phong thủy CHIPSTAROT không chỉ là món phụ kiện thời trang tinh tế mà còn là một "trạm kết nối" với vũ trụ. Được làm từ chất liệu cao cấp, bền bỉ và mang đậm phong cách tâm linh, hiện đại.</p>
                    <ul className="list-disc pl-5 mt-4 space-y-2">
                      <li>Chất liệu: Acrylic cao cấp / Đá tự nhiên 100%</li>
                      <li>Kích thước: 4cm x 4cm (vừa vặn cho chìa khóa, túi xách)</li>
                      <li>Tích hợp: Chip NFC thế hệ mới nhất, độ nhạy cao</li>
                      <li>Công dụng: Phụ kiện thời trang, mở khóa tính năng xem Tarot online</li>
                    </ul>
                  </div>
                )}
                {activeTab === 'nfc' && (
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                      <p className="text-gray-600">Bật tính năng NFC trên điện thoại (iPhone tự động bật, Android bật trong cài đặt nhanh).</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                      <p className="text-gray-600">Chạm nhẹ móc khóa vào vùng cảm biến NFC của điện thoại (thường là ở mặt lưng, gần camera).</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                      <p className="text-gray-600">Một thông báo sẽ hiện ra, nhấn vào đó để mở ứng dụng CHIPSTAROT và nhận lượt bốc bài miễn phí!</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm italic">
                      Lưu ý: Tính năng NFC hoạt động tốt nhất trên iPhone 7 trở lên và hầu hết các dòng Android tầm trung/cao cấp hiện nay.
                    </div>
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {[1, 2].map(i => (
                      <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-gray-800">Nguyễn Lan Anh</span>
                          <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-2">Móc khóa siêu xinh luôn, chạm vào là hiện ra app bốc bài liền. Shop đóng gói cẩn thận, đá thạch anh tím rất đẹp.</p>
                        <span className="text-xs text-gray-400">20/04/2024 | Phân loại: Thạch Anh Tím</span>
                      </div>
                    ))}
                    <button className="text-yellow-600 font-bold hover:underline">Xem tất cả 128 đánh giá →</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
