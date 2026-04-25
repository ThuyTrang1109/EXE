import { useState } from 'react';

type AuthMode = 'login' | 'register' | 'forgot' | 'verify';

export default function AuthPage({ setUser, setCredits, setPage }: any) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Detailed Validations
    if (mode !== 'verify') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return setError('Email không đúng định dạng!');
    }

    if (mode === 'register') {
      if (name.trim().length < 2) return setError('Tên phải có ít nhất 2 ký tự!');
      if (password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự!');
      if (password !== confirmPassword) return setError('Mật khẩu xác nhận không khớp!');
    }

    if (mode === 'login' && password.length < 6) {
      return setError('Mật khẩu phải có ít nhất 6 ký tự!');
    }

    if (mode === 'verify' && !/^\d{6}$/.test(otp)) {
      return setError('Mã OTP phải bao gồm đúng 6 chữ số!');
    }

    setLoading(true);

    // Giả lập gọi API
    setTimeout(() => {
      setLoading(false);
      if (mode === 'login') {
        if (email === 'demo@chipstarot.com' && password === '123456') {
          setUser({ name: 'Tarot Lover', email });
          setCredits(3);
          setPage('home');
        } else {
          setError('Email hoặc mật khẩu không chính xác! (Dùng: demo@chipstarot.com / 123456)');
        }
      } else if (mode === 'register') {
        if (!email || !password || !name) setError('Vui lòng điền đầy đủ thông tin!');
        else setMode('verify');
      } else if (mode === 'forgot') {
        if (!email) setError('Vui lòng nhập email!');
        else setMode('verify');
      } else if (mode === 'verify') {
        if (otp !== '123456') setError('Mã xác thực không hợp lệ! (Nhập: 123456)');
        else {
          setUser({ name: name || 'Người dùng mới', email });
          setCredits(3);
          setPage('home');
        }
      }
    }, 1000);
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-purple-900 via-purple-800 to-yellow-900 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 max-w-md w-full shadow-2xl relative z-10 text-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg mb-4">🔮</div>
          <h1 className="text-2xl font-bold tracking-wider">
            {mode === 'login' && 'ĐĂNG NHẬP'}
            {mode === 'register' && 'TẠO TÀI KHOẢN'}
            {mode === 'forgot' && 'KHÔI PHỤC MẬT KHẨU'}
            {mode === 'verify' && 'XÁC THỰC EMAIL'}
          </h1>
          <p className="text-white/60 text-sm mt-2">
            {mode === 'login' && 'Chào mừng trở lại với vũ trụ CHIPSTAROT'}
            {mode === 'register' && 'Tham gia cùng hàng ngàn Reader khác'}
            {mode === 'forgot' && 'Chúng tôi sẽ gửi mã khôi phục đến email của bạn'}
            {mode === 'verify' && 'Vui lòng nhập mã gồm 6 chữ số đã được gửi tới email'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Họ và tên</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required maxLength={100}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="Nhập họ tên của bạn" />
            </div>
          )}

          {mode !== 'verify' && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={255}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="Nhập địa chỉ email" />
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-white/80">Mật khẩu</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs text-yellow-400 hover:text-yellow-300">Quên mật khẩu?</button>
                  )}
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu (Ít nhất 6 ký tự)" />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Xác nhận mật khẩu</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    placeholder="Nhập lại mật khẩu" />
                </div>
              )}
            </div>
          )}

          {mode === 'verify' && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Mã xác thực (OTP)</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-center tracking-[0.5em] text-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="••••••" />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-3d-yellow w-full mt-6 flex justify-center items-center">
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : mode === 'login' ? 'Đăng Nhập'
              : mode === 'register' ? 'Đăng Ký'
              : mode === 'forgot' ? 'Gửi Mã Khôi Phục'
              : 'Xác Nhận'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-white/60">
          {mode === 'login' ? (
            <p>Chưa có tài khoản? <button onClick={() => setMode('register')} className="text-yellow-400 font-bold hover:underline">Đăng ký ngay</button></p>
          ) : mode === 'register' ? (
            <p>Đã có tài khoản? <button onClick={() => setMode('login')} className="text-yellow-400 font-bold hover:underline">Đăng nhập</button></p>
          ) : (
            <button onClick={() => setMode('login')} className="text-white/80 font-medium hover:text-white hover:underline">← Quay lại đăng nhập</button>
          )}
        </div>
      </div>
    </div>
  );
}
