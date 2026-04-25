import { useState } from 'react';

export default function CheckoutPage({ cart, total, setPage }: any) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '', method: 'momo' });
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [error, setError] = useState('');

  const handleOrder = () => {
    if (!form.name || !form.phone || !form.address) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng (Họ tên, SĐT, Địa chỉ)!');
      return;
    }
    setError('');
    setStep('success');
  };

  if (step === 'success') return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-7xl mb-4 animate-float">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 mb-2">Cảm ơn <span className="font-bold text-yellow-600">{form.name}</span> đã tin tưởng CHIPSTAROT 💛</p>
        <p className="text-sm text-gray-400 mb-6">Chúng tôi sẽ liên hệ qua SĐT <b>{form.phone}</b> để xác nhận đơn.</p>
        <div className="bg-yellow-50 rounded-xl p-4 mb-6 text-left text-sm space-y-1">
          <p><span className="font-semibold">📦 Giao tới:</span> {form.address}</p>
          <p><span className="font-semibold">💳 Thanh toán:</span> {form.method === 'momo' ? 'MoMo' : form.method === 'vnpay' ? 'VNPay' : 'Tiền mặt (COD)'}</p>
          <p><span className="font-semibold">💰 Tổng tiền:</span> <span className="text-red-500 font-bold">{total.toLocaleString()}đ</span></p>
        </div>
        <button onClick={() => setPage('home')} className="btn-3d-yellow w-full">🏠 Về Trang Chủ</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setPage('cart')} className="text-gray-500 hover:text-yellow-600 flex items-center gap-2 mb-6 text-sm">← Quay lại giỏ hàng</button>
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
            {[
              { key: 'name', label: 'Họ và Tên *', placeholder: 'Nguyễn Lan Anh', type: 'text' },
              { key: 'phone', label: 'Số điện thoại *', placeholder: '0867 774 023', type: 'tel' },
              { key: 'address', label: 'Địa chỉ giao hàng *', placeholder: 'Số nhà, đường, phường, quận, thành phố', type: 'text' },
              { key: 'note', label: 'Ghi chú (tuỳ chọn)', placeholder: 'Giao giờ hành chính, gọi trước khi giao...', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-600 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 text-gray-800"
                />
              </div>
            ))}
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
