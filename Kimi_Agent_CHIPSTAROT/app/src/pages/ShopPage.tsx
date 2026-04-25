import { PRODUCTS } from '../data/constants';

export default function ShopPage({ addToCart }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🛍️ Shop Phong Thủy CHIPSTAROT</h1>
          <p className="text-gray-600">Móc khóa đá phong thủy tích hợp NFC - Chạm để xem Tarot</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="https://shopee.vn/geehandmade" target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors">🛒 Shopee</a>
            <a href="https://tiktok.com/@geehandmade" target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">📱 TikTok Shop</a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map(p => (
            <div key={p.id} className="bg-white rounded-2xl overflow-hidden product-card-3d">
              <div className="relative aspect-square bg-gradient-to-br from-yellow-50 to-purple-50">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.src = '/hero-main.jpg')} />
                {p.tag && <span className={`absolute top-3 left-3 ${p.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>{p.tag}</span>}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{p.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{p.desc}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-red-500">{p.price.toLocaleString()}đ</span>
                  <span className="text-gray-400 line-through text-sm">{p.oldPrice.toLocaleString()}đ</span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    -{Math.round((1 - p.price / p.oldPrice) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-yellow-400">{'⭐'.repeat(Math.round(p.rating))}</span>
                  <span className="text-gray-500 text-sm">({p.reviews})</span>
                </div>
                <button onClick={() => addToCart(p)} className="btn-3d-yellow w-full">🛒 Thêm vào giỏ</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
