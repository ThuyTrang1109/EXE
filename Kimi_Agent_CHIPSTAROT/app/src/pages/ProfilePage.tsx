import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { PET_LEVELS } from '@/data/constants';
import { PetChicken } from '@/components/PetChicken';
import { HatchingOverlay } from '@/components/HatchingOverlay';
import { Lock, Edit3, X, Save, Egg, Sparkles, Apple, LogOut, Package, Smartphone, RadioTower, Loader2 } from 'lucide-react';

export default function ProfilePage({ onScanClick }: any) {
  const navigate = useNavigate();
  const { user, credits, expiryLabel, creditsExpiresAt, updateUserSession, refreshCredits, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'history' | 'orders' | 'nfc'>('history');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Pet states
  const [showHatchOverlay, setShowHatchOverlay] = useState(false);
  const [hatchingPetType, setHatchingPetType] = useState<string | null>(null);
  const [feeding, setFeeding] = useState(false);

  // History states
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      if (activeTab === 'history') {
        setLoadingHistory(true);
        try {
          const res = await api.getMyReadings();
          if (res.success) setHistory(res.data.items || []);
          else throw new Error();
        } catch (err) { 
          console.log("Using mock history");
          setHistory([
            { id: '1', createdAt: new Date().toISOString(), topic: 'Tình duyên', cardCount: 1, aiResponseStory: 'Một khởi đầu mới đầy hy vọng...' },
            { id: '2', createdAt: new Date(Date.now() - 86400000).toISOString(), topic: 'Sự nghiệp', cardCount: 3, aiResponseStory: 'Cần kiên nhẫn hơn trong công việc...' }
          ]);
        }
        finally { setLoadingHistory(false); }
      } else if (activeTab === 'orders') {
        setLoadingOrders(true);
        try {
          const res = await api.getMyOrders();
          if (res.success) setOrders(res.data.items || []);
          else throw new Error();
        } catch (err) { 
          console.log("Using mock orders");
          setOrders([
            { id: 'ORD001', createdAt: new Date().toISOString(), totalAmount: 199000, status: 'delivered', items: [{ productName: 'Móc khóa NFC' }] },
            { id: 'ORD002', createdAt: new Date(Date.now() - 172800000).toISOString(), totalAmount: 89000, status: 'processing', items: [{ productName: 'Đá Thạch Anh' }] }
          ]);
        }
        finally { setLoadingOrders(false); }
      }
    };
    fetchData();
  }, [activeTab, user]);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSavingProfile(true);
    try {
      await api.updateProfile({ fullName: editName, phoneNumber: editPhone });
      updateUserSession({ name: editName, phoneNumber: editPhone });
      setEditingProfile(false);
    } catch (err) {
      alert("Lỗi cập nhật hồ sơ: " + (err as any).message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFeed = async () => {
    if (!user || user.petFood <= 0 || feeding) return;
    setFeeding(true);
    try {
      const res = await api.feedPet(1); // Cho ăn 1 đơn vị
      if (res.success) {
        // Cập nhật local state
        updateUserSession({ 
          petExp: res.data.currentExp, 
          petFood: res.data.currentFood,
          petStatus: res.data.petStatus 
        });
      } else throw new Error();
    } catch (err) {
      console.log("Mock feeding");
      updateUserSession({ 
        petExp: (user.petExp || 0) + 10, 
        petFood: (user.petFood || 0) - 1,
        petStatus: 'alive'
      });
    } finally {
      setFeeding(false);
    }
  };

  const handleHatch = async () => {
    if (!user || user.petStatus !== 'egg') return;
    try {
      const res = await api.hatchPet();
      if (res.success) {
        setHatchingPetType(res.data.petType);
        setShowHatchOverlay(true);
        updateUserSession({ 
          petType: res.data.petType, 
          petStatus: res.data.petStatus,
          petName: res.data.petName 
        });
      } else throw new Error();
    } catch (err) {
      console.log("Mock hatching");
      const mockType = 'chicken_classic';
      setHatchingPetType(mockType);
      setShowHatchOverlay(true);
      updateUserSession({ 
        petType: mockType, 
        petStatus: 'alive',
        petName: 'Thần kê' 
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-yellow-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center max-w-md w-full shadow-2xl">
          <Lock className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Đăng nhập để xem nhật ký trải bài và quản lý thú cưng của bạn.</p>
          <button onClick={() => navigate('/auth')} className="btn-3d-yellow w-full">Đăng nhập ngay</button>
        </div>
      </div>
    );
  }

  // Level calculation unified with GamePage
  const getLevelInfo = (exp: number) => {
    for (let i = 0; i < PET_LEVELS.length; i++) {
      if (exp < PET_LEVELS[i].maxExp) return { level: i, ...PET_LEVELS[i] };
    }
    return { level: 3, ...PET_LEVELS[3] };
  };

  const currentInfo = getLevelInfo(user.petExp || 0);
  const level = currentInfo.level; // Internal index 0-3
  const displayLevel = level + 1; // Display 1-4
  
  const prevMaxExp = level === 0 ? 0 : PET_LEVELS[level - 1].maxExp;
  const targetExp = currentInfo.maxExp === Infinity ? (user.petExp || 0) : currentInfo.maxExp;
  const progressPercent = level === 3 ? 100 : (((user.petExp || 0) - prevMaxExp) / (targetExp - prevMaxExp)) * 100;

  return (
    <div className="min-h-screen py-12 px-4">
      {showHatchOverlay && (
        <HatchingOverlay 
          petType={hatchingPetType} 
          petName={user.petName || 'Thần kê'} 
          onFinished={() => setShowHatchOverlay(false)} 
        />
      )}

      <div className="max-w-4xl mx-auto">
        {editingProfile && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingProfile(false)}
          >
            <div
              className="bg-[#0d0d2b]/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-md w-full shadow-[0_0_80px_rgba(139,92,246,0.2)] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center"><Edit3 className="w-5 h-5 mr-2" /> Chỉnh sửa hồ sơ</h3>
                <button onClick={() => setEditingProfile(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/30 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-purple-200/80 mb-1">Họ và tên</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] text-white placeholder-white/30 focus:border-purple-400/60 focus:outline-none focus:bg-white/[0.10] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-purple-200/80 mb-1">Số điện thoại</label>
                  <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] text-white placeholder-white/30 focus:border-purple-400/60 focus:outline-none focus:bg-white/[0.10] transition-all" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveProfile} disabled={savingProfile}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {savingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : <><Save className="w-4 h-4" /> Lưu thay đổi</>}
                  </button>
                  <button onClick={() => setEditingProfile(false)}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl font-bold transition-colors border border-white/10">Huỷ</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/[0.06] backdrop-blur-xl rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-[0_0_60px_rgba(139,92,246,0.1)]">
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 p-8 text-white flex flex-col md:flex-row items-start gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            {/* Pet Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border-4 border-white/30 shadow-lg flex-shrink-0 relative overflow-hidden">
                {user.petStatus === 'egg' ? (
                  <Egg className="w-16 h-16 text-yellow-100 animate-bounce" />
                ) : (
                  <PetChicken type={user.petType || 'chicken_classic'} level={level} className="w-24 h-24" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 text-purple-900 rounded-xl flex items-center justify-center font-black text-sm shadow-lg border-2 border-white">
                Lv.{displayLevel}
              </div>
            </div>

            <div className="text-center md:text-left z-10 flex-1">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start w-full gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                    {user.name}
                    {user.petStatus !== 'egg' && <span className="text-sm font-normal text-purple-200 opacity-70">| {user.petName}</span>}
                  </h1>
                  <p className="text-purple-200 mb-3">{user.email}</p>
                  
                  {/* Pet Progress */}
                  <div className="mb-4 max-w-xs mx-auto md:mx-0">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                      <span>Kinh nghiệm (EXP)</span>
                      <span>{user.petExp}/{currentInfo.maxExp === Infinity ? 'MAX' : currentInfo.maxExp}</span>
                    </div>
                    <div className="h-2 bg-black/20 rounded-full overflow-hidden border border-white/10">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-1000" style={{width: `${progressPercent}%`}} />
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {user.petStatus === 'egg' ? (
                      <button onClick={handleHatch} className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-yellow-300 transition-all shadow-lg active:scale-95 flex items-center gap-1">
                        <Sparkles className="w-4 h-4" /> Ấp trứng ngay!
                      </button>
                    ) : (
                      <button onClick={handleFeed} disabled={user.petFood <= 0 || feeding}
                        className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-orange-400 transition-all shadow-lg disabled:opacity-50 active:scale-95 flex items-center gap-2">
                        <Apple className="w-4 h-4" /> Cho ăn ({user.petFood}) {feeding && '...'}
                      </button>
                    )}
                    <button onClick={() => { logout(); navigate('/'); }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                    <button onClick={() => { setEditName(user.name); setEditPhone(user.phoneNumber || ''); setEditingProfile(true); }}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20 transition-all flex items-center gap-2">
                      <Edit3 className="w-4 h-4" /> Hồ sơ
                    </button>
                  </div>
                </div>
                
                {/* Credits Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[180px] text-center md:text-right flex flex-col md:items-end items-center">
                  <p className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">Số dư lượt bốc bài</p>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-black text-yellow-400 leading-none">{credits}</span>
                    <span className="text-yellow-400/80 text-sm font-medium pb-1">lượt</span>
                  </div>
                  <div className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                    expiryLabel.urgency === 'expired' ? 'bg-red-500/80 text-white' :
                    expiryLabel.urgency === 'warning' ? 'bg-amber-500/80 text-white' :
                    'bg-green-500/80 text-white'
                  }`}>
                    {creditsExpiresAt ? `Hạn dùng: ${new Date(creditsExpiresAt).toLocaleDateString('vi-VN')}` : 'Vô thời hạn (NFC)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex border-b border-white/10 bg-white/[0.04]">
            {['history', 'orders', 'nfc'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 font-bold text-sm text-center transition-all flex items-center justify-center gap-2 relative ${activeTab === tab ? 'text-yellow-400 bg-white/[0.06]' : 'text-white/40 hover:text-white/70'}`}>
                {tab === 'history' ? <><Sparkles className="w-4 h-4" /> Nhật ký Tarot</> : tab === 'orders' ? <><Package className="w-4 h-4" /> Đơn hàng</> : <><Smartphone className="w-4 h-4" /> Thẻ NFC</>}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 rounded-full mx-4" />}
              </button>
            ))}
          </div>

          <div className="p-6 bg-white/[0.03] min-h-[500px]">
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Nhật ký trải bài</h2>
                </div>

                {loadingHistory ? (
                  <div className="py-12 text-center text-white/40">Đang tải nhật ký...</div>
                ) : history.length === 0 ? (
                  <div className="py-12 text-center text-white/40">Bạn chưa có phiên bốc bài nào.</div>
                ) : history.map(h => (
                  <div key={h.id} className="bg-white/[0.05] border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.08] transition-all duration-300">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-white/30 uppercase font-bold">{new Date(h.createdAt).toLocaleString('vi-VN')}</p>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/20 rounded-full text-[10px] font-bold uppercase">{h.readingType}</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-4">
                        {h.details.map((d: any, idx: number) => (
                          <div key={idx} className="space-y-1 text-center">
                            <img src={d.card.imageUrl} alt={d.card.name} className="aspect-[2/3] object-cover rounded-lg border border-white/10 shadow-sm" />
                            <p className="text-[10px] font-bold text-white/70 truncate">{d.card.name}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-2xl p-4">
                        <p className="text-xs text-white/60 italic line-clamp-3">{h.summary}</p>
                      </div>
                      <button onClick={() => navigate(`/reading/${h.id}`)} className="mt-4 text-yellow-400/70 text-xs font-bold hover:text-yellow-400">Xem lại lời giải →</button>
                    </div>
                  </div>
                ))}
                
                <button onClick={() => navigate('/reading')} className="w-full py-8 border-2 border-dashed border-yellow-400/20 text-yellow-400/50 rounded-3xl hover:bg-yellow-400/5 hover:border-yellow-400/40 hover:text-yellow-400/80 font-bold transition-all flex flex-col items-center gap-2">
                  <Sparkles className="w-8 h-8" />
                  <span>Bắt đầu phiên bốc bài mới</span>
                </button>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của bạn</h2>
                {loadingOrders ? (
                  <div className="py-12 text-center text-gray-400">Đang tải đơn hàng...</div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">Bạn chưa có đơn hàng nào.</div>
                ) : orders.map(o => (
                  <div key={o.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-bold text-gray-800">#{o.id.substring(0,8).toUpperCase()}</p>
                          <p className="text-xs text-gray-400 uppercase font-bold mt-1">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {o.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {o.items.map((item: any, idx: number) => (
                          <p key={idx} className="text-sm text-gray-600 flex justify-between">
                            <span>{item.productName} x {item.quantity}</span>
                            <span>{(item.priceAtPurchase * item.quantity).toLocaleString()}đ</span>
                          </p>
                        ))}
                      </div>
                      <div className="border-t border-gray-50 mt-4 pt-4 flex justify-between items-center">
                        <span className="text-xl font-bold text-red-500">{o.totalAmount.toLocaleString()}đ</span>
                        <button onClick={() => setSelectedOrder(o)} className="text-purple-600 text-xs font-bold">Chi tiết</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'nfc' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl mb-8">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Kích hoạt Thẻ NFC mới</h3>
                    <p className="text-white/80 text-sm mb-6 max-w-md">Chạm móc khóa CHIPSTAROT của bạn để nhận lượt bốc bài mỗi ngày.</p>
                    <button onClick={onScanClick} className="bg-white text-orange-600 px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg"> Chạm để quét ngay</button>
                  </div>
                  <RadioTower className="absolute top-8 right-8 w-16 h-16 opacity-30 animate-pulse" />
                </div>
                <p className="text-center text-gray-400 py-12">Đang tải danh sách thẻ...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Chi tiết đơn hàng</h3>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/40"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{item.productName}</p>
                      <p className="text-xs text-gray-500">SL: {item.quantity} | {item.priceAtPurchase.toLocaleString()}đ</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500"><span>Tạm tính</span><span>{selectedOrder.subtotalAmount.toLocaleString()}đ</span></div>
                <div className="flex justify-between text-sm text-green-600"><span>Giảm giá</span><span>-{selectedOrder.discountAmount.toLocaleString()}đ</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>Phí vận chuyển</span><span>{selectedOrder.shippingFee.toLocaleString()}đ</span></div>
                <div className="flex justify-between pt-2 border-t border-gray-50"><span className="font-bold">Tổng cộng</span><span className="text-2xl font-black text-red-500">{selectedOrder.totalAmount.toLocaleString()}đ</span></div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">Theo dõi vận chuyển</button>
                <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold hover:bg-gray-100 transition-colors">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
