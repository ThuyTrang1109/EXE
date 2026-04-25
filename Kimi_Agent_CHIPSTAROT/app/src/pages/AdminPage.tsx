import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

export default function AdminPage({ setPage }: any) {
  const [tab, setTab] = useState<'dashboard' | 'products' | 'orders' | 'users' | 'reports'>('dashboard');

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
    { id: 1, name: 'Móc khóa NFC CHIPSTAROT', price: '199,000đ', stock: 45, status: 'active' },
    { id: 2, name: 'Đá Thạch Anh Tím', price: '89,000đ', stock: 12, status: 'active' },
    { id: 3, name: 'Đá Mắt Hổ', price: '79,000đ', stock: 0, status: 'out' },
    { id: 4, name: 'Đá Thạch Anh Hồng', price: '85,000đ', stock: 8, status: 'active' },
  ];

  const mockUsers = [
    { id: 'US-001', name: 'Nguyễn Văn A', email: 'nva@chipstarot.com', role: 'Admin', status: 'active', joined: '15/01/2024' },
    { id: 'US-002', name: 'Trần Thị B', email: 'ttb_khachhang@gmail.com', role: 'Customer', status: 'active', joined: '20/04/2024' },
    { id: 'US-003', name: 'Lê C', email: 'lec_spam@yahoo.com', role: 'Customer', status: 'banned', joined: '22/04/2024' },
    { id: 'US-004', name: 'Phạm D', email: 'phamd123@gmail.com', role: 'Customer', status: 'unverified', joined: '25/04/2024' },
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
    { id: 'products', label: '🛍️ Sản phẩm' },
    { id: 'orders', label: '📦 Đơn hàng' },
    { id: 'users', label: '👥 Thành viên' },
    { id: 'reports', label: '📈 Báo cáo' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-yellow-900">
      <div className="bg-white/10 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/chicken-mascot.png" alt="" className="w-8 h-8" />
          <span className="text-white font-bold text-lg">CHIPSTAROT <span className="text-yellow-400">Admin</span></span>
        </div>
        <button onClick={() => setPage('home')} className="text-white/70 hover:text-white text-sm flex items-center gap-1">← Về trang người dùng</button>
      </div>

      <div className="flex">
        <aside className="w-56 min-h-screen bg-white/5 backdrop-blur-sm border-r border-white/10 p-4 hidden md:block">
          <nav className="space-y-1 mt-4">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all text-sm ${tab === t.id ? 'bg-yellow-500 text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="md:hidden w-full fixed bottom-0 left-0 bg-purple-900/95 border-t border-white/10 flex z-40">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex-1 py-3 text-xs font-medium ${tab === t.id ? 'text-yellow-400' : 'text-white/60'}`}>
              {t.label.split(' ')[0]}
            </button>
          ))}
        </div>

        <main className="flex-1 p-6 pb-24 md:pb-6">
          {tab === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">📊 Tổng Quan Hệ Thống</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {mockStats.map(s => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
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
                      <tr key={o.id} className="border-b border-white/5 text-white/80">
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
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">🛍️ Quản Lý Sản Phẩm</h1>
                <button className="btn-3d-yellow text-sm px-5 py-2">+ Thêm sản phẩm</button>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5"><tr className="text-white/50">
                    <th className="text-left p-4">Sản phẩm</th><th className="text-left p-4">Giá</th>
                    <th className="text-left p-4">Tồn kho</th><th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Thao tác</th>
                  </tr></thead>
                  <tbody>{mockProducts.map(p => (
                    <tr key={p.id} className="border-t border-white/10 text-white/80">
                      <td className="p-4 font-medium">{p.name}</td>
                      <td className="p-4 text-yellow-400 font-semibold">{p.price}</td>
                      <td className="p-4"><span className={p.stock === 0 ? 'text-red-400' : p.stock < 10 ? 'text-yellow-400' : 'text-green-400'}>{p.stock === 0 ? 'Hết hàng' : `${p.stock} cái`}</span></td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.status === 'active' ? 'Đang bán' : 'Hết hàng'}</span></td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 rounded-lg text-xs transition-all">Sửa</button>
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
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">📦 Quản Lý Đơn Hàng</h1>
              <div className="flex gap-2 mb-6 flex-wrap">
                {['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã huỷ'].map(s => (
                  <button key={s} className="px-4 py-2 rounded-full text-sm bg-white/10 text-white/70 hover:bg-yellow-500 hover:text-white transition-all">{s}</button>
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
                    <tr key={o.id} className="border-t border-white/10 text-white/80">
                      <td className="p-4 font-mono text-yellow-400">{o.id}</td>
                      <td className="p-4">{o.customer}</td>
                      <td className="p-4">{o.product}</td>
                      <td className="p-4 font-semibold text-green-400">{o.amount}</td>
                      <td className="p-4 text-white/50">{o.date}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[o.status]}`}>{statusLabel[o.status]}</span></td>
                      <td className="p-4">
                        <select className="bg-white/10 text-white/80 border border-white/20 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-yellow-400">
                          <option value="pending">Chờ xác nhận</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="shipped">Đang giao</option>
                          <option value="delivered">Đã giao</option>
                          <option value="cancelled">Huỷ</option>
                        </select>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">👥 Quản Lý Thành Viên & Phân Quyền</h1>
                <button className="btn-3d-yellow text-sm px-5 py-2">+ Thêm tài khoản</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[{label:'Tổng tài khoản',v:'342',c:'from-purple-400 to-purple-600'},{label:'Admin/Nhân viên',v:'12',c:'from-blue-400 to-blue-600'},{label:'Bị khoá',v:'5',c:'from-red-400 to-red-600'}].map(s => (
                  <div key={s.label} className={`bg-gradient-to-br ${s.c} rounded-2xl p-5 shadow-lg border border-white/10`}>
                    <p className="text-3xl font-bold text-white">{s.v}</p>
                    <p className="text-white/80 text-sm mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5"><tr className="text-white/50">
                    <th className="text-left p-4">ID / Ngày tham gia</th>
                    <th className="text-left p-4">Thông tin (Tên & Email)</th>
                    <th className="text-left p-4">Vai trò (Role)</th>
                    <th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Thao tác</th>
                  </tr></thead>
                  <tbody>{mockUsers.map(u => (
                    <tr key={u.id} className="border-t border-white/10 text-white/80">
                      <td className="p-4">
                        <p className="font-mono text-yellow-400 font-bold">{u.id}</p>
                        <p className="text-xs text-white/50">{u.joined}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold">{u.name}</p>
                        <p className="text-xs text-white/60">{u.email}</p>
                      </td>
                      <td className="p-4">
                        <select className={`bg-white/10 border-white/20 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-yellow-400 ${u.role === 'Admin' ? 'text-purple-300 font-bold' : 'text-white/80'}`} defaultValue={u.role}>
                          <option value="Admin">Admin</option>
                          <option value="Customer">Khách hàng</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-700' : u.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {u.status === 'active' ? 'Hoạt động' : u.status === 'banned' ? 'Đã bị khoá' : 'Chưa xác minh'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 rounded-lg text-xs transition-all">Sửa</button>
                          <button className={`px-3 py-1 rounded-lg text-xs transition-all ${u.status === 'banned' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
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

          {tab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-white">📈 Phân Tích & Báo Cáo Chuyên Sâu</h1>
                <div className="flex gap-2">
                  <select className="bg-white/10 text-white/80 border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400">
                    <option value="7">7 ngày qua</option>
                    <option value="30">30 ngày qua</option>
                    <option value="180">6 tháng qua</option>
                  </select>
                  <button className="btn-3d-yellow text-sm px-5 py-2">📥 Xuất file Excel</button>
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
    </div>
  );
}
