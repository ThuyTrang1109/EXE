import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VIETNAM_ADDRESS_DATA } from '../data/addressData';

export default function CheckoutPage({ cart, total }: any) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '', method: 'momo' });
  const [error, setError] = useState('');

  // Address State
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');

  useEffect(() => {
    if (province === 'Khác') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(prev => ({ ...prev, address: street }));
    } else {
      const fullAddress = [street, ward, district, province].filter(Boolean).join(', ');
      setForm(prev => ({ ...prev, address: fullAddress }));
    }
  }, [province, district, ward, street]);

  const handleOrder = () => {
    if (!form.name || !form.phone) {
      setError('Vui lòng điền họ tên và số điện thoại!');
      return;
    }

    // Validate số điện thoại Việt Nam cơ bản
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(form.phone.replace(/\s+/g, ''))) {
      setError('Số điện thoại không hợp lệ (Vui lòng nhập đúng định dạng SĐT Việt Nam)!');
      return;
    }

    if (province === 'Khác') {
      if (!street.trim()) {
        setError('Vui lòng nhập địa chỉ chi tiết!');
        return;
      }
    } else {
      if (!province || !district || !ward || !street.trim()) {
        setError('Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã và nhập số nhà!');
        return;
      }
    }

    setError('');
    // Navigate sang trang Payment với thông tin đơn hàng
    const orderId = `CS-${Date.now().toString(36).toUpperCase()}`;
    navigate(`/payment?method=${form.method}&total=${total}&orderId=${orderId}`);
  };


  const selectedProvData = VIETNAM_ADDRESS_DATA.find(p => p.name === province);
  const selectedDistData = selectedProvData?.districts.find(d => d.name === district);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/cart')} className="text-gray-500 hover:text-yellow-600 flex items-center gap-2 mb-6 text-sm">← Quay lại giỏ hàng</button>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🔐 Thanh Toán</h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">📦 Đơn hàng của bạn</h2>
          {cart.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700">{item.name} <span className="text-gray-400">x{item.qty}</span></span>
              <span className="font-semibold text-gray-800">{(item.price * item.qty).toLocaleString()}đ</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-1">
            <span className="font-bold text-gray-800">Tổng cộng</span>
            <span className="text-xl font-bold text-red-500">{total.toLocaleString()}đ</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">📋 Thông tin giao hàng</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Họ và Tên *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nguyễn Lan Anh"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="0867 774 023"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 text-gray-800"
              />
            </div>
            
            {/* Address Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tỉnh/Thành phố *</label>
                <select
                  value={province}
                  onChange={e => { setProvince(e.target.value); setDistrict(''); setWard(''); }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 text-gray-800"
                >
                  <option value="">-- Chọn --</option>
                  {VIETNAM_ADDRESS_DATA.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  <option value="Khác">Khác</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Quận/Huyện *</label>
                <select
                  value={district}
                  onChange={e => { setDistrict(e.target.value); setWard(''); }}
                  disabled={!province || province === 'Khác'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">-- Chọn --</option>
                  {selectedProvData?.districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phường/Xã *</label>
                <select
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  disabled={!district}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">-- Chọn --</option>
                  {selectedDistData?.wards.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {province === 'Khác' ? 'Địa chỉ chi tiết *' : 'Số nhà, tên đường *'}
              </label>
              <input
                type="text"
                value={street}
                onChange={e => setStreet(e.target.value)}
                placeholder={province === 'Khác' ? 'Số nhà, đường, phường, quận, tỉnh...' : 'Số nhà, tên đường...'}
                disabled={!province}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ghi chú (tuỳ chọn)</label>
              <input
                type="text"
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                placeholder="Giao giờ hành chính, gọi trước khi giao..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 text-gray-800"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">💳 Phương thức thanh toán</h2>
          <div className="space-y-3">
            {[
              { id: 'momo', label: '💜 MoMo', desc: 'Thanh toán qua ví MoMo' },
              { id: 'vnpay', label: '🔵 VNPay', desc: 'Thanh toán qua cổng VNPay' },
              { id: 'cod', label: '💵 Tiền mặt (COD)', desc: 'Trả khi nhận hàng' },
            ].map(m => (
              <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.method === m.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-yellow-200'}`}>
                <input type="radio" name="method" value={m.id} checked={form.method === m.id} onChange={() => setForm({ ...form, method: m.id })} className="w-4 h-4 accent-yellow-500" />
                <div>
                  <p className="font-semibold text-gray-800">{m.label}</p>
                  <p className="text-xs text-gray-400">{m.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm font-medium mb-4 text-center bg-red-50 py-2 rounded-lg">{error}</p>}
        <button onClick={handleOrder} className="btn-3d-yellow w-full text-lg">✨ Xác Nhận Đặt Hàng</button>
      </div>
    </div>
  );
}
