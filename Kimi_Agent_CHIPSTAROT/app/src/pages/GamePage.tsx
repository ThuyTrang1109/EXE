import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LEVELS = [
  { maxExp: 20, name: 'Quả Trứng Huyền Bí', emoji: '🥚', desc: 'Đang ấp ủ năng lượng từ các vì sao...', size: 'text-8xl' },
  { maxExp: 50, name: 'Gà Con Tập Sự', emoji: '🐣', desc: 'Mới nở, cực kỳ ham ăn và cần sự chăm sóc.', size: 'text-8xl' },
  { maxExp: 100, name: 'Gà Tarot Cập Cấp', emoji: '🐓', desc: 'Đã trưởng thành và bắt đầu cảm nhận được năng lượng Tarot.', size: 'text-9xl' },
  { maxExp: Infinity, name: 'Gà Thần Vũ Trụ', emoji: '✨🐔✨', desc: 'Đã tiến hóa hoàn toàn! Sẵn sàng ban phát phước lành.', size: 'text-9xl drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]' },
];

export default function GamePage() {
  const navigate = useNavigate();
  const [exp, setExp] = useState(() => parseInt(localStorage.getItem('chipstarot_chicken_exp') || '0'));
  const [food, setFood] = useState(() => parseInt(localStorage.getItem('chipstarot_chicken_food') || '0'));
  const [isFeeding, setIsFeeding] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const saveState = (newExp: number, newFood: number) => {
    localStorage.setItem('chipstarot_chicken_exp', newExp.toString());
    localStorage.setItem('chipstarot_chicken_food', newFood.toString());
    setExp(newExp);
    setFood(newFood);
  };

  const getLevelInfo = (currentExp: number) => {
    for (let i = 0; i < LEVELS.length; i++) {
      if (currentExp < LEVELS[i].maxExp) return { level: i, ...LEVELS[i] };
    }
    return { level: 3, ...LEVELS[3] };
  };

  const currentInfo = getLevelInfo(exp);
  const prevMaxExp = currentInfo.level === 0 ? 0 : LEVELS[currentInfo.level - 1].maxExp;
  const targetExp = currentInfo.maxExp === Infinity ? exp : currentInfo.maxExp;
  const progressPercent = currentInfo.level === 3 ? 100 : ((exp - prevMaxExp) / (targetExp - prevMaxExp)) * 100;

  const handleFeed = () => {
    if (food <= 0) return;

    setIsFeeding(true);
    setTimeout(() => setIsFeeding(false), 500);

    const newExp = exp + 10;
    saveState(newExp, food - 1);
  };

  return (
    <div className="min-h-screen bg-[#0d0029] py-12 px-4 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-yellow-400 animate-pulse"
            style={{
              width: `${((i * 3 + 1) % 3) + 1}px`,
              height: `${((i * 3 + 1) % 3) + 1}px`,
              left: `${(i * 13.7) % 100}%`,
              top: `${(i * 23.3) % 100}%`,
              animationDelay: `${(i * 0.5) % 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-900/50 text-yellow-400 text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-purple-700/50">
            🎮 Nuôi Thú Ảo
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Khu Vườn Phép Thuật</h1>
          <p className="text-purple-200">Cho linh thú ăn bằng cách xem Tarot để nhận quà tặng đặc biệt!</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl relative overflow-hidden">
          {/* Status Bar */}
          <div className="flex justify-between items-center bg-black/30 rounded-2xl p-4 mb-8">
            <div>
              <p className="text-purple-300 text-xs font-bold mb-1 uppercase tracking-wider">Lương Thực</p>
              <p className="text-2xl font-black text-white flex items-center gap-2">
                <span>🍗</span> {food} <span className="text-sm font-normal text-purple-200">phần</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-300 text-xs font-bold mb-1 uppercase tracking-wider">Cấp Độ {currentInfo.level + 1}</p>
              <p className="text-lg font-bold text-yellow-400">{currentInfo.name}</p>
            </div>
          </div>

          {/* Pet Character */}
          <div className="h-64 flex flex-col items-center justify-center relative my-8">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl transition-all duration-1000 ${currentInfo.level === 3 ? 'w-64 h-64 bg-yellow-400/30' : ''}`} />

            <div className={`transition-transform duration-300 ${isFeeding ? 'scale-125 -translate-y-4' : 'scale-100 animate-bounce-slow'} ${currentInfo.size}`}>
              {currentInfo.emoji}
            </div>

            {isFeeding && (
              <div className="absolute top-10 right-1/4 text-2xl animate-ping">💖</div>
            )}

            <p className="mt-8 text-center text-purple-200 max-w-sm relative z-10 italic">
              "{currentInfo.desc}"
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-bold text-purple-300 mb-2">
              <span>EXP: {exp}</span>
              {currentInfo.level < 3 ? <span>Cần đạt: {targetExp}</span> : <span>MAX LEVEL</span>}
            </div>
            <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-500 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_1s_linear_infinite]" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleFeed}
              disabled={food <= 0 || currentInfo.level === 3}
              className={`py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${food > 0 && currentInfo.level < 3
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white hover:scale-105 shadow-lg shadow-green-500/30 cursor-pointer'
                  : 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                }`}
            >
              🍗 Cho ăn (-1 Thức ăn)
            </button>

            {currentInfo.level === 3 ? (
              <button
                onClick={() => setShowRewardModal(true)}
                className="py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:scale-105 shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 animate-pulse"
              >
                🎁 Mở Quà Tặng!
              </button>
            ) : (
              <button
                onClick={() => navigate('/reading')}
                className="py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                🔮 Xem Tarot kiếm thức ăn
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-1 relative max-w-md w-full animate-[wiggle_1s_ease-in-out_infinite]">
            <div className="bg-white rounded-[22px] p-8 text-center relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />

              <div className="text-6xl mb-6">🎫</div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">Chúc Mừng!</h2>
              <p className="text-gray-600 mb-6">Bạn đã nuôi Gà Thần Vũ Trụ thành công. Đây là phần thưởng dành cho bạn:</p>

              <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl p-4 mb-6 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MÃ GIẢM GIÁ
                </span>
                <p className="text-2xl font-black text-orange-600 tracking-widest mt-2">GATHAN50</p>
                <p className="text-sm text-orange-800 mt-1">Giảm 50% khi mua gói năng lượng Tarot!</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('GATHAN50');
                    alert('Đã copy mã: GATHAN50');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors"
                >
                  Copy Mã
                </button>
                <button
                  onClick={() => {
                    setShowRewardModal(false);
                    navigate('/shop');
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Đến Shop
                </button>
              </div>

              <button
                onClick={() => setShowRewardModal(false)}
                className="mt-6 text-sm text-gray-400 hover:text-gray-600 font-medium"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          100% { background-position: 20px 0; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
      `}} />
    </div>
  );
}
