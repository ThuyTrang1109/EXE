import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';

type AuthMode = 'login' | 'register' | 'forgot' | 'verify';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Mouse tracking for glowing orb
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ── Validation ──
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

    try {
      if (mode === 'login') {
        const err = await login(email, password);
        if (err) {
          setError(err);
        } else {
          // Redirect Admin → /admin, Customer → /
          const saved = localStorage.getItem('chipstarot_demo_user');
          const savedUser = saved ? JSON.parse(saved) : null;
          if (savedUser?.role_id === 1) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }

      } else if (mode === 'register') {
        const err = await register(email, password, name);
        if (err) {
          setError(err);
        } else {
          if (isSupabaseConfigured) {
            setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
            setMode('verify');
          } else {
            // Demo mode
            setMode('verify');
          }
        }

      } else if (mode === 'forgot') {
        if (!isSupabaseConfigured) {
          setMode('verify');
        } else {
          const { supabase } = await import('@/lib/supabase');
          const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth`,
          });
          if (resetErr) {
            setError(resetErr.message);
          } else {
            setSuccess('Đã gửi email khôi phục! Vui lòng kiểm tra hộp thư của bạn.');
            setMode('verify');
          }
        }

      } else if (mode === 'verify') {
        if (!isSupabaseConfigured) {
          // Demo OTP
          if (otp !== '123456') {
            setError('Mã xác thực không hợp lệ! (Demo: nhập 123456)');
          } else {
            const err = await login(email, password || 'demo_pass');
            if (!err) navigate('/');
          }
        } else {
          // Real OTP via Supabase
          const { supabase } = await import('@/lib/supabase');
          const { error: verifyErr } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
          });
          if (verifyErr) {
            setError('Mã xác thực không hợp lệ hoặc đã hết hạn!');
          } else {
            navigate('/');
          }
        }
      }
    } catch (ex) {
      setError('Đã có lỗi xảy ra, vui lòng thử lại.');
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm group-hover/input:border-white/20 relative z-10';

  // Dynamic content based on auth mode
  const getDynamicContent = () => {
    switch (mode) {
      case 'register':
        return {
          icon: '📜',
          title: 'Khế Ước Vì Sao',
          desc: 'Trở thành một phần của vũ trụ. Mở khóa những thông điệp bí ẩn được sắp đặt riêng cho linh hồn bạn.',
          orbColor: 'bg-yellow-500/20'
        };
      case 'forgot':
        return {
          icon: '🕯️',
          title: 'Ánh Sáng Dẫn Lối',
          desc: 'Lạc bước trong màn đêm? Đừng lo, các vì sao sẽ gửi ánh sáng để dẫn đường bạn trở về.',
          orbColor: 'bg-blue-500/20'
        };
      case 'verify':
        return {
          icon: '👁️',
          title: 'Nghi Thức Dấu Ấn',
          desc: 'Kết nối linh hồn đã sẵn sàng. Hãy nhập dấu ấn gồm 6 ký tự từ các vì sao để hoàn tất nghi thức.',
          orbColor: 'bg-cyan-500/20'
        };
      case 'login':
      default:
        return {
          icon: '🔮',
          title: 'Vũ Trụ Gọi Tên',
          desc: 'Nhấc bức màn sương mù của định mệnh. Những thông điệp từ các vì sao đang chờ đón bạn.',
          orbColor: 'bg-purple-500/20'
        };
    }
  };

  const currentContent = getDynamicContent();

  return (
    <div className="min-h-[85vh] bg-[#030008] flex items-center justify-center p-4 py-12 relative overflow-hidden font-sans">
      
      {/* Interactive Mouse Glow Orb */}
      <div 
        className={`fixed w-96 h-96 ${currentContent.orbColor} rounded-full pointer-events-none filter blur-[80px] z-0 transition-all duration-1000 ease-in-out`}
        style={{
          transform: `translate(${mousePos.x - 192}px, ${mousePos.y - 192}px)`,
          opacity: mousePos.x > 0 ? 1 : 0
        }}
      />

      {/* Dynamic Background with Hue Shift */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-900/30 rounded-full mix-blend-screen animate-hue-shift" />
        <div className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-indigo-900/30 rounded-full mix-blend-screen animate-hue-shift" style={{ animationDelay: '-5s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] bg-yellow-900/20 rounded-full mix-blend-screen animate-hue-shift" style={{ animationDelay: '-10s' }} />
        
        {/* Fog Overlay */}
        <div className="absolute inset-0 w-[200%] h-full opacity-30 mix-blend-screen animate-fog-drift" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-scales.png")' }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
      </div>

      {/* Astrological / Tarot background wheel */}
      <div className="absolute top-1/2 left-1/2 w-[90vw] max-w-[1000px] aspect-square opacity-[0.05] pointer-events-none animate-spin-slow origin-center z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full text-yellow-200 fill-current">
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/>
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3"/>
          <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="0.2"/>
          {[...Array(24)].map((_, i) => (
            <line key={i} x1="50" y1="50" x2="50" y2="2" transform={`rotate(${i * 15} 50 50)`} stroke="currentColor" strokeWidth={i % 2 === 0 ? "0.3" : "0.1"} strokeDasharray={i % 2 === 0 ? "none" : "1 1"}/>
          ))}
          {/* Hexagram */}
          <polygon points="50,15 80,67 20,67" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1"/>
          <polygon points="50,85 80,33 20,33" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1"/>
        </svg>
      </div>

      {/* Magical floating dust particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-yellow-300 rounded-full animate-magic-dust"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              opacity: 0,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(253,224,71,0.8)`
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl w-full mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* Left Side: Graphic / Branding */}
        <div className="hidden lg:flex flex-1 flex-col justify-center items-start text-white space-y-8 relative">
          
          <div className="inline-flex items-center justify-center p-6 bg-white/[0.02] backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.1)] mb-2 animate-float relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-purple-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-150"></div>
            <span className="text-7xl filter drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] relative z-10 animate-pulse transition-all duration-500 ease-in-out">{currentContent.icon}</span>
            
            {/* Orbiting rings */}
            <div className="absolute inset-[-20%] border border-white/5 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-[-40%] border border-white/5 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '40s' }}></div>
          </div>
          
          <div className="animate-fade-in" key={mode}>
            <h1 className="text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600 animate-text-shimmer drop-shadow-[0_0_15px_rgba(250,204,21,0.3)] mb-8">
              {currentContent.title}
            </h1>
            
            <p className="text-2xl text-white/70 leading-relaxed max-w-lg font-light">
              {currentContent.desc}
            </p>
          </div>
          
          <div className="flex gap-6 mt-10">
            {[
              { icon: '✨', label: 'Trực Giác', color: 'hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:text-yellow-200' },
              { icon: '🌙', label: 'Tâm Linh', color: 'hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:text-purple-200' },
              { icon: '⭐', label: 'Định Hướng', color: 'hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:text-yellow-200' }
            ].map((item, idx) => (
              <div key={idx} className={`flex flex-col items-center justify-center bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 w-32 transition-all duration-500 cursor-default group hover:-translate-y-3 ${item.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-700 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] relative z-10">{item.icon}</span>
                <span className="text-sm text-white/70 font-medium transition-colors relative z-10">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 w-full max-w-md lg:max-w-lg relative group/form">
          
          {/* Energy Shield Border Animation */}
          <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-yellow-400 to-pink-500 rounded-[2.5rem] opacity-0 group-hover/form:opacity-100 transition-opacity duration-1000 overflow-hidden pointer-events-none blur-[2px]">
            <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-spin-gradient"></div>
          </div>
          
          {/* Form Container */}
          <div className="bg-black/60 backdrop-blur-[40px] rounded-[2.5rem] border border-white/10 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden animate-mystic-pulse z-10 min-h-[500px] flex flex-col justify-center transition-all duration-500">
            
            {/* Form Inner Glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="text-center mb-12 relative z-10">
              <div className="lg:hidden w-24 h-24 bg-white/5 border border-white/10 rounded-3xl mx-auto flex items-center justify-center text-5xl shadow-2xl mb-6 backdrop-blur-xl relative transition-all duration-500">
                <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full animate-pulse"></div>
                <span className="relative z-10 filter drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]">{currentContent.icon}</span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-3 drop-shadow-md">
                {mode === 'login' && 'Cánh Cửa Mở'}
                {mode === 'register' && 'Khởi Trình Mới'}
                {mode === 'forgot' && 'Tìm Lại Nguồn Sáng'}
                {mode === 'verify' && 'Dấu Ấn Xác Thực'}
              </h2>
              <p className="text-white/60 text-base font-light">
                {mode === 'login' && 'Bước qua màn đêm để tiếp tục hành trình'}
                {mode === 'register' && 'Tạo liên kết linh hồn để nhận trải bài'}
                {mode === 'forgot' && 'Nhập email để nhận mã khôi phục từ các vì sao'}
                {mode === 'verify' && 'Điền 6 ký tự huyền bí từ hòm thư của bạn'}
              </p>
              
              {!isSupabaseConfigured && mode === 'login' && (
                <div className="mt-5 space-y-2">
                  <p className="text-white/40 text-xs uppercase tracking-widest text-center">Tài khoản demo</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setEmail('admin@chipstarot.com'); setPassword('admin123'); setError(''); }}
                      className="flex flex-col items-center gap-1 px-3 py-3 bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 hover:border-purple-400/60 rounded-xl text-xs transition-all group"
                    >
                      <span className="text-lg">👑</span>
                      <span className="text-purple-300 font-bold">Admin</span>
                      <span className="text-white/40 font-mono text-[10px]">admin@chipstarot.com</span>
                      <span className="text-xs text-purple-400/80 mt-1 group-hover:text-purple-300 transition-colors">→ Click để điền</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmail('demo@chipstarot.com'); setPassword('123456'); setError(''); }}
                      className="flex flex-col items-center gap-1 px-3 py-3 bg-yellow-500/10 hover:bg-yellow-500/25 border border-yellow-500/30 hover:border-yellow-400/60 rounded-xl text-xs transition-all group"
                    >
                      <span className="text-lg">👤</span>
                      <span className="text-yellow-300 font-bold">Customer</span>
                      <span className="text-white/40 font-mono text-[10px]">demo@chipstarot.com</span>
                      <span className="text-xs text-yellow-400/80 mt-1 group-hover:text-yellow-300 transition-colors">→ Click để điền</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error / Success banners */}
            <div className="relative z-10">
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm mb-6 text-center animate-fade-in flex items-center justify-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <span className="drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">⚠️</span> {error}
                </div>
              )}
              {success && (
                <div className="bg-green-900/30 border border-green-500/50 text-green-200 p-4 rounded-xl text-sm mb-6 text-center animate-fade-in flex items-center justify-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <span className="drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]">✨</span> {success}
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {mode === 'register' && (
                <div className="space-y-2 group/input relative animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.2em] pl-1 group-focus-within/input:text-yellow-400 transition-colors duration-500">Họ và tên</label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    maxLength={100}
                    className={inputClass}
                    placeholder="VD: Kẻ Lữ Hành"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-yellow-500 to-purple-500 w-0 group-focus-within/input:w-full transition-all duration-700 ease-out rounded-b-xl shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
                </div>
              )}

              {mode !== 'verify' && (
                <div className="space-y-2 group/input relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.2em] pl-1 group-focus-within/input:text-yellow-400 transition-colors duration-500">Email</label>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    maxLength={255}
                    className={inputClass}
                    placeholder="linhhon@vutru.com"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-yellow-500 to-purple-500 w-0 group-focus-within/input:w-full transition-all duration-700 ease-out rounded-b-xl shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
                </div>
              )}

              {(mode === 'login' || mode === 'register') && (
                <div className="space-y-6">
                  <div className="space-y-2 group/input relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex justify-between items-center pl-1">
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.2em] group-focus-within/input:text-yellow-400 transition-colors duration-500">Mật khẩu</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-xs font-medium text-yellow-400/70 hover:text-yellow-300 transition-all hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                        >
                          Quên mật khẩu?
                        </button>
                      )}
                    </div>
                    <input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="••••••••"
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-yellow-500 to-purple-500 w-0 group-focus-within/input:w-full transition-all duration-700 ease-out rounded-b-xl shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-2 group/input relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.2em] pl-1 group-focus-within/input:text-yellow-400 transition-colors duration-500">Xác nhận chìa khóa</label>
                      <input
                        id="auth-confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        className={inputClass}
                        placeholder="••••••••"
                      />
                      <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-yellow-500 to-purple-500 w-0 group-focus-within/input:w-full transition-all duration-700 ease-out rounded-b-xl shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
                    </div>
                  )}
                </div>
              )}

              {mode === 'verify' && (
                <div className="space-y-2 group/input relative animate-fade-in">
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.2em] pl-1 text-center group-focus-within/input:text-yellow-400 transition-colors duration-500">Mã Dấu Ấn (OTP)</label>
                  <input
                    id="auth-otp"
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className={`${inputClass} text-center tracking-[1em] text-4xl font-light h-24 shadow-inner bg-black/40`}
                    placeholder="------"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-yellow-500 to-purple-500 w-0 group-focus-within/input:w-full transition-all duration-700 ease-out rounded-b-xl shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
                </div>
              )}

              <button
                id="auth-submit"
                type="submit"
                disabled={loading}
                className="w-full mt-10 py-4 px-6 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 text-lg font-bold rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.7)] transition-all duration-500 transform hover:-translate-y-1 active:translate-y-0 flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group/btn animate-fade-in"
                style={{ animationDelay: mode === 'register' ? '0.5s' : '0.4s' }}
              >
                {/* Glowing light sweep over button */}
                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                
                {loading ? (
                  <svg className="animate-spin h-6 w-6 text-yellow-950 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : null}
                <span className="relative z-10 tracking-widest uppercase">
                  {loading
                    ? 'Đang kết nối...'
                    : mode === 'login' ? 'Tiến Vào'
                    : mode === 'register' ? 'Gia Nhập'
                    : mode === 'forgot' ? 'Triệu Hồi Ánh Sáng'
                    : 'Kích Hoạt Dấu Ấn'}
                </span>
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-10 pt-8 border-t border-white/10 text-center text-sm text-white/50 relative z-10 font-light animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {mode === 'login' ? (
                <p>
                  Chưa từng bước qua?{' '}
                  <button onClick={() => { setMode('register'); setError(''); }} className="text-yellow-400 font-bold hover:text-yellow-300 hover:underline transition-all hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] tracking-wider">
                    Bắt đầu hành trình
                  </button>
                </p>
              ) : mode === 'register' ? (
                <p>
                  Đã là một lữ khách?{' '}
                  <button onClick={() => { setMode('login'); setError(''); }} className="text-yellow-400 font-bold hover:text-yellow-300 hover:underline transition-all hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] tracking-wider">
                    Quay về
                  </button>
                </p>
              ) : (
                <button
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  className="text-white/60 font-medium hover:text-white transition-all flex items-center justify-center gap-3 mx-auto hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] tracking-widest uppercase text-xs"
                >
                  <span className="text-xl">←</span> Quay lại
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
