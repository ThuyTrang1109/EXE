import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function ProfilePage({ user, setPage, onScanClick }: any) {
  const { credits, expiryLabel, creditsExpiresAt } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'orders' | 'nfc'>('history');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
// ... existing mock data ...

  const mockHistory = [
    { 
      id: 1, 
      date: '25/04/2024', 
      time: '21:30',
      topic: 'Tình Yêu', 
      topicIcon: '💖',
      status: 'single',
      statusText: 'Đang mập mờ',
      cards: [
        { name: 'The Lovers', image: '/tarot-cards/06-the-lovers.jpg', meaning: 'Sự hòa hợp, lựa chọn từ trái tim.' }
      ], 
      note: 'Mình cảm thấy người ấy cũng đang có ý với mình, nhưng cả hai đều chưa dám ngỏ lời.' 
    },
    { 
      id: 2, 
      date: '20/04/2024', 
      time: '10:15',
      topic: 'Sự Nghiệp', 
      topicIcon: '💼',
      status: 'stuck',
      statusText: 'Đang bế tắc',
      cards: [
        { name: 'The Emperor', image: '/tarot-cards/04-the-emperor.jpg', meaning: 'Cần sự kỷ luật và cấu trúc.' },
        { name: 'The Chariot', image: '/tarot-cards/07-the-chariot.jpg', meaning: 'Chiến thắng thông qua sự quyết tâm.' },
        { name: 'The Sun', image: '/tarot-cards/19-the-sun.jpg', meaning: 'Thành công và sự rõ ràng sắp tới.' }
      ], 
      note: 'Dự án đang gặp khó khăn nhưng thông điệp khuyên mình nên kiên trì và giữ kỷ luật.' 
    },
  ];

  const mockOrders = [
    { 
      id: '#ORD-9921', 
      date: '25/04/2024', 
      total: 288000, 
      status: 'shipping', 
      statusText: 'Đang giao hàng',
      items: [
        { name: 'Móc khóa NFC CHIPSTAROT', qty: 1, image: '/products/nfc-chick.jpg' },
        { name: 'Móc khóa Đá Thạch Anh Tím', qty: 1, image: '/products/amethyst.jpg' }
      ],
      progress: 65
    },
    { 
      id: '#ORD-8852', 
      date: '15/04/2024', 
      total: 79000, 
      status: 'delivered', 
      statusText: 'Đã hoàn thành',
      items: [
        { name: 'Móc khóa Đá Mắt Hổ', qty: 1, image: '/products/tiger-eye.jpg' }
      ],
      progress: 100
    }
  ];

  const mockNFC = [
    { id: 'CHIP-TR-001', product: 'Móc khóa NFC CHIPSTAROT', activatedAt: '25/04/2024', creditsAdded: 10, icon: '🐣' },
    { id: 'CHIP-AM-042', product: 'Móc khóa Đá Thạch Anh Tím', activatedAt: '20/04/2024', creditsAdded: 10, icon: '💎' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-yellow-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center max-w-md w-full shadow-2xl">
          <div className="text-6xl mb-4 animate-bounce">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Đăng nhập để xem nhật ký trải bài và quản lý đơn hàng của bạn.</p>
          <button onClick={() => setPage('auth')} className="btn-3d-yellow w-full">Đăng nhập ngay</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border border-white/20">
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 p-8 text-white flex flex-col md:flex-row items-start gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-5xl border-4 border-white/30 shadow-lg flex-shrink-0 mt-2">👤</div>
            <div className="text-center md:text-left z-10 w-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start w-full gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                  <p className="text-purple-200 mb-3">{user.email}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="px-3 py-1 bg-yellow-400 text-purple-900 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">Thành viên CHIPSTAROT</span>
                    <span className="px-3 py-1 bg-purple-500/30 text-white rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20">Hạng Đồng</span>
                  </div>
                </div>
                
                {/* Credits Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[200px] text-center md:text-right flex flex-col md:items-end items-center">
                  <p className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">Số dư lượt bốc bài</p>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-black text-yellow-400 leading-none">{credits}</span>
                    <span className="text-yellow-400/80 text-sm font-medium pb-1">lượt</span>
                  </div>
                  {credits > 0 ? (
                    <div className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                      expiryLabel.urgency === 'expired' ? 'bg-red-500/80 text-white' :
                      expiryLabel.urgency === 'warning' ? 'bg-amber-500/80 text-white' :
                      'bg-green-500/80 text-white'
                    }`}>
                      {creditsExpiresAt ? `Hạn dùng: ${new Date(creditsExpiresAt).toLocaleDateString('vi-VN')}` : 'Vô thời hạn (NFC)'}
                    </div>
                  ) : (
                    <button onClick={() => setPage('shop')} className="text-xs font-bold text-yellow-400 hover:text-yellow-300 underline mt-1">
                      Nạp thêm lượt ngay →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-b bg-white/50 backdrop-blur-sm sticky top-0 z-20">
            {['history', 'orders', 'nfc'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 font-bold text-sm text-center transition-all relative ${activeTab === tab ? 'text-purple-700 bg-purple-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'}`}>
                {tab === 'history' ? '🔮 Nhật ký Tarot' : tab === 'orders' ? '📦 Đơn hàng' : '📱 Thẻ NFC'}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-full mx-4" />}
              </button>
            ))}
          </div>
          <div className="p-6 bg-white min-h-[500px]">
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Nhật ký trải bài</h2>
                  <div className="flex gap-2">
                    <button className="p-2 bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
                    <button className="p-2 bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg></button>
                  </div>
                </div>

                {mockHistory.map(h => (
                  <div key={h.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="bg-gray-50/50 p-4 border-b border-gray-50 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{h.topicIcon}</span>
                        <div>
                          <p className="font-bold text-gray-800">{h.topic}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{h.date} • {h.time}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-wider">{h.statusText}</span>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-6">
                        {h.cards.map((c, idx) => (
                          <div key={idx} className="space-y-2 group/card text-center">
                            <div className="aspect-[2/3] bg-purple-50 rounded-xl overflow-hidden border border-purple-100 shadow-sm transition-transform group-hover/card:scale-105 group-hover/card:rotate-2">
                              <img src={c.image} alt={c.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.src = '/tarot-cards/00-the-fool.jpg')} />
                            </div>
                            <p className="text-[10px] font-bold text-gray-700 truncate px-1">{c.name}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-yellow-50/50 rounded-2xl p-4 border border-yellow-100/50">
                        <p className="text-xs font-bold text-yellow-800 mb-2 flex items-center gap-2">✍️ Ghi chú của bạn:</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{h.note}</p>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <button className="text-purple-600 text-xs font-bold hover:underline">Chi tiết trải bài →</button>
                        <button className="text-gray-400 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setPage('reading')} className="w-full py-6 mt-4 border-2 border-dashed border-purple-200 text-purple-400 rounded-3xl hover:bg-purple-50 hover:border-purple-400 hover:text-purple-600 font-bold transition-all flex flex-col items-center gap-2">
                  <span className="text-3xl">🔮</span>
                  <span>Tiếp tục hành trình bốc bài</span>
                </button>
              </div>
            )}

            
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của bạn</h2>
                {mockOrders.map(o => (
                  <div key={o.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-lg font-bold text-gray-800">{o.id}</p>
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">{o.date}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${o.status === 'shipping' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {o.statusText}
                        </span>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.src = '/hero-main.jpg')} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-800">{item.name}</p>
                              <p className="text-xs text-gray-400">Số lượng: {item.qty}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-50 pt-6">
                        <div className="flex justify-between items-center mb-2 text-sm">
                          <span className="text-gray-500 font-medium">Tiến độ giao hàng</span>
                          <span className="text-purple-600 font-bold">{o.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${o.progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50/50 p-4 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Tổng thanh toán</span>
                        <span className="text-xl font-bold text-red-500">{o.total.toLocaleString()}đ</span>
                      </div>
                      <button onClick={() => setSelectedOrder(o)} className="px-6 py-2 bg-white text-gray-600 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-100 transition-all shadow-sm">Xem chi tiết</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'nfc' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl mb-8">
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Kích hoạt Thẻ NFC mới</h3>
                    <p className="text-white/80 text-sm mb-6 max-w-md">Chạm móc khóa CHIPSTAROT của bạn vào điện thoại để nhận thêm 10 lượt bốc bài và mở khóa ưu đãi thành viên.</p>
                    <button onClick={onScanClick} className="bg-white text-orange-600 px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                      <span className="text-xl">📱</span> Chạm để quét ngay
                    </button>
                  </div>
                  <div className="absolute top-8 right-8 text-6xl opacity-30 animate-pulse">📡</div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">Thiết bị đã kết nối ({mockNFC.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockNFC.map(n => (
                    <div key={n.id} className="bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-xl transition-all duration-300 flex items-center gap-4">
                      <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">{n.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">{n.product}</p>
                        <p className="text-[10px] text-gray-400 font-mono tracking-tighter mt-0.5">{n.id}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">+{n.creditsAdded} lượt</span>
                          <span className="text-[10px] text-gray-300">{n.activatedAt}</span>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-purple-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
                    </div>
                  ))}
                </div>
                
                <button onClick={() => setPage('shop')} className="w-full py-4 mt-4 bg-purple-50 text-purple-600 rounded-2xl font-bold hover:bg-purple-100 transition-all border border-purple-100">🛒 Mua thêm thiết bị mới</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Chi tiết đơn hàng</h3>
                <p className="text-sm text-purple-200">{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/40 transition-colors">&times;</button>
            </div>
            <div className="p-6">
              <div className="mb-6 bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                <p className="text-xs text-gray-500 font-medium mb-1">Trạng thái hiện tại</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-yellow-700">{selectedOrder.statusText}</p>
                  <p className="text-xs text-gray-400">{selectedOrder.date}</p>
                </div>
              </div>
              
              <h4 className="font-bold text-gray-800 mb-3">Sản phẩm đã đặt</h4>
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">SL: {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Tổng thanh toán</span>
                <span className="text-2xl font-black text-red-500">{selectedOrder.total.toLocaleString()}đ</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">Theo dõi vận chuyển</button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold hover:bg-gray-100 transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
