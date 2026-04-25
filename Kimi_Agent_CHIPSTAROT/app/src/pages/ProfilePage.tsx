import { useState } from 'react';

export default function ProfilePage({ user, setPage }: any) {
  const [activeTab, setActiveTab] = useState<'history' | 'orders' | 'nfc'>('history');

  const mockHistory = [
    { id: 1, date: '25/04/2024', topic: 'Tình Yêu', cards: ['The Lovers'], note: 'Đang mập mờ' },
    { id: 2, date: '20/04/2024', topic: 'Sự Nghiệp', cards: ['The Emperor', 'The Chariot', 'The Sun'], note: 'Đang bế tắc' },
  ];

  const mockOrders = [
    { id: '#001', date: '25/04/2024', total: '199,000đ', status: 'Đang giao' },
  ];

  const mockNFC = [
    { id: 'NFC-123', product: 'Móc khóa NFC CHIPSTAROT', activatedAt: '25/04/2024', creditsAdded: 10 }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-yellow-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Đăng nhập để xem lịch sử trải bài và quản lý đơn hàng của bạn.</p>
          <button onClick={() => setPage('home')} className="btn-3d-yellow w-full">Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-8 text-white flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">👤</div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
              <p className="text-purple-200">{user.email}</p>
              <div className="mt-3 inline-block px-4 py-1 bg-yellow-400 text-purple-900 rounded-full text-xs font-bold uppercase tracking-wider">Thành viên CHIPSTAROT</div>
            </div>
          </div>
          <div className="flex border-b bg-white">
            {['history', 'orders', 'nfc'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 font-semibold text-center transition-all ${activeTab === tab ? 'text-purple-700 border-b-2 border-purple-700 bg-purple-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                {tab === 'history' ? '🔮 Lịch sử Tarot' : tab === 'orders' ? '📦 Đơn hàng' : '📱 Thẻ NFC'}
              </button>
            ))}
          </div>
          <div className="p-6 bg-white min-h-[400px]">
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Lịch sử trải bài của bạn</h2>
                {mockHistory.map(h => (
                  <div key={h.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-purple-700">{h.topic}</span>
                      <span className="text-sm text-gray-400">{h.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Tình trạng: {h.note}</p>
                    <div className="flex gap-2 flex-wrap">
                      {h.cards.map(c => <span key={c} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">{c}</span>)}
                    </div>
                  </div>
                ))}
                <button onClick={() => setPage('reading')} className="w-full py-4 mt-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl hover:bg-purple-50 font-bold transition-all">+ Bốc bài mới</button>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Đơn hàng đã đặt</h2>
                {mockOrders.map(o => (
                  <div key={o.id} className="border border-gray-100 rounded-2xl p-5 flex justify-between items-center hover:shadow-md transition-all">
                    <div>
                      <p className="font-bold text-gray-800">{o.id}</p>
                      <p className="text-sm text-gray-500 mt-1">{o.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-500 text-lg">{o.total}</p>
                      <p className="text-sm text-yellow-600 font-bold mt-1 bg-yellow-50 inline-block px-2 py-0.5 rounded-full">{o.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'nfc' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Thiết bị NFC đã kích hoạt</h2>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6">
                  <h3 className="font-bold text-yellow-800 mb-2">Cách nhận thêm lượt bốc bài?</h3>
                  <p className="text-yellow-700 text-sm mb-4">Mua móc khóa phong thủy NFC tại Shop, chạm vào điện thoại để tự động thêm 10 lượt bốc bài miễn phí!</p>
                  <button onClick={() => setPage('shop')} className="btn-3d-yellow text-sm px-6 py-2">Đến Shop ngay</button>
                </div>
                {mockNFC.map(n => (
                  <div key={n.id} className="border border-gray-100 rounded-2xl p-5 flex justify-between items-center hover:shadow-md transition-all">
                    <div>
                      <p className="font-bold text-gray-800">{n.product}</p>
                      <p className="text-sm text-gray-500 mt-1 font-mono">Mã UID: {n.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500 text-lg">+{n.creditsAdded} lượt</p>
                      <p className="text-xs text-gray-400 mt-1">Kích hoạt: {n.activatedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
