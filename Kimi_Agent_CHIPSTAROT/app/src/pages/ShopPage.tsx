import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Smartphone, Settings, Gem, Sparkles, Phone, Gift, Zap } from 'lucide-react';
import { PRODUCTS, CREDIT_PACKAGES } from '../data/constants';
import { useAuth } from '@/lib/AuthContext';
import { usePermission } from '../hooks/usePermission';

export default function ShopPage({ addToCart, viewProduct }: any) {
  const navigate = useNavigate();
  const { user, buyPackage, creditsExpiresAt, expiryLabel } = useAuth();
  const { can } = usePermission();
  const [activeTab, setActiveTab] = useState<'products' | 'credits'>('products');
  const [buyingPkg, setBuyingPkg] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(PRODUCTS.length / ITEMS_PER_PAGE);
  const currentProducts = PRODUCTS.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleBuyCredits = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    if (!user) { navigate('/auth'); return; }
    setBuyingPkg(pkg.id);
    const { success, message } = await buyPackage(pkg.id);
    setBuyingPkg(null);
    setResultMsg({ id: pkg.id, msg: message, ok: success });
    setTimeout(() => setResultMsg(null), 4000);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <ShoppingBag className="w-10 h-10 text-yellow-400" /> Shop CHIPSTAROT
          </h1>
          <p className="text-purple-200 mb-4">Móc khóa phong thủy NFC & Gói lượt xem Tarot</p>
          <div className="flex justify-center gap-4">
            <a href="https://shopee.vn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"><ShoppingCart className="w-4 h-4" /> Shopee</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"><Smartphone className="w-4 h-4" /> TikTok Shop</a>
            {can('products.manage') && (
              <button onClick={() => navigate('/admin')} className="flex items-center gap-2 px-6 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold hover:bg-purple-200 transition-colors border border-purple-200">
                <Settings className="w-4 h-4" /> Quản lý Shop
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl p-1.5 max-w-md mx-auto mb-10">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'products' ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white shadow-md' : 'text-white/50 hover:text-white/80'}`}
          >
            <Gem className="w-4 h-4" /> Móc Khóa NFC
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'credits' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md' : 'text-white/50 hover:text-white/80'}`}
          >
            <Sparkles className="w-4 h-4" /> Gói Lượt Tarot
          </button>
        </div>

        {/* ── TAB 1: Sản phẩm vật lý ── */}
        {activeTab === 'products' && (
          <>
            {/* NFC Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-yellow-500 rounded-2xl p-5 mb-8 text-white flex items-center gap-4 shadow-lg">
              <div className="p-3 bg-white/20 rounded-full"><Phone className="w-8 h-8" /></div>
              <div>
                <p className="font-bold text-lg">Mỗi móc khóa tặng kèm 6 tháng xem Tarot miễn phí!</p>
                <p className="text-white/80 text-sm mt-1">Chạm điện thoại vào móc khóa NFC → Nhận ngay 3 lượt bốc bài/ngày trong 6 tháng liên tiếp</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentProducts.map(p => (
                <div key={p.id} className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden product-card-3d group hover:border-yellow-400/30 transition-all">
                  <div className="cursor-pointer" onClick={() => viewProduct(p.id)}>
                    <div className="relative aspect-square bg-gradient-to-br from-purple-900/40 to-indigo-900/40 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => (e.currentTarget.src = '/hero-main.jpg')} />
                      {p.tag && <span className={`absolute top-3 left-3 ${p.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>{p.tag}</span>}
                      <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-yellow-300 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Gift className="w-3 h-3" /> 6 tháng miễn phí
                      </span>
                    </div>
                    <div className="p-6 pb-2">
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-yellow-300 transition-colors">{p.name}</h3>
                      <p className="text-purple-200/60 text-sm mb-2 line-clamp-2">{p.desc}</p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-red-400">{p.price.toLocaleString()}đ</span>
                      <span className="text-white/30 line-through text-sm">{p.oldPrice.toLocaleString()}đ</span>
                      <span className="bg-red-500/20 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">
                        -{Math.round((1 - p.price / p.oldPrice) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-4">
                      <span className="text-yellow-400">{'⭐'.repeat(Math.round(p.rating))}</span>
                      <span className="text-white/40 text-sm">({p.reviews})</span>
                    </div>
                    <button onClick={() => addToCart(p)} className="btn-3d-yellow w-full">🛒 Thêm vào giỏ</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/70 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  Trang trước
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' : 'bg-white/10 border border-white/20 text-white/60 hover:bg-white/20 hover:border-yellow-400/40'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/70 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        )}

        {/* ── TAB 2: Gói mua lượt Tarot ── */}
        {activeTab === 'credits' && (
          <>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 mb-8 text-white flex items-center gap-4 shadow-lg">
              <div className="p-3 bg-white/20 rounded-full"><Zap className="w-8 h-8 text-yellow-300" /></div>
              <div>
                <p className="font-bold text-lg">Nạp lượt bốc bài ngay — không cần chờ giao hàng!</p>
                <p className="text-white/80 text-sm mt-1">Thanh toán xong, lượt cộng vào tài khoản tức thì</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CREDIT_PACKAGES.map(pkg => {
                const isResult = resultMsg?.id === pkg.id;
                const isBuying = buyingPkg === pkg.id;
                return (
                  <div key={pkg.id} className={`relative bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 duration-200 ${pkg.tag ? 'ring-2 ring-purple-400/50' : ''}`}>
                    {pkg.tag && (
                      <span className={`absolute top-4 right-4 ${pkg.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full z-10`}>
                        {pkg.tag}
                      </span>
                    )}
                    <div className={`bg-gradient-to-br ${pkg.color} p-8 text-center text-white`}>
                      <div className="text-5xl mb-3">{pkg.icon}</div>
                      <h3 className="text-xl font-bold">{pkg.name}</h3>
                      <p className="text-white/80 text-sm mt-1">{pkg.desc}</p>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="bg-purple-500/10 border border-purple-400/20 rounded-2xl p-4 text-center mb-3">
                        <p className="text-4xl font-black text-purple-300">{pkg.dailyCredits}</p>
                        <p className="text-purple-300/70 text-sm font-semibold">lượt bốc bài / ngày</p>
                      </div>

                      <div className="flex items-center justify-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2 mb-4">
                        <span className="text-amber-400 text-sm">⏳</span>
                        <span className="text-amber-300 text-sm font-bold">Hiệu lực {pkg.expiryLabel}</span>
                      </div>

                      <div className="flex items-baseline gap-2 justify-center mb-1">
                        <span className="text-3xl font-black text-red-400">{pkg.price.toLocaleString()}đ</span>
                        <span className="text-white/30 line-through text-sm">{pkg.oldPrice.toLocaleString()}đ</span>
                      </div>
                      <p className="text-center text-white/40 text-xs mb-5">≈ {pkg.perCredit.toLocaleString()}đ / lượt</p>

                      <button
                        onClick={() => handleBuyCredits(pkg)}
                        disabled={isBuying || isResult}
                        className={`w-full py-3 rounded-2xl font-bold text-sm transition-all mt-auto relative overflow-hidden ${
                          isResult
                            ? resultMsg?.ok
                              ? 'bg-green-500/20 text-green-300 cursor-default'
                              : 'bg-red-500/20 text-red-300 cursor-default'
                            : `bg-gradient-to-r ${pkg.color} text-white hover:opacity-90 active:scale-95 disabled:opacity-60`
                        }`}
                      >
                        {isBuying && <div className="absolute inset-0 skeleton-shimmer opacity-30" />}
                        {isResult ? resultMsg!.msg : isBuying ? '⏳ Đang xử lý...' : `✨ Mua ngay — ${pkg.price.toLocaleString()}đ`}
                      </button>

                      {!user && (
                        <p className="text-center text-xs text-white/40 mt-2">
                          Cần <button onClick={() => navigate('/auth')} className="text-purple-400 underline font-medium">đăng nhập</button> để mua gói
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* So sánh bảng + Banner thời hạn hiện tại của user */}
            {user && creditsExpiresAt && (
              <div className={`mt-8 rounded-2xl p-4 flex items-center gap-4 shadow ${
                expiryLabel.urgency === 'expired' ? 'bg-red-50 border border-red-200' :
                expiryLabel.urgency === 'warning' ? 'bg-amber-50 border border-amber-200' :
                'bg-green-50 border border-green-200'
              }`}>
                <div className="text-3xl">
                  {expiryLabel.urgency === 'expired' ? '⛔' : expiryLabel.urgency === 'warning' ? '⚠️' : '✅'}
                </div>
                <div>
                  <p className={`font-bold ${
                    expiryLabel.urgency === 'expired' ? 'text-red-700' :
                    expiryLabel.urgency === 'warning' ? 'text-amber-700' :
                    'text-green-700'
                  }`}>
                    Lượt bốc bài hiện tại: {expiryLabel.label}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Hết hạn: {new Date(creditsExpiresAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            <div className="mt-12 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-6 py-4">
                <h3 className="text-white font-bold text-lg">📊 So sánh các gói</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="text-left px-6 py-3 text-purple-200/60 font-semibold">Gói</th>
                      <th className="text-center px-4 py-3 text-purple-200/60 font-semibold">Lượt bốc bài</th>
                      <th className="text-center px-4 py-3 text-purple-200/60 font-semibold">Giá</th>
                      <th className="text-center px-4 py-3 text-purple-200/60 font-semibold">Giá / lượt</th>
                      <th className="text-center px-4 py-3 text-purple-200/60 font-semibold">Tiết kiệm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {CREDIT_PACKAGES.map(pkg => (
                      <tr key={pkg.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 font-semibold text-white">{pkg.icon} {pkg.name}</td>
                        <td className="px-4 py-4 text-center text-purple-300 font-bold">{pkg.dailyCredits} lượt/ngày</td>
                        <td className="px-4 py-4 text-center text-red-400 font-bold">{pkg.price.toLocaleString()}đ</td>
                        <td className="px-4 py-4 text-center text-white/60">{pkg.perCredit.toLocaleString()}đ</td>
                        <td className="px-4 py-4 text-center">
                          <span className="bg-green-500/20 text-green-300 font-bold px-2 py-0.5 rounded-full text-xs">
                            -{Math.round((1 - pkg.price / pkg.oldPrice) * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
