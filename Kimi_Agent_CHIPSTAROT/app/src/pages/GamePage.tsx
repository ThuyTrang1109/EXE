import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { PET_LEVELS } from '@/data/constants';
import { PetChicken } from '@/components/PetChicken';
import { HatchingOverlay } from '@/components/HatchingOverlay';



const PET_TYPES: Record<string, { name: string; emoji: string; color: string; desc: string; aura: string; particle: string }> = {
  "chicken_classic": { name: "Gà Classic", emoji: "🐣", color: "from-yellow-400 to-amber-500", desc: "Chú gà con truyền thống, ham ăn chóng lớn.", aura: "bg-yellow-400/30", particle: "🍗" },
  "chicken_golden": { name: "Gà Vàng May Mắn", emoji: "✨🐣✨", color: "from-yellow-300 to-yellow-600", desc: "Mang lại năng lượng tài lộc và sự thịnh vượng.", aura: "bg-yellow-200/40", particle: "✨" },
  "chicken_ninja": { name: "Gà Ninja", emoji: "🥷🐤", color: "from-gray-700 to-black", desc: "Âm thầm và nhanh nhẹn trong bóng tối.", aura: "bg-purple-900/40", particle: "👤" },
  "chicken_wizard": { name: "Gà Phù Thủy", emoji: "🧙‍♂️🐥", color: "from-purple-600 to-indigo-900", desc: "Bậc thầy phép thuật và những lời tiên tri.", aura: "bg-indigo-500/30", particle: "🔮" },
  "chicken_robot": { name: "Gà Robot", emoji: "🤖🐥", color: "from-blue-400 to-cyan-600", desc: "Sở hữu trí tuệ nhân tạo vượt thời đại.", aura: "bg-cyan-400/30", particle: "⚡" },
  "chicken_angel": { name: "Gà Thiên Thần", emoji: "👼🐥", color: "from-blue-400 to-blue-600", desc: "Ban phát phước lành và sự bình an.", aura: "bg-white/40", particle: "🪽" },
  "chicken_devil": { name: "Gà Ác Ma", emoji: "😈🐤", color: "from-red-600 to-red-900", desc: "Cá tính, nổi loạn và đầy quyền năng.", aura: "bg-red-600/30", particle: "🔥" },
  "chicken_samurai": { name: "Gà Samurai", emoji: "⚔️🐥", color: "from-red-700 to-gray-800", desc: "Tinh thần võ sĩ đạo bất diệt.", aura: "bg-red-800/30", particle: "⚔️" },
  "chicken_viking": { name: "Gà Viking", emoji: "🪓🐥", color: "from-orange-800 to-brown-700", desc: "Chiến binh dũng mãnh từ phương Bắc.", aura: "bg-orange-800/30", particle: "🛡️" },
  "chicken_cosmic": { name: "Gà Vũ Trụ", emoji: "🌌🐥", color: "from-indigo-600 to-purple-800", desc: "Kết nối trực tiếp với năng lượng các vì sao.", aura: "bg-purple-600/40", particle: "⭐" }
};

const RANDOM_REWARDS = [
  { code: 'TAROT10', desc: 'Giảm 10% khi mua gói năng lượng Tarot!' },
  { code: 'LUCKY20', desc: 'Giảm 20% khi mua gói năng lượng Tarot!' },
  { code: 'MAGIC30', desc: 'Giảm 30% cho đơn hàng đầu tiên!' },
  { code: 'GATHAN50', desc: 'Giảm 50% khi mua gói năng lượng (Cực hiếm)!' },
  { code: 'FREESHIP', desc: 'Miễn phí vận chuyển mọi đơn hàng!' }
];

export default function GamePage() {
  const navigate = useNavigate();
  const { user, updateUserSession, isConfigured } = useAuth();
  const [exp, setExp] = useState(0);
  const [food, setFood] = useState(0);
  const [petStatus, setPetStatus] = useState<'egg' | 'hatched'>('egg');
  const [petType, setPetType] = useState<string | null>(null);
  const [petName, setPetName] = useState<string>('');
  const [isHatching, setIsHatching] = useState(false);
  const [claimedLevels, setClaimedLevels] = useState<number[]>([]);
  const [isFeeding, setIsFeeding] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [currentReward, setCurrentReward] = useState<any>(null);
  const [copyMsg, setCopyMsg] = useState('');

  // Test states for shape/level preview
  const [testLevel, setTestLevel] = useState<number | null>(null);
  const [testType, setTestType] = useState<string | null>(null);

  // New visual effect states
  const [showHatchingOverlay, setShowHatchingOverlay] = useState(false);
  const [isAscending, setIsAscending] = useState(false);
  const [prevLevel, setPrevLevel] = useState<number | null>(null);
  const [isPetting, setIsPetting] = useState(false);
  const [isBathing, setIsBathing] = useState(false);
  const [petNeed, setPetNeed] = useState<'none' | 'pet' | 'bathe'>('none');
  const [lastInteractExp, setLastInteractExp] = useState(0);

  // [FIX] Chỉ chạy khi user thay đổi (mount / login) — không để `food` và `claimedLevels` vào deps
  // vì mỗi lần cho ăn sẽ trigger sync lại líễu gây ra "sync loop" vô hạn.
  useEffect(() => {
    if (user) {
      setExp(user.petExp || 0);
      setFood(user.petFood || 0);
      setPetStatus((user.petStatus as 'egg' | 'hatched') || 'egg');
      setPetType(user.petType);
      setPetName(user.petName || '');
      try {
        setClaimedLevels(JSON.parse(user.petClaimedLevels || '[]'));
      } catch {
        setClaimedLevels([]);
      }
    }
  }, [user]);

  const saveState = (newExp: number, newFood: number, newClaimed?: number[]) => {
    setExp(newExp);
    setFood(newFood);
    if (newClaimed) setClaimedLevels(newClaimed);

    if (user && updateUserSession) {
      updateUserSession({
        petExp: newExp,
        petFood: newFood,
        petClaimedLevels: newClaimed ? JSON.stringify(newClaimed) : user.petClaimedLevels
      });
    }
  };

  const getLevelInfo = (currentExp: number) => {
    for (let i = 0; i < PET_LEVELS.length; i++) {
      if (currentExp < PET_LEVELS[i].maxExp) return { level: i, ...PET_LEVELS[i] };
    }
    return { level: 3, ...PET_LEVELS[3] };
  };

  const currentInfo = getLevelInfo(exp);
  const prevMaxExp = currentInfo.level === 0 ? 0 : PET_LEVELS[currentInfo.level - 1].maxExp;
  const targetExp = currentInfo.maxExp === Infinity ? exp : currentInfo.maxExp;
  const progressPercent = currentInfo.level === 3 ? 100 : ((exp - prevMaxExp) / (targetExp - prevMaxExp)) * 100;
  const hasUnclaimedReward = currentInfo.level > 0 && !claimedLevels.includes(currentInfo.level);

  const checkLevelUp = (oldExp: number, newExp: number) => {
    const oldLevel = getLevelInfo(oldExp).level;
    const newLevel = getLevelInfo(newExp).level;
    if (newLevel > oldLevel) {
      setIsAscending(true);
      setTimeout(() => setIsAscending(false), 3000);
    }
  };

  // Effect: Randomly generate pet needs
  useEffect(() => {
    if (petStatus === 'egg' || petNeed !== 'none' || currentInfo.level === 3) return;
    const timer = setTimeout(() => {
      const needs: ('pet' | 'bathe')[] = ['pet', 'bathe'];
      setPetNeed(needs[Math.floor(Math.random() * needs.length)]);
    }, 15000 + Math.random() * 15000); // 15-30s
    return () => clearTimeout(timer);
  }, [petStatus, petNeed, currentInfo.level]);

  const handleFeed = async () => {
    const foodCost = Number(localStorage.getItem('chipstarot_admin_pet_food_cost')) || 1;
    const expGain = Number(localStorage.getItem('chipstarot_admin_pet_exp_gain')) || 10;
    const rareRate = Number(localStorage.getItem('chipstarot_admin_pet_rare_rate')) || 5;

    if (food < foodCost || isFeeding) return;

    setIsFeeding(true);

    if (user && isConfigured && !user.id.startsWith('demo-')) {
      try {
        const res = await api.feedPet(foodCost);
        if (res.success) {
          checkLevelUp(exp, res.data.petExp);
          setExp(res.data.petExp);
          setFood(res.data.petFood);
        }
      } catch (err) {
        console.error("Lỗi khi cho ăn:", err);
      }
    } else {
      const newExp = exp + expGain;
      checkLevelUp(exp, newExp);
      saveState(newExp, food - foodCost);
    }

    setTimeout(() => setIsFeeding(false), 800);
  };

  const handleInteract = (type: 'pet' | 'bathe') => {
    if (isPetting || isBathing || isAscending || petStatus === 'egg' || isFeeding) return;
    
    if (type === 'pet') {
      setIsPetting(true);
      setTimeout(() => setIsPetting(false), 2000);
    } else {
      setIsBathing(true);
      setTimeout(() => setIsBathing(false), 4000);
    }

    if (petNeed === type) {
      const newExp = exp + 2;
      checkLevelUp(exp, newExp);
      saveState(newExp, food);
      setPetNeed('none');
      setLastInteractExp(2);
    } else {
      setLastInteractExp(0);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Fullscreen Hatching Overlay */}
      {showHatchingOverlay && petType && (
        <HatchingOverlay
          petType={petType}
          petName={petName}
          onFinished={() => {
            setShowHatchingOverlay(false);
            setPetStatus('hatched');
            if (updateUserSession) updateUserSession({ petType: petType!, petName: petName, petStatus: 'hatched' });
          }}
        />
      )}
      {/* Background elements - Only show during level up OR permanent subtle for Level 4 */}
      {(isAscending || currentInfo.level === 3) && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isAscending ? 'opacity-100' : 'opacity-40'}`}>
          {[...Array(currentInfo.level === 3 ? 40 : 30)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-pulse`}
              style={{
                width: `${((i * 3 + 1) % 4) + 2}px`,
                height: `${((i * 3 + 1) % 4) + 2}px`,
                left: `${(i * 13.7) % 100}%`,
                top: `${(i * 23.3) % 100}%`,
                animationDelay: `${(i * 0.5) % 2}s`,
                background: currentInfo.level === 3
                  ? `hsl(${(i * 45) % 360}, 80%, 70%)`
                  : '#FACC15',
                boxShadow: currentInfo.level === 3
                  ? `0 0 10px hsl(${(i * 45) % 360}, 80%, 60%)`
                  : 'none',
                filter: currentInfo.level === 3 ? 'blur(0.5px)' : 'none'
              }}
            />
          ))}
          {/* Extra mystical floating symbols for Level 4 */}
          {currentInfo.level === 3 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 text-4xl opacity-10 animate-float">🔮</div>
              <div className="absolute bottom-1/4 right-1/4 text-4xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>✨</div>
              <div className="absolute top-1/3 right-1/4 text-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>🌙</div>
            </div>
          )}
        </div>
      )}

      <div className="relative z-10 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-900/50 text-yellow-400 text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-purple-700/50">
            🎮 Nuôi Thú Ảo
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Khu Vườn Phép Thuật</h1>
          <p className="text-purple-200">Cho linh thú ăn bằng cách xem Tarot để nhận quà tặng đặc biệt!</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl relative overflow-hidden">

          {/* TEST PANEL (Collapsible for Production) */}
          <details className="group bg-black/30 rounded-xl mb-8 border border-white/5 overflow-hidden transition-all duration-300">
            <summary className="cursor-pointer px-4 py-3 text-white/50 text-xs font-semibold tracking-wider uppercase hover:text-white/80 hover:bg-white/5 transition-colors outline-none list-none flex justify-between items-center">
              <span>🛠 Chế Độ Thử Nghiệm Hình Thái</span>
              <span className="group-open:rotate-180 transition-transform duration-300">▼</span>
            </summary>
            <div className="p-4 border-t border-white/5 bg-black/50">
              <p className="text-gray-400 text-xs mb-3 italic">*Dùng để xem trước các cấp độ và linh thú. Không ảnh hưởng đến dữ liệu thật.</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {[0, 1, 2, 3].map(lv => (
                  <button
                    key={`test-lv-${lv}`}
                    onClick={() => setTestLevel(testLevel === lv ? null : lv)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${testLevel === lv ? 'bg-yellow-400 text-black scale-105 shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    Cấp {lv + 1}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(PET_TYPES).map(typeKey => (
                  <button
                    key={typeKey}
                    onClick={() => setTestType(testType === typeKey ? null : typeKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${testType === typeKey ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] scale-105' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    {PET_TYPES[typeKey].emoji} {PET_TYPES[typeKey].name}
                  </button>
                ))}
              </div>
            </div>
          </details>
          {/* Status Bar */}
          <div className="flex justify-between items-center bg-black/30 rounded-2xl p-4 mb-8">
            <div>
              <p className="text-purple-300 text-xs font-bold mb-1 uppercase tracking-wider">Lương Thực</p>
              <p className="text-2xl font-black text-white flex items-center gap-2">
                <span>🍎</span> {food} <span className="text-sm font-normal text-purple-200">phần</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-300 text-xs font-bold mb-1 uppercase tracking-wider">Cấp Độ {currentInfo.level + 1}</p>
              <p className="text-lg font-bold text-yellow-400">{currentInfo.name}</p>
            </div>
          </div>

          {/* Pet Character */}
          <div className="min-h-[380px] flex flex-col items-center justify-center relative my-10">

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              {petStatus === 'hatched' && petType && (
                <>
                  {/* God Level Permanent Subtle Aura */}
                  {currentInfo.level === 3 && (
                    <div className={`absolute w-80 h-80 rounded-full blur-[80px] opacity-20 animate-pulse ${PET_TYPES[petType].aura}`} />
                  )}

                  {/* Level Up Intense Effects */}
                  {isAscending && (
                    <>
                      {/* Background Aura Glow */}
                      <div className={`absolute w-64 h-64 rounded-full blur-[60px] animate-aura-pulse ${PET_TYPES[petType].aura}`} />

                      {/* Spinning Aura Ring */}
                      <div className="absolute w-72 h-72 rounded-full border-2 border-dashed border-white/10 animate-aura-spin" />

                      {/* Dynamic Particles */}
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute text-xl animate-particle-float"
                          style={{
                            left: `${40 + Math.random() * 20}%`,
                            top: `${40 + Math.random() * 20}%`,
                            animationDelay: `${i * 0.4}s`,
                            animationDuration: `${2 + Math.random()}s`
                          }}
                        >
                          {PET_TYPES[petType].particle}
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
              {petStatus === 'egg' && (
                <div className="absolute w-48 h-48 bg-yellow-400/20 rounded-full blur-[40px] animate-pulse" />
              )}
            </div>

            <div className="transition-all duration-300 relative z-10 flex items-center justify-center">
              {/* Ascension Effect Overlay (Localized around pet) */}
              {isAscending && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 flex items-center justify-center z-50 pointer-events-none">
                  <div className="absolute inset-0 bg-yellow-400/40 rounded-full blur-[40px] animate-pulse" />
                  <div className="absolute inset-0 border-[6px] border-yellow-300/80 rounded-full animate-[spin_3s_linear_infinite] border-t-transparent border-b-transparent" />
                  <div className="absolute inset-0 border-[3px] border-yellow-100/60 rounded-full animate-[spin_2s_linear_infinite_reverse] border-l-transparent border-r-transparent" />
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={`asc-${i}`}
                      className="absolute text-3xl animate-particle-float"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        bottom: `${20 + Math.random() * 40}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '1.5s'
                      }}
                    >
                      {['✨', '⭐', '🌟'][i % 3]}
                    </div>
                  ))}
                  <div className="absolute -top-12 text-3xl font-black text-yellow-400 animate-bounce whitespace-nowrap drop-shadow-[0_0_10px_rgba(250,204,21,1)]">
                    THĂNG CẤP! 🆙
                  </div>
                </div>
              )}

              {petStatus === 'egg' ? (
                <div className={`text-8xl ${isHatching ? 'animate-pet-shake scale-150' : 'animate-pet-float'}`}>🥚</div>
              ) : petStatus === 'hatched' ? (
                <div className={`relative cursor-pointer ${isAscending ? 'animate-ascension-glow' : ''}`} onClick={handleFeed}>
                  {/* Bathtub Behind Pet */}
                  {isBathing && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-200/40 rounded-[100px] border-b-8 border-blue-300/60 z-0 flex items-end justify-center overflow-hidden backdrop-blur-sm">
                      <div className="w-full h-1/2 bg-cyan-300/40 animate-pulse"></div>
                    </div>
                  )}

                  <div className={`transition-all duration-300 relative z-10 flex items-center justify-center`}>
                    <PetChicken
                      type={testType || petType || 'chicken_classic'}
                      className="w-64 h-64 md:w-80 md:h-80 mx-auto z-10 relative"
                      isFeeding={isFeeding || isPetting || isBathing}
                      level={testLevel !== null ? testLevel : currentInfo.level}
                      isAscending={isAscending}
                    />
                  </div>

                  {/* Bubbles / Front Bathtub Elements */}
                  {isBathing && (
                     <div className="absolute inset-0 pointer-events-none z-20">
                       <div className="absolute bottom-4 left-10 text-3xl animate-bounce" style={{animationDelay: '0.1s'}}>🫧</div>
                       <div className="absolute bottom-12 right-8 text-2xl animate-float" style={{animationDelay: '0.3s'}}>🫧</div>
                       <div className="absolute top-1/2 left-1/4 text-4xl animate-pulse" style={{animationDelay: '0.5s'}}>🛁</div>
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-16 bg-white/20 rounded-full blur-md"></div>
                     </div>
                  )}
                  {/* Petting Hearts */}
                  {isPetting && (
                    <div className="absolute inset-0 pointer-events-none z-20">
                       <div className="absolute -top-4 left-1/4 text-3xl animate-ping text-pink-400">❤️</div>
                       <div className="absolute top-8 right-1/4 text-4xl animate-float text-pink-500" style={{animationDelay: '0.2s'}}>💖</div>
                    </div>
                  )}
                  {/* Needs Bubble */}
                  {petNeed !== 'none' && !isBathing && !isPetting && !isFeeding && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-purple-900 px-4 py-2 rounded-2xl rounded-bl-none shadow-[0_0_15px_rgba(255,255,255,0.5)] font-bold text-sm z-30 animate-bounce whitespace-nowrap">
                      {petNeed === 'pet' ? '💭 Cần vuốt ve!' : '💭 Muốn tắm!'}
                    </div>
                  )}
                </div>
              ) : null}

              {isFeeding && petStatus !== 'egg' && (
                <>
                  <div className="absolute -top-4 -right-4 text-3xl animate-bounce z-20">😋</div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl animate-ping text-yellow-400 z-20 whitespace-nowrap font-black">✨+{Number(localStorage.getItem('chipstarot_admin_pet_exp_gain')) || 10} EXP</div>
                </>
              )}
              {(isPetting || isBathing) && petStatus !== 'egg' && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl animate-ping text-pink-400 z-20 whitespace-nowrap font-black">
                  {lastInteractExp > 0 ? `✨+${lastInteractExp} EXP` : '✨Vui vẻ!'}
                </div>
              )}
            </div>

            {petStatus === 'hatched' && petType && (
              <div className={`relative z-20 mt-4 px-4 py-1 rounded-full bg-gradient-to-r ${PET_TYPES[petType]?.color} text-white text-sm font-bold shadow-lg`}>
                {PET_TYPES[petType]?.name}
              </div>
            )}

            {petStatus === 'egg' && (
              <button
                onClick={async () => {
                  setIsHatching(true);
                  try {
                    if (!isConfigured || user?.id.startsWith('demo-')) {
                      const types = Object.keys(PET_TYPES);
                      const randomType = types[Math.floor(Math.random() * types.length)];
                      setPetType(randomType);
                      setPetName("Gà Demo");
                      setShowHatchingOverlay(true);
                      return;
                    }
                    const res = await api.hatchPet();
                    if (res.success) {
                      setPetType(res.data.petType);
                      setPetName(res.data.petName);
                      setShowHatchingOverlay(true);
                    }
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setIsHatching(false);
                  }
                }}
                disabled={isHatching}
                className="mt-8 btn-3d-yellow px-8 py-3 animate-pulse"
              >
                {isHatching ? '🐣 Đang nở...' : '✨ ẤP TRỨNG NGAY'}
              </button>
            )}

            <p className="mt-8 text-center text-purple-200 max-w-sm relative z-10 italic">
              {petStatus === 'egg' ? "Đang ấp ủ năng lượng từ các vì sao..." : petType ? PET_TYPES[petType]?.desc : "Gà con đang lớn..."}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-bold text-purple-300 mb-2">
              <span>{currentInfo.maxExp === Infinity ? 'MAX' : `${exp} / ${currentInfo.maxExp}`} EXP</span>
              {currentInfo.level < 3 ? <span>Cần đạt: {targetExp}</span> : <span>MAX LEVEL</span>}
            </div>
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>Thức ăn: {food} 🍎</span>
              <span>1 🍎 = {Number(localStorage.getItem('chipstarot_admin_pet_exp_gain')) || 10} EXP</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleFeed}
              disabled={food < (Number(localStorage.getItem('chipstarot_admin_pet_food_cost')) || 1) || currentInfo.level === 3 || isAscending || isBathing || isPetting}
              className={`py-4 px-2 rounded-2xl font-bold text-sm lg:text-base flex items-center justify-center gap-1 transition-all ${food >= (Number(localStorage.getItem('chipstarot_admin_pet_food_cost')) || 1) && currentInfo.level < 3 && !isAscending && !isBathing && !isPetting
                ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white hover:scale-105 shadow-lg shadow-green-500/30 cursor-pointer'
                : 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                }`}
            >
              🍎 Cho ăn
            </button>
            <button
              onClick={() => handleInteract('pet')}
              disabled={isPetting || isBathing || petStatus === 'egg' || isAscending || currentInfo.level === 3}
              className={`py-4 px-2 rounded-2xl font-bold text-sm lg:text-base transition-all shadow-lg flex items-center justify-center gap-1 ${!(isPetting || isBathing || petStatus === 'egg' || isAscending || currentInfo.level === 3) ? 'bg-pink-500/30 text-pink-100 border border-pink-500/50 hover:bg-pink-500/50 hover:scale-105 shadow-pink-500/30' : 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'}`}
            >
              👋 Vuốt ve
            </button>
            <button
              onClick={() => handleInteract('bathe')}
              disabled={isPetting || isBathing || petStatus === 'egg' || isAscending || currentInfo.level === 3}
              className={`py-4 px-2 rounded-2xl font-bold text-sm lg:text-base transition-all shadow-lg flex items-center justify-center gap-1 ${!(isPetting || isBathing || petStatus === 'egg' || isAscending || currentInfo.level === 3) ? 'bg-blue-500/30 text-blue-100 border border-blue-500/50 hover:bg-blue-500/50 hover:scale-105 shadow-blue-500/30' : 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'}`}
            >
              🛁 Tắm thú
            </button>

            {hasUnclaimedReward ? (
              <button
                onClick={async () => {
                  const reward = RANDOM_REWARDS[Math.floor(Math.random() * RANDOM_REWARDS.length)];
                  setCurrentReward(reward);
                  setShowRewardModal(true);

                  if (user && isConfigured && !user.id.startsWith('demo-')) {
                    try {
                      const res = await api.claimPetReward(currentInfo.level);
                      if (res.success) {
                        setFood(res.data.petFood);
                        setClaimedLevels([...claimedLevels, currentInfo.level]);
                      }
                    } catch (err) {
                      console.error("Lỗi nhận quà:", err);
                    }
                  } else {
                    const newClaimed = [...claimedLevels, currentInfo.level];
                    saveState(exp, food, newClaimed);
                  }
                }}
                className="py-4 px-2 rounded-2xl font-bold text-sm lg:text-base bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:scale-105 shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-1 animate-pulse"
              >
                🎁 Nhận Quà!
              </button>
            ) : currentInfo.level === 3 ? (
              <button
                onClick={() => navigate('/shop')}
                className="py-4 px-2 rounded-2xl font-bold text-sm lg:text-base bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-1"
              >
                🛍️ Mua sắm
              </button>
            ) : (
              <button
                onClick={() => navigate('/reading')}
                className="py-4 px-2 rounded-2xl font-bold text-sm lg:text-base bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-1"
              >
                🔮 Tarot
              </button>
            )}
          </div>
          {/* [DEV TEST] Pet Gallery */}
          <div className="mt-12 pt-8 border-t border-white/10 w-full">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4 text-center">Dev Test: Tất cả hình thái gà</p>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {Object.entries(PET_TYPES).map(([type, info]) => (
                <button
                  key={type}
                  onClick={() => {
                    setPetType(type);
                    setPetStatus('hatched');
                    setPetName(info.name);
                  }}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all border ${petType === type ? 'bg-yellow-400/20 border-yellow-400' : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  title={info.name}
                >
                  <span className="text-2xl mb-1">{info.emoji}</span>
                  <span className="text-[8px] text-white/60 truncate w-full text-center">{info.name.split(' ')[1] || info.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => { setPetStatus('egg'); setPetType(null); }}
              className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-white/40 text-[10px] rounded-lg border border-white/10 transition-all"
            >
              Reset về Trứng 🥚
            </button>
          </div>
        </div>
      </div>

      {/* Reward Modal */}
      {showRewardModal && currentReward && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-1 relative max-w-md w-full animate-[wiggle_1s_ease-in-out_infinite]">
            <div className="bg-white rounded-[22px] p-8 text-center relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />

              <div className="text-6xl mb-6">🎫</div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">Chúc Mừng!</h2>
              <p className="text-gray-600 mb-6">Thú cưng của bạn đã thăng cấp. Đây là phần thưởng dành cho bạn:</p>

              <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl p-4 mb-6 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  MÃ GIẢM GIÁ
                </span>
                <p className="text-2xl font-black text-orange-600 tracking-widest mt-2">{currentReward.code}</p>
                <p className="text-sm text-orange-800 mt-1">{currentReward.desc}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentReward.code).then(() => {
                      setCopyMsg(`✅ Đã copy mã: ${currentReward.code}`);
                      setTimeout(() => setCopyMsg(''), 2000);
                    });
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors"
                >
                  {copyMsg || 'Copy Mã'}
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


    </div>
  );
}
