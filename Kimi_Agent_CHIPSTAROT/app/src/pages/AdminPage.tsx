import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

export default function AdminPage({ setPage }: any) {
  const [tab, setTab] = useState<'dashboard' | 'products' | 'orders' | 'users' | 'reports' | 'cards' | 'nfcs' | 'blogs'>('dashboard');

  const [tarotCards, setTarotCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [viewingCard, setViewingCard] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [mockUsers, setMockUsers] = useState([
    { id: 'US-001', name: 'Nguyễn Văn A', email: 'nva@chipstarot.com', role: 'Admin', status: 'active', joined: '15/01/2024', readings: 1250 },
    { id: 'US-002', name: 'Trần Thị B', email: 'ttb_khachhang@gmail.com', role: 'Customer', status: 'active', joined: '20/04/2024', readings: 12 },
    { id: 'US-003', name: 'Lê C', email: 'lec_spam@yahoo.com', role: 'Customer', status: 'banned', joined: '22/04/2024', readings: 0 },
    { id: 'US-004', name: 'Phạm D', email: 'phamd123@gmail.com', role: 'Customer', status: 'unverified', joined: '25/04/2024', readings: 0 },
  ]);

  useEffect(() => {
    setLoadingCards(true);
    fetch('/tarot_database.json')
      .then(r => r.json())
      .then(d => { 
        setTarotCards(d.cards || []); 
        setLoadingCards(false); 
      })
      .catch(() => setLoadingCards(false));
  }, []);

  const mockStats = [
    { label: 'Tổng Đơn Hàng', value: '128', icon: '📦', color: 'from-blue-400 to-blue-500' },
    { label: 'Doanh Thu', value: '14.2M₫', icon: '💰', color: 'from-green-400 to-green-500' },
    { label: 'Thành Viên', value: '342', icon: '👤', color: 'from-purple-400 to-purple-500' },
    { label: 'Phiên Tarot', value: '1,205', icon: '🔮', color: 'from-yellow-400 to-yellow-500' },
  ];

  const mockOrders = [
    { id: '#001', customer: 'Lan Anh', product: 'Móc khóa NFC', amount: '199,000đ', status: 'delivered', date: '25/04' },
    { id: '#002', customer: 'Minh Tuấn', product: 'Đá Thạch Anh Tím', amount: '89,000đ', status: 'shipped', date: '24/04' },
    { id: '#003', customer: 'Thu Hà', product: 'Đá Mắt Hổ', amount: '79,000đ', status: 'processing', date: '24/04' },
    { id: '#004', customer: 'Quốc Bảo', product: 'Đá Thạch Anh Hồng', amount: '85,000đ', status: 'pending', date: '23/04' },
  ];

  const mockProducts = [
    { id: 1, name: 'Móc khóa NFC CHIPSTAROT', price: '199,000đ', stock: 45, status: 'active', image: '/products/nfc-chick.jpg' },
    { id: 2, name: 'Đá Thạch Anh Tím', price: '89,000đ', stock: 12, status: 'active', image: '/products/amethyst.jpg' },
    { id: 3, name: 'Đá Mắt Hổ', price: '79,000đ', stock: 0, status: 'out', image: '/products/tiger-eye.jpg' },
    { id: 4, name: 'Đá Thạch Anh Hồng', price: '85,000đ', stock: 8, status: 'active', image: '/products/rose-quartz.jpg' },
  ];

  const mockNfcChips = [
    { id: 'NFC-A10293', product: 'Móc khóa NFC CHIPSTAROT', owner: 'Lan Anh', status: 'activated', scans: 45, date: '12/03/2024' },
    { id: 'NFC-B99212', product: 'Đá Thạch Anh Tím', owner: 'Minh Tuấn', status: 'unactivated', scans: 0, date: '-' },
    { id: 'NFC-C77382', product: 'Đá Mắt Hổ', owner: 'Thu Hà', status: 'activated', scans: 12, date: '01/04/2024' },
  ];

  const mockBlogs = [
    { id: 1, title: 'Giải mã bí ẩn lá bài The Fool', author: 'Admin Tâm Linh', views: 1250, status: 'published', date: '25/04/2024' },
    { id: 2, title: 'Cách thanh tẩy đá Thạch Anh đúng chuẩn', author: 'Admin Năng Lượng', views: 890, status: 'published', date: '20/04/2024' },
    { id: 3, title: 'Dự báo năng lượng tuần mới (28/04 - 05/05)', author: 'Admin Tâm Linh', views: 0, status: 'draft', date: '28/04/2024' },
  ];


  const mockReports = {
    system: [
      { label: 'Server Uptime', value: '99.98%', status: 'Tốt', color: 'text-green-400' },
      { label: 'Lỗi API (500)', value: '12 lỗi', status: 'Cảnh báo', color: 'text-yellow-400' },
      { label: 'Tải trọng CPU', value: '45%', status: 'Bình thường', color: 'text-green-400' },
      { label: 'Latency Supabase', value: '14ms', status: 'Rất nhanh', color: 'text-blue-400' },
    ]
  };

  const revenueData = [
    { name: 'Tháng 11', doanhThu: 15, donHang: 45 },
    { name: 'Tháng 12', doanhThu: 22, donHang: 60 },
    { name: 'Tháng 1', doanhThu: 18, donHang: 50 },
    { name: 'Tháng 2', doanhThu: 35, donHang: 90 },
    { name: 'Tháng 3', doanhThu: 28, donHang: 75 },
    { name: 'Tháng 4', doanhThu: 42, donHang: 120 },
  ];

  const tarotData = [
    { day: 'T2', luotBoc: 120 },
    { day: 'T3', luotBoc: 150 },
    { day: 'T4', luotBoc: 180 },
    { day: 'T5', luotBoc: 140 },
    { day: 'T6', luotBoc: 210 },
    { day: 'T7', luotBoc: 350 },
    { day: 'CN', luotBoc: 420 },
  ];

  const orderStatusData = [
    { name: 'Đã giao', value: 400, color: '#4ade80' },
    { name: 'Đang giao', value: 150, color: '#60a5fa' },
    { name: 'Đang xử lý', value: 80, color: '#facc15' },
    { name: 'Đã huỷ', value: 20, color: '#f87171' },
  ];

  const topProductsData = [
    { name: 'Móc khóa NFC CHIPSTAROT', sales: 124, revenue: '24.6M', color: 'text-yellow-400' },
    { name: 'Đá Thạch Anh Tím', sales: 85, revenue: '7.5M', color: 'text-purple-400' },
    { name: 'Đá Thạch Anh Hồng', sales: 62, revenue: '5.2M', color: 'text-pink-400' },
  ];

  const topPackagesData = [
    { name: 'Gói Phổ Biến (90 ngày)', sales: 312, revenue: '21.5M', icon: '🔮' },
    { name: 'Gói Khởi Đầu (30 ngày)', sales: 180, revenue: '5.2M', icon: '🌙' },
    { name: 'Gói Cao Cấp (365 ngày)', sales: 95, revenue: '17.0M', icon: '✨' },
  ];

  const statusBadge: Record<string, string> = {
    delivered: 'bg-green-100 text-green-700',
    shipped: 'bg-blue-100 text-blue-700',
    processing: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-gray-100 text-gray-600',
  };
  const statusLabel: Record<string, string> = {
    delivered: 'Đã giao', shipped: 'Đang giao', processing: 'Đang xử lý', pending: 'Chờ xác nhận',
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Tổng quan' },
    { id: 'users', label: '👥 Quản lý TK' },
    { id: 'cards', label: '🎴 Quản lý Thẻ' },
    { id: 'products', label: '🛍️ Sản phẩm' },
    { id: 'orders', label: '📦 Đơn hàng' },
    { id: 'nfcs', label: '🏷️ Mã Chip NFC' },
    { id: 'blogs', label: '✍️ Bài viết (Blog)' },
    { id: 'reports', label: '📈 Báo cáo' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-yellow-900">
      <div className="bg-white/10 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/chicken-mascot.png" alt="" className="w-8 h-8" />
          <span className="text-white font-bold text-lg">CHIPSTAROT <span className="text-yellow-400">Admin</span></span>
        </div>
        <button onClick={() => setPage('home')} className="text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors">← Về trang người dùng</button>
      </div>

      <div className="flex">
        <aside className="w-56 min-h-screen bg-white/5 backdrop-blur-sm border-r border-white/10 p-4 hidden md:block">
          <nav className="space-y-1 mt-4">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all text-sm ${tab === t.id ? 'bg-yellow-500 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="md:hidden w-full fixed bottom-0 left-0 bg-purple-900/95 border-t border-white/10 flex z-40 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex-none px-4 py-4 text-xs font-medium whitespace-nowrap ${tab === t.id ? 'text-yellow-400 border-t-2 border-yellow-400' : 'text-white/60'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-6 pb-24 md:pb-6 overflow-y-auto h-[calc(100vh-64px)]">
          {tab === 'dashboard' && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white mb-6">📊 Tổng Quan Hệ Thống</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {mockStats.map(s => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/20 transition-all cursor-default">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg mb-3 shadow-lg`}>{s.icon}</div>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-white/60 text-sm mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h2 className="text-white font-bold mb-4">📦 Đơn hàng gần đây</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-white/50 border-b border-white/10">
                      <th className="text-left py-2 pr-4">Mã</th><th className="text-left py-2 pr-4">Khách</th>
                      <th className="text-left py-2 pr-4">Sản phẩm</th><th className="text-left py-2 pr-4">Tiền</th>
                      <th className="text-left py-2">Trạng thái</th>
                    </tr></thead>
                    <tbody>{mockOrders.map(o => (
                      <tr key={o.id} className="border-b border-white/5 text-white/80 hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-4 font-mono text-yellow-400">{o.id}</td>
                        <td className="py-3 pr-4">{o.customer}</td>
                        <td className="py-3 pr-4">{o.product}</td>
                        <td className="py-3 pr-4 font-semibold">{o.amount}</td>
                        <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[o.status]}`}>{statusLabel[o.status]}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'products' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">🛍️ Quản Lý Sản Phẩm</h1>
                <button onClick={() => setEditingProduct({})} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-5 py-2 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">+ Thêm sản phẩm</button>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5"><tr className="text-white/50">
                    <th className="text-left p-4">Sản phẩm</th><th className="text-left p-4">Giá</th>
                    <th className="text-left p-4">Tồn kho</th><th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Thao tác</th>
                  </tr></thead>
                  <tbody>{mockProducts.map(p => (
                    <tr key={p.id} className="border-t border-white/10 text-white/80 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image || '/chicken-mascot.png'} alt="" className="w-10 h-10 object-cover rounded-lg bg-white/10 border border-white/20" onError={(e:any) => e.target.src='/chicken-mascot.png'} />
                          <span className="font-bold text-white">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-yellow-400 font-semibold">{p.price}</td>
                      <td className="p-4"><span className={p.stock === 0 ? 'text-red-400' : p.stock < 10 ? 'text-yellow-400' : 'text-green-400'}>{p.stock === 0 ? 'Hết hàng' : `${p.stock} cái`}</span></td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.status === 'active' ? 'Đang bán' : 'Hết hàng'}</span></td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => setEditingProduct(p)} className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 rounded-lg text-xs transition-all">Sửa</button>
                          <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-xs transition-all">Ẩn</button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white mb-6">📦 Quản Lý Đơn Hàng</h1>
              <div className="flex gap-2 mb-6 flex-wrap">
                {['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã huỷ'].map(s => (
                  <button key={s} className="px-4 py-2 rounded-full text-sm bg-white/10 text-white/70 hover:bg-yellow-500 hover:text-yellow-950 hover:font-bold transition-all">{s}</button>
                ))}
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5"><tr className="text-white/50">
                    <th className="text-left p-4">Mã ĐH</th><th className="text-left p-4">Khách</th>
                    <th className="text-left p-4">Sản phẩm</th><th className="text-left p-4">Tổng tiền</th>
                    <th className="text-left p-4">Ngày</th><th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Cập nhật</th>
                  </tr></thead>
                  <tbody>{mockOrders.map(o => (
                    <tr key={o.id} className="border-t border-white/10 text-white/80 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-yellow-400">{o.id}</td>
                      <td className="p-4">{o.customer}</td>
                      <td className="p-4">{o.product}</td>
                      <td className="p-4 font-semibold text-green-400">{o.amount}</td>
                      <td className="p-4 text-white/50">{o.date}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[o.status]}`}>{statusLabel[o.status]}</span></td>
                      <td className="p-4">
                        <button onClick={() => setEditingOrder(o)} className="px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-xs transition-all shadow-sm">Chi tiết & Cập nhật</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">👥 Quản Lý Tài Khoản</h1>
                  <p className="text-white/60 text-sm mt-1">Quản lý người dùng, lữ khách và phân quyền hệ thống</p>
                </div>
                <button onClick={() => setEditingUser({})} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-5 py-2 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all transform hover:-translate-y-1">+ Thêm tài khoản</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[{label:'Tổng tài khoản',v:'342',c:'from-purple-500/80 to-purple-800/80', i:'👥'},{label:'Admin/Nhân viên',v:'12',c:'from-blue-500/80 to-blue-800/80', i:'🛡️'},{label:'Đang bị khoá',v:'5',c:'from-red-500/80 to-red-800/80', i:'🚫'}].map(s => (
                  <div key={s.label} className={`bg-gradient-to-br ${s.c} backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/20 relative overflow-hidden group`}>
                    <div className="absolute -right-4 -top-4 text-6xl opacity-20 group-hover:scale-110 transition-transform">{s.i}</div>
                    <p className="text-4xl font-black text-white relative z-10">{s.v}</p>
                    <p className="text-white/80 font-medium text-sm mt-1 relative z-10">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                  <thead className="bg-white/5"><tr className="text-white/50">
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-xs">ID / Ngày tham gia</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-xs">Thông tin Lữ khách</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-xs">Số lượt bốc</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-xs">Phân Quyền</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-xs">Trạng thái</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-xs">Thao tác</th>
                  </tr></thead>
                  <tbody>{mockUsers.map(u => (
                    <tr key={u.id} className="border-t border-white/10 text-white/80 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <p className="font-mono text-yellow-400 font-bold">{u.id}</p>
                        <p className="text-xs text-white/50">{u.joined}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-yellow-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-xs text-white/50">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-white/10 px-3 py-1 rounded-full font-mono text-yellow-300">{u.readings}</span>
                      </td>
                      <td className="p-4">
                        <select className={`bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-yellow-400 focus:bg-purple-900 transition-colors ${u.role === 'Admin' ? 'text-purple-300 font-bold border-purple-500/50' : 'text-white/80'}`} defaultValue={u.role}>
                          <option value="Admin" className="bg-purple-900">Admin</option>
                          <option value="Customer" className="bg-purple-900">Khách hàng</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${u.status === 'active' ? 'border-green-500/50 text-green-400 bg-green-500/10' : u.status === 'banned' ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-gray-500/50 text-gray-400 bg-gray-500/10'}`}>
                          {u.status === 'active' ? 'Hoạt động' : u.status === 'banned' ? 'Đã bị khoá' : 'Chưa xác minh'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => setEditingUser(u)} className="px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-xs transition-all shadow-sm">Sửa</button>
                          <button className={`px-3 py-1 rounded-lg text-xs transition-all border shadow-sm ${u.status === 'banned' ? 'bg-green-500/10 hover:bg-green-500/30 border-green-500/30 text-green-300' : 'bg-red-500/10 hover:bg-red-500/30 border-red-500/30 text-red-300'}`}>
                            {u.status === 'banned' ? 'Mở khoá' : 'Khoá'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'cards' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">🎴 Quản Lý Thẻ Tarot</h1>
                  <p className="text-white/60 text-sm mt-1">Cập nhật ý nghĩa, hình ảnh và phân loại các lá bài trong bộ bài</p>
                </div>
                <button onClick={() => setEditingCard({})} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-5 py-2 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all transform hover:-translate-y-1">+ Thêm Thẻ Mới</button>
              </div>
              <div className="flex gap-2 mb-6 flex-wrap">
                {['Tất cả (78)', 'Major Arcana (22)', 'Minor Arcana (56)', 'Wands', 'Cups', 'Swords', 'Pentacles'].map((s, i) => (
                  <button key={s} className={`px-4 py-2 rounded-full text-sm transition-all ${i === 0 ? 'bg-yellow-500 text-yellow-950 font-bold shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}>{s}</button>
                ))}
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                  <thead className="bg-white/5"><tr className="text-white/50">
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-xs">Mã Thẻ</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-xs">Tên Thẻ (Eng / VN)</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-xs">Phân loại</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-xs">Nguyên tố</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-xs">Trạng thái</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-xs">Thao tác</th>
                  </tr></thead>
                  <tbody>
                    {loadingCards ? (
                      <tr><td colSpan={6} className="p-8 text-center text-white/50">Đang tải dữ liệu bộ bài... 🔮</td></tr>
                    ) : tarotCards.map((c, idx) => {
                      const suit = c.name.split(' of ')[1];
                      let element = 'Air';
                      if (suit === 'Wands') element = 'Fire';
                      if (suit === 'Cups') element = 'Water';
                      if (suit === 'Pentacles') element = 'Earth';
                      if (suit === 'Swords') element = 'Air';
                      if (c.arcana === 'Major Arcana') element = 'Spirit';

                      return (
                      <tr key={c.id || idx} className="border-t border-white/10 text-white/80 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-yellow-400 font-bold">T{String(c.id || idx).padStart(2, '0')}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={c.image || '/card-back.png'} className="w-10 h-14 object-cover rounded-md border border-white/20 shadow-lg" onError={e => (e.currentTarget.src = '/card-back.png')} alt="" />
                            <div>
                              <span className="font-bold text-white text-base block">{c.name}</span>
                              <span className="text-xs text-white/50 line-clamp-1 w-48" title={c.meanings?.upright || c.meanings?.general}>{c.meanings?.upright || c.meanings?.general || 'Chưa cập nhật ý nghĩa'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-white/70 bg-white/5 px-2 py-1 rounded-md text-xs whitespace-nowrap">{c.arcana || 'Unknown'}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium border whitespace-nowrap ${element === 'Fire' ? 'border-red-500/50 text-red-300 bg-red-500/10' : element === 'Water' ? 'border-blue-500/50 text-blue-300 bg-blue-500/10' : element === 'Earth' ? 'border-green-500/50 text-green-300 bg-green-500/10' : element === 'Spirit' ? 'border-purple-500/50 text-purple-300 bg-purple-500/10' : 'border-gray-400/50 text-gray-300 bg-gray-400/10'}`}>
                            {element === 'Fire' ? '🔥 Fire' : element === 'Water' ? '💧 Water' : element === 'Earth' ? '🌍 Earth' : element === 'Spirit' ? '✨ Spirit' : '💨 Air'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold border border-green-500/50 text-green-400 bg-green-500/10 whitespace-nowrap">
                            Đã xuất bản
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => setViewingCard(c)} className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs transition-all shadow-sm whitespace-nowrap">Xem chi tiết</button>
                            <button onClick={() => setEditingCard(c)} className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-xs transition-all shadow-sm whitespace-nowrap">Sửa nội dung</button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'nfcs' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">🏷️ Quản Lý Chip NFC</h1>
                  <p className="text-white/60 text-sm mt-1">Theo dõi các lõi NFC vật lý được gắn vào sản phẩm tâm linh</p>
                </div>
                <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-5 py-2 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">+ Gắn Chip Mới</button>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5"><tr className="text-white/50">
                    <th className="text-left p-4">Mã Chip (NFC Tag ID)</th><th className="text-left p-4">Sản Phẩm Đính Kèm</th>
                    <th className="text-left p-4">Chủ sở hữu</th><th className="text-left p-4">Lượt Quét</th>
                    <th className="text-left p-4">Trạng thái</th><th className="text-left p-4">Thao tác</th>
                  </tr></thead>
                  <tbody>{mockNfcChips.map(n => (
                    <tr key={n.id} className="border-t border-white/10 text-white/80 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono font-bold text-cyan-400">{n.id}</td>
                      <td className="p-4">{n.product}</td>
                      <td className="p-4 font-semibold">{n.owner}</td>
                      <td className="p-4 font-mono">{n.scans}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${n.status === 'activated' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-gray-500/50 text-gray-400 bg-gray-500/10'}`}>
                          {n.status === 'activated' ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-xs transition-all shadow-sm">Thu hồi / Sửa</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'blogs' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">✍️ Nội Dung & Bài Viết</h1>
                  <p className="text-white/60 text-sm mt-1">Viết blog chia sẻ kiến thức tâm linh, phong thủy, và Tarot</p>
                </div>
                <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-5 py-2 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">✍️ Viết Bài Mới</button>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5"><tr className="text-white/50">
                    <th className="text-left p-4">Tiêu đề bài viết</th><th className="text-left p-4">Tác giả</th>
                    <th className="text-left p-4">Lượt xem</th><th className="text-left p-4">Ngày đăng</th>
                    <th className="text-left p-4">Trạng thái</th><th className="text-left p-4">Thao tác</th>
                  </tr></thead>
                  <tbody>{mockBlogs.map(b => (
                    <tr key={b.id} className="border-t border-white/10 text-white/80 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white text-base">{b.title}</td>
                      <td className="p-4">{b.author}</td>
                      <td className="p-4 font-mono text-yellow-400">{b.views}</td>
                      <td className="p-4">{b.date}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${b.status === 'published' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'}`}>
                          {b.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-xs transition-all shadow-sm">Chỉnh sửa</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">📈 Phân Tích & Báo Cáo Chuyên Sâu</h1>
                  <p className="text-yellow-400 font-bold text-lg">Tổng Doanh Thu Hệ Thống: 160,000,000 đ</p>
                </div>
                <div className="flex gap-2">
                  <select className="bg-white/10 text-white/80 border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400">
                    <option value="7">7 ngày qua</option>
                    <option value="30">30 ngày qua</option>
                    <option value="180">6 tháng qua</option>
                    <option value="all">Toàn thời gian</option>
                  </select>
                  <button onClick={() => alert('Đang xuất file Excel...')} className="bg-green-600 hover:bg-green-500 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-lg">📥 Xuất Excel</button>
                  <button onClick={() => setShowReportModal(true)} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-lg">📄 Báo Cáo Tổng Thể</button>
                </div>
              </div>

              {/* Hàng 1: Doanh thu & Tỉ lệ Đơn hàng */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 lg:col-span-2">
                  <h2 className="text-white font-bold mb-6 flex items-center gap-2">💰 Biểu Đồ Doanh Thu & Đơn Hàng (6 Tháng)</h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#facc15" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}tr`} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(88, 28, 135, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }}
                          formatter={(value, name) => [name === 'doanhThu' ? `${value} Triệu VNĐ` : `${value} đơn`, name === 'doanhThu' ? 'Doanh thu' : 'Số đơn']}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', opacity: 0.8 }} />
                        <Area type="monotone" dataKey="doanhThu" name="Doanh Thu" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#colorDoanhThu)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h2 className="text-white font-bold mb-2 flex items-center gap-2">📦 Trạng Thái Giao Hàng</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(88, 28, 135, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }}
                        />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Hàng 1.5: Sản phẩm bán chạy & Gói cước */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h2 className="text-white font-bold mb-4 flex items-center gap-2">🛍️ Top Sản Phẩm Vật Lý Bán Chạy</h2>
                  <div className="space-y-4">
                    {topProductsData.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold ${p.color}`}>#{idx + 1}</div>
                          <div>
                            <p className="text-white font-bold text-sm">{p.name}</p>
                            <p className="text-white/50 text-xs">Đã bán: {p.sales}</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-bold">{p.revenue}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h2 className="text-white font-bold mb-4 flex items-center gap-2">🔮 Top Gói Lượt Tarot Được Mua Nhất</h2>
                  <div className="space-y-4">
                    {topPackagesData.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">{p.icon}</div>
                          <div>
                            <p className="text-white font-bold text-sm">{p.name}</p>
                            <p className="text-white/50 text-xs">Lượt đăng ký: {p.sales}</p>
                          </div>
                        </div>
                        <span className="text-yellow-400 font-bold">{p.revenue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hàng 2: Tarot Usage & System */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h2 className="text-white font-bold mb-6 flex items-center gap-2">🔮 Tần Suất Lượt Bốc Tarot Trực Tuyến (Tuần này)</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tarotData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <XAxis dataKey="day" stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                          contentStyle={{ backgroundColor: 'rgba(88, 28, 135, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }}
                          formatter={(value) => [`${value} lượt bốc`, 'Tổng số lượt']}
                        />
                        <Bar dataKey="luotBoc" fill="#a855f7" radius={[6, 6, 0, 0]}>
                          {tarotData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.luotBoc > 300 ? '#facc15' : '#a855f7'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-center text-xs text-white/50 mt-2">* Các cột màu vàng cảnh báo mức tải AI cao.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
                  <div>
                    <h2 className="text-white font-bold mb-6 flex items-center gap-2">⚙️ Trạng Thái Cấu Hình Dịch Vụ</h2>
                    <div className="space-y-4">
                      {mockReports.system.map(s => (
                        <div key={s.label} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                          <span className="text-white/80 font-medium">{s.label}</span>
                          <div className="text-right">
                            <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-white/40">{s.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-sm text-white/60">Phiên bản Database: Supabase PG-15</span>
                    <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">Kiểm tra Logs →</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* EDIT CARD MODAL */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-purple-900 border border-yellow-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-purple-900/90 backdrop-blur-md z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">✨ Chỉnh sửa Thẻ Bài: <span className="text-yellow-400">{editingCard.name}</span></h2>
              <button onClick={() => setEditingCard(null)} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-6">
                <div className="w-1/3">
                  <label className="text-xs text-white/60 mb-1 block">Hình ảnh (URL)</label>
                  <img src={editingCard.image || '/card-back.png'} className="w-full aspect-[2/3] object-cover rounded-xl border border-white/20 mb-2" onError={(e:any) => e.target.src='/card-back.png'} />
                  <input type="text" className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none" defaultValue={editingCard.image} />
                </div>
                <div className="w-2/3 space-y-4">
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Tên thẻ bài</label>
                    <input type="text" className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none" defaultValue={editingCard.name} />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Phân loại (Arcana)</label>
                    <input type="text" className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none" defaultValue={editingCard.arcana} />
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-yellow-400 font-bold text-sm">Ý Nghĩa Chi Tiết</h3>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Nghĩa Tổng Quan (General)</label>
                  <textarea className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none h-20" defaultValue={editingCard.meanings?.general} />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Nghĩa Xuôi (Upright)</label>
                  <textarea className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none h-20" defaultValue={editingCard.meanings?.upright} />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Nghĩa Ngược (Reversed)</label>
                  <textarea className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none h-20" defaultValue={editingCard.meanings?.reversed} />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-purple-900/90 backdrop-blur-md">
              <button onClick={() => setEditingCard(null)} className="px-5 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10">Hủy</button>
              <button onClick={() => { alert('Đã lưu dữ liệu thẻ bài!'); setEditingCard(null); }} className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-950 hover:from-yellow-400 hover:to-yellow-500 shadow-lg">Lưu Thay Đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW CARD MODAL */}
      {viewingCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-purple-900 border border-cyan-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-purple-900/90 backdrop-blur-md z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">🔍 Chi tiết Thẻ Bài: <span className="text-cyan-400">{viewingCard.name}</span></h2>
              <button onClick={() => setViewingCard(null)} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-6 flex gap-6">
              <div className="w-1/3">
                <div className="rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  <img src={viewingCard.image || '/card-back.png'} className="w-full aspect-[2/3] object-cover" onError={(e:any) => e.target.src='/card-back.png'} />
                </div>
              </div>
              <div className="w-2/3 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white/60 mb-1">Tên thẻ</h3>
                  <p className="text-lg font-bold text-white">{viewingCard.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white/60 mb-1">Phân loại</h3>
                  <p className="text-white bg-white/5 inline-block px-3 py-1 rounded-lg">{viewingCard.arcana || 'Không rõ'}</p>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div>
                    <h3 className="text-sm font-bold text-cyan-400 mb-1">📖 Ý Nghĩa Tổng Quan</h3>
                    <p className="text-sm text-white/80 leading-relaxed bg-white/5 p-3 rounded-lg">{viewingCard.meanings?.general || 'Chưa có thông tin.'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-green-400 mb-1">⬆️ Ý Nghĩa Xuôi (Upright)</h3>
                    <p className="text-sm text-white/80 leading-relaxed bg-white/5 p-3 rounded-lg">{viewingCard.meanings?.upright || 'Chưa có thông tin.'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-400 mb-1">⬇️ Ý Nghĩa Ngược (Reversed)</h3>
                    <p className="text-sm text-white/80 leading-relaxed bg-white/5 p-3 rounded-lg">{viewingCard.meanings?.reversed || 'Chưa có thông tin.'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-purple-900/90 backdrop-blur-md">
              <button onClick={() => setViewingCard(null)} className="px-5 py-2 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-purple-900 border border-yellow-500/30 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">👤 Thông tin Lữ Khách</h2>
              <button onClick={() => setEditingUser(null)} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Tên lữ khách</label>
                <input type="text" className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none" defaultValue={editingUser.name} />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Email</label>
                <input type="email" className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none" defaultValue={editingUser.email} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-white/60 mb-1 block">Phân quyền</label>
                  <select className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none" defaultValue={editingUser.role}>
                    <option value="Admin" className="bg-purple-900">Admin</option>
                    <option value="Customer" className="bg-purple-900">Khách hàng</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/60 mb-1 block">Trạng thái</label>
                  <select className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none" defaultValue={editingUser.status}>
                    <option value="active" className="bg-purple-900">Hoạt động</option>
                    <option value="banned" className="bg-purple-900">Khóa</option>
                    <option value="unverified" className="bg-purple-900">Chưa xác minh</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Số lượt bốc bài (Readings)</label>
                <input type="number" className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-yellow-400 focus:outline-none" defaultValue={editingUser.readings} />
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setEditingUser(null)} className="px-5 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10">Hủy</button>
              <button onClick={() => { alert('Đã cập nhật lữ khách!'); setEditingUser(null); }} className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-950 hover:from-yellow-400 hover:to-yellow-500 shadow-lg">Lưu Thay Đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-purple-900 border border-yellow-500/30 rounded-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">🛍️ {editingProduct.id ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
              <button onClick={() => setEditingProduct(null)} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-6 flex gap-6">
              <div className="w-1/3">
                <label className="text-xs text-white/60 mb-1 block">Hình ảnh sản phẩm</label>
                <div className="aspect-square w-full bg-white/5 rounded-xl border border-white/20 mb-3 overflow-hidden flex items-center justify-center relative group">
                  <img src={editingProduct.image || '/chicken-mascot.png'} className="w-full h-full object-cover" onError={(e:any) => e.target.src='/chicken-mascot.png'} />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-white/20 px-3 py-1 rounded-md cursor-pointer hover:bg-yellow-500/80 hover:text-yellow-950 transition-all">Tải ảnh lên 📸</span>
                  </div>
                </div>
                <input type="text" className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none" placeholder="Hoặc nhập URL ảnh..." defaultValue={editingProduct.image} />
              </div>
              <div className="w-2/3 space-y-4">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Tên sản phẩm</label>
                  <input type="text" className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none" defaultValue={editingProduct.name} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-white/60 mb-1 block">Giá (VNĐ)</label>
                    <input type="text" className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none" defaultValue={editingProduct.price} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-white/60 mb-1 block">Tồn kho</label>
                    <input type="number" className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none" defaultValue={editingProduct.stock} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Trạng thái</label>
                  <select className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none" defaultValue={editingProduct.status}>
                    <option value="active" className="bg-purple-900">Đang bán</option>
                    <option value="out" className="bg-purple-900">Hết hàng / Ẩn</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setEditingProduct(null)} className="px-5 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10">Hủy</button>
              <button onClick={() => { alert('Đã lưu sản phẩm!'); setEditingProduct(null); }} className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-950 hover:from-yellow-400 hover:to-yellow-500 shadow-lg">Lưu Thay Đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-purple-900 border border-yellow-500/30 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">📦 Chi tiết Đơn: <span className="text-yellow-400">{editingOrder.id}</span></h2>
              <button onClick={() => setEditingOrder(null)} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-sm text-white/80 mb-2"><span className="text-white/50 w-24 inline-block">Khách hàng:</span> <span className="font-bold text-white">{editingOrder.customer}</span></p>
                <p className="text-sm text-white/80 mb-2"><span className="text-white/50 w-24 inline-block">Sản phẩm:</span> {editingOrder.product}</p>
                <p className="text-sm text-white/80 mb-2"><span className="text-white/50 w-24 inline-block">Tổng tiền:</span> <span className="font-bold text-green-400">{editingOrder.amount}</span></p>
                <p className="text-sm text-white/80"><span className="text-white/50 w-24 inline-block">Ngày đặt:</span> {editingOrder.date}</p>
              </div>
              
              <div>
                <label className="text-xs text-white/60 mb-1 block">Cập nhật trạng thái giao hàng</label>
                <select className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-3 text-sm text-white font-bold focus:border-yellow-400 focus:outline-none" defaultValue={editingOrder.status}>
                  <option value="pending" className="bg-purple-900">Chờ xác nhận</option>
                  <option value="processing" className="bg-purple-900">Đang xử lý đóng gói</option>
                  <option value="shipped" className="bg-purple-900">Đang giao hàng (Shipped)</option>
                  <option value="delivered" className="bg-purple-900">Đã giao thành công</option>
                  <option value="cancelled" className="bg-purple-900">Đã Huỷ</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setEditingOrder(null)} className="px-5 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10">Đóng</button>
              <button onClick={() => { alert('Đã cập nhật trạng thái đơn hàng!'); setEditingOrder(null); }} className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-950 hover:from-yellow-400 hover:to-yellow-500 shadow-lg">Cập Nhật</button>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">📄 Báo Cáo Tổng Thể Hệ Thống</h2>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto bg-white" id="report-preview-content">
              {/* Report Header */}
              <div className="text-center mb-10 border-b-2 border-gray-100 pb-8">
                <h1 className="text-4xl font-black text-purple-800 mb-2">CHIPSTAROT</h1>
                <p className="text-xl text-gray-500 uppercase tracking-widest font-bold">Báo Cáo Hiệu Suất & Doanh Thu</p>
                <p className="text-gray-400 mt-2">Kỳ báo cáo: Quý 2 / 2026 | Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
              </div>

              {/* KPI Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-purple-50 p-6 rounded-2xl text-center">
                  <p className="text-purple-600 font-bold mb-1">Tổng Doanh Thu</p>
                  <p className="text-2xl font-black text-purple-900">160.0M đ</p>
                  <p className="text-green-500 text-sm font-bold mt-1">↑ 24% so với quý trước</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl text-center">
                  <p className="text-blue-600 font-bold mb-1">Đơn Hàng (Sản Phẩm)</p>
                  <p className="text-2xl font-black text-blue-900">1,245</p>
                  <p className="text-green-500 text-sm font-bold mt-1">↑ 12% so với quý trước</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-2xl text-center">
                  <p className="text-yellow-600 font-bold mb-1">Lượt Xem Tarot</p>
                  <p className="text-2xl font-black text-yellow-900">45,892</p>
                  <p className="text-green-500 text-sm font-bold mt-1">↑ 89% so với quý trước</p>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl text-center">
                  <p className="text-green-600 font-bold mb-1">Người Dùng Mới</p>
                  <p className="text-2xl font-black text-green-900">3,420</p>
                  <p className="text-green-500 text-sm font-bold mt-1">↑ 34% so với quý trước</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-yellow-500 pl-3">Sản phẩm vật lý bán chạy</h3>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-gray-500"><th className="p-3 text-left">Tên SP</th><th className="p-3 text-right">SL Bán</th><th className="p-3 text-right">Doanh thu</th></tr></thead>
                    <tbody>
                      {topProductsData.map((p, i) => (
                        <tr key={i} className="border-b border-gray-100"><td className="p-3 font-bold text-gray-700">{p.name}</td><td className="p-3 text-right">{p.sales}</td><td className="p-3 text-right text-green-600 font-bold">{p.revenue}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-purple-500 pl-3">Gói lượt Tarot được mua nhiều</h3>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-gray-500"><th className="p-3 text-left">Tên Gói</th><th className="p-3 text-right">Lượt ĐK</th><th className="p-3 text-right">Doanh thu</th></tr></thead>
                    <tbody>
                      {topPackagesData.map((p, i) => (
                        <tr key={i} className="border-b border-gray-100"><td className="p-3 font-bold text-gray-700">{p.name}</td><td className="p-3 text-right">{p.sales}</td><td className="p-3 text-right text-green-600 font-bold">{p.revenue}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Đánh Giá Từ Hệ Thống AI</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tỷ lệ chuyển đổi từ việc mua móc khóa vật lý (NFC) sang khách hàng nạp thêm thẻ tín dụng kĩ thuật số đạt mức <strong>45%</strong>. Năng lực xử lý của API Tarot ổn định ở mức 99.98% uptime. Đề xuất đẩy mạnh các gói Khởi đầu (30 ngày) cho tệp khách hàng mua đá Thạch Anh Tím.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button onClick={() => setShowReportModal(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">Đóng Preview</button>
              <button onClick={() => { alert('Đã tải xuống file CHIPSTAROT_Report_Q2.pdf thành công!'); setShowReportModal(false); }} className="px-6 py-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-colors flex items-center gap-2">
                📥 Tải xuống PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
