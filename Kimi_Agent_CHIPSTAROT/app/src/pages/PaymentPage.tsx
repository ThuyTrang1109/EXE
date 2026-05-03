import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const method = searchParams.get('method') || 'momo';
  const totalStr = searchParams.get('total') || '0';
  const orderId = searchParams.get('orderId') || `CS-${Date.now().toString(36).toUpperCase()}`;
  const total = parseInt(totalStr);

  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút
  const [status, setStatus] = useState<'waiting' | 'checking' | 'success' | 'failed' | 'expired'>('waiting');
  const [copied, setCopied] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (status !== 'waiting') return;
    if (timeLeft <= 0) { setStatus('expired'); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCheckPayment = useCallback(() => {
    setStatus('checking');
    // Simulate payment verification (trong thực tế sẽ gọi API Backend)
    setTimeout(() => {
      setStatus('success');
    }, 2500);
  }, []);

  const bankInfo = {
    momo: {
      name: 'Ví MoMo',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-700',
      icon: '💜',
      accountName: 'CHIPSTAROT',
      accountNumber: '0867774023',
      qrColor: '#d946ef',
    },
    vnpay: {
      name: 'VNPay',
      color: 'from-blue-600 to-indigo-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      icon: '🔵',
      accountName: 'CHIPSTAROT JSC',
      accountNumber: '1234567890',
      qrColor: '#2563eb',
    },
    cod: {
      name: 'Tiền mặt (COD)',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: '💵',
      accountName: '',
      accountNumber: '',
      qrColor: '#16a34a',
    },
  };

  const info = bankInfo[method as keyof typeof bankInfo] || bankInfo.momo;
  const transferContent = `CHIPSTAROT ${orderId}`;

  // ── Success Screen ────────────────────────────────────────────
  if (status === 'success') return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-2">Thanh toán thành công!</h2>
        <p className="text-gray-500 mb-1">Mã đơn hàng: <span className="font-bold text-yellow-600">{orderId}</span></p>
        <p className="text-gray-500 mb-6">Số tiền: <span className="font-black text-2xl text-green-600">{total.toLocaleString()}đ</span></p>
        <div className="bg-gradient-to-r from-purple-50 to-yellow-50 rounded-2xl p-5 mb-8 border border-purple-100">
          <p className="text-sm text-purple-700 font-medium">🔮 Credits đã được cộng vào tài khoản của bạn!</p>
          <p className="text-xs text-gray-400 mt-1">Chúng tôi sẽ xác nhận qua email và SMS trong vài phút</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-3d-yellow w-full mb-3">🏠 Về Trang Chủ</button>
        <button onClick={() => navigate('/profile')} className="w-full py-3 text-purple-600 font-semibold hover:underline text-sm">
          👤 Xem hồ sơ & lịch sử →
        </button>
      </div>
    </div>
  );

  // ── Expired Screen ────────────────────────────────────────────
  if (status === 'expired') return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="text-7xl mb-4">⏰</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Phiên thanh toán hết hạn</h2>
        <p className="text-gray-500 mb-6">QR code đã hết hiệu lực. Vui lòng tạo đơn hàng mới.</p>
        <button onClick={() => navigate('/cart')} className="btn-3d-yellow w-full">🛒 Quay lại giỏ hàng</button>
      </div>
    </div>
  );

  // ── COD Screen ────────────────────────────────────────────────
  if (method === 'cod') return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-7xl mb-6 animate-bounce">📦</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 mb-6">Bạn chọn thanh toán <strong>Tiền mặt khi nhận hàng (COD)</strong>.</p>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-left space-y-2">
          <p className="text-sm text-green-800">✅ Mã đơn: <span className="font-bold">{orderId}</span></p>
          <p className="text-sm text-green-800">💰 Tổng thanh toán khi nhận: <span className="font-bold text-lg">{total.toLocaleString()}đ</span></p>
          <p className="text-sm text-green-800">🚚 Chúng tôi sẽ gọi xác nhận trước khi giao</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-3d-yellow w-full mb-3">🏠 Về Trang Chủ</button>
      </div>
    </div>
  );

  // ── QR Payment Screen (MoMo / VNPay) ─────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 py-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <button onClick={() => navigate('/checkout')} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm mx-auto mb-4">
            ← Quay lại
          </button>
          <h1 className="text-2xl font-black text-gray-800">Thanh Toán {info.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Quét QR hoặc chuyển khoản thủ công</p>
        </div>

        {/* Timer Banner */}
        <div className={`${timeLeft < 120 ? 'bg-red-500' : 'bg-gray-800'} text-white rounded-2xl px-6 py-3 flex items-center justify-between mb-6 transition-colors`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className={`w-2 h-2 rounded-full ${timeLeft < 120 ? 'bg-white animate-pulse' : 'bg-green-400'}`} />
            {timeLeft < 120 ? '⚠️ Sắp hết hạn!' : 'Đang chờ thanh toán...'}
          </div>
          <div className={`font-mono text-2xl font-black ${timeLeft < 120 ? 'text-yellow-300' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          {/* Gradient header */}
          <div className={`bg-gradient-to-r ${info.color} p-6 text-white text-center`}>
            <p className="text-white/80 text-sm mb-1">Tổng thanh toán</p>
            <p className="text-4xl font-black">{total.toLocaleString()}đ</p>
            <p className="text-white/70 text-xs mt-1">Mã đơn: {orderId}</p>
          </div>

          {/* QR Code */}
          <div className="p-6 flex flex-col items-center border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-600 mb-4">Quét mã QR để thanh toán</p>
            {/* QR Code giả lập - trong thực tế tích hợp API của MoMo/VNPay */}
            <div className="w-52 h-52 bg-white border-4 border-gray-100 rounded-2xl shadow-inner flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-8 gap-0.5 p-3 opacity-90">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="rounded-sm" style={{
                    backgroundColor: [0,3,7,14,18,21,25,28,35,42,49,56,1,6,8,13,20,27,34,41,48,55,2,5,9,12,19,26,33,40,47,54,4,10,11,16,17,22,23,24,29,30,31,36,37,38,43,44,45,50,51,52].includes(i) ? '#1a1a2e' : 'transparent'
                  }} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-xl p-2 shadow-lg">
                  <div className="text-3xl">{info.icon}</div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center max-w-[200px]">
              Mở app {info.name} → Quét QR → Xác nhận thanh toán
            </p>
          </div>

          {/* Manual transfer info */}
          <div className={`p-6 ${info.bgColor}`}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Hoặc chuyển khoản thủ công</p>
            <div className="space-y-3">
              <div className={`flex justify-between items-center bg-white rounded-xl px-4 py-3 border ${info.borderColor}`}>
                <div>
                  <p className="text-xs text-gray-400">Số tài khoản / SĐT</p>
                  <p className={`font-bold text-lg ${info.textColor}`}>{info.accountNumber}</p>
                </div>
                <button onClick={() => handleCopy(info.accountNumber)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg ${info.bgColor} ${info.textColor} border ${info.borderColor} hover:opacity-80 transition-all`}>
                  {copied ? '✅ Đã copy' : 'Sao chép'}
                </button>
              </div>

              <div className={`flex justify-between items-center bg-white rounded-xl px-4 py-3 border ${info.borderColor}`}>
                <div>
                  <p className="text-xs text-gray-400">Chủ tài khoản</p>
                  <p className="font-bold text-gray-800">{info.accountName}</p>
                </div>
              </div>

              <div className={`flex justify-between items-center bg-white rounded-xl px-4 py-3 border ${info.borderColor}`}>
                <div>
                  <p className="text-xs text-gray-400">Số tiền</p>
                  <p className="font-bold text-gray-800">{total.toLocaleString()}đ</p>
                </div>
                <button onClick={() => handleCopy(total.toString())}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg ${info.bgColor} ${info.textColor} border ${info.borderColor} hover:opacity-80 transition-all`}>
                  Sao chép
                </button>
              </div>

              <div className={`flex justify-between items-center bg-yellow-50 rounded-xl px-4 py-3 border border-yellow-200`}>
                <div>
                  <p className="text-xs text-gray-400">Nội dung chuyển khoản</p>
                  <p className="font-bold text-yellow-700">{transferContent}</p>
                </div>
                <button onClick={() => handleCopy(transferContent)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 border border-yellow-200 hover:opacity-80 transition-all">
                  Sao chép
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCheckPayment}
          disabled={status === 'checking'}
          className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
        >
          {status === 'checking' ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Đang xác nhận thanh toán...
            </span>
          ) : '✅ Tôi đã chuyển khoản xong'}
        </button>

        <p className="text-center text-xs text-gray-400 leading-relaxed">
          🔒 Giao dịch được bảo mật bằng mã hóa SSL.<br/>
          Nếu gặp vấn đề, liên hệ: <span className="text-purple-600 font-medium">0867 774 023</span>
        </p>
      </div>
    </div>
  );
}
