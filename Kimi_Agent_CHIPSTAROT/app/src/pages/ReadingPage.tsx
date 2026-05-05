import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TAROT_DB, TOPICS, SUB_QUESTIONS, SUGGESTED_QUESTIONS } from '../data/constants';
import { generateTarotReading } from '../lib/gemini';
import { syncPetProgress } from '../lib/supabase';

export default function ReadingPage({ user, consumeCredit }: any) {
  const navigate = useNavigate();
  const [step, setStep] = useState(user?.name ? 2 : 1);
  const [name, setName] = useState(user?.name || '');
  const [dob, setDob] = useState('');
  const [topic, setTopic] = useState('');
  const [subAnswer, _setSubAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [cardCount, setCardCount] = useState(0);
  const [shuffled, setShuffled] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<any[]>([]);
  const [creditUsed, setCreditUsed] = useState(false);
  const [aiReading, setAiReading] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [nameError, setNameError] = useState('');
  const [dobError, setDobError] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [isFlyingUp, setIsFlyingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false); // [FIX] Guard chống consume 2 lần

  useEffect(() => {
    if (user?.name && step === 1) {
      setName(user.name);
      setStep(2);
    }
  }, [user, step]);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /** Kiểm tra chuỗi có phải toàn ký tự lặp lại không (vd: "aaaaaaa", "11111") */
  const isRepetitive = (str: string): boolean => {
    const unique = new Set(str.replace(/\s/g, '').split(''));
    return unique.size <= 1 && str.replace(/\s/g, '').length > 0;
  };

  /** Kiểm tra câu hỏi có đủ từ có nghĩa không (ít nhất 3 từ >= 2 ký tự) */
  const hasMeaningfulWords = (str: string): boolean => {
    const words = str.trim().split(/\s+/).filter(w => w.length >= 2);
    return words.length >= 3;
  };

  /** Danh sách từ/cụm từ bị cấm (rác, xúc phạm) */
  const BANNED_PATTERNS = [
    /^\s*test\s*$/i,
    /^\s*abc\s*$/i,
    /^\s*asdf\s*$/i,
    /^[^a-zA-ZÀ-ỹ\d]{3,}$/, // toàn ký tự đặc biệt
    /(.)\1{5,}/,             // ký tự lặp liên tiếp ≥ 6 lần (vd: "aaaaaaa")
  ];

  const containsBanned = (str: string): boolean =>
    BANNED_PATTERNS.some(pattern => pattern.test(str));

  // ─── Debounce Guard ───────────────────────────────────────────────────────
  const withDebounce = (fn: () => void) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    fn();
    setTimeout(() => setIsSubmitting(false), 800);
  };

  // ─── Step 1: Validate Tên & Ngày sinh ────────────────────────────────────
  const handleNameSubmit = () => withDebounce(() => {
    const trimmed = name.trim();

    if (trimmed.length < 2) {
      setNameError('Tên phải có ít nhất 2 ký tự.');
      return;
    }
    if (trimmed.length > 50) {
      setNameError('Tên quá dài (tối đa 50 ký tự).');
      return;
    }
    if (!/^[\p{L}\s]+$/u.test(trimmed)) {
      setNameError('Tên chỉ được chứa chữ cái và khoảng trắng (không nhập số hay ký tự đặc biệt).');
      return;
    }
    if (isRepetitive(trimmed.replace(/\s/g, ''))) {
      setNameError('Tên không hợp lệ. Vui lòng nhập tên thật của bạn.');
      return;
    }
    setNameError('');

    if (!user) {
      if (!dob) {
        setDobError('Vui lòng nhập ngày sinh của bạn.');
        return;
      }
      const dobDate = new Date(dob);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 100); // tối đa 100 tuổi
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() - 7);   // tối thiểu 7 tuổi

      if (isNaN(dobDate.getTime())) {
        setDobError('Ngày sinh không hợp lệ.');
        return;
      }
      if (dobDate > today) {
        setDobError('Ngày sinh không thể là ngày trong tương lai.');
        return;
      }
      if (dobDate > maxDate) {
        setDobError('Bạn cần ít nhất 7 tuổi để sử dụng dịch vụ này.');
        return;
      }
      if (dobDate < minDate) {
        setDobError('Ngày sinh không hợp lệ (vượt quá 100 năm).');
        return;
      }
    }
    setDobError('');
    setStep(2);
  });

  // ─── Step 4: Validate Câu hỏi ────────────────────────────────────────────
  const handleQuestionSubmit = () => withDebounce(() => {
    const trimmed = question.trim();

    if (trimmed.length === 0) {
      setQuestionError('Vui lòng nhập câu hỏi bạn muốn hỏi vũ trụ.');
      return;
    }
    if (trimmed.length < 10) {
      setQuestionError('Câu hỏi cần rõ ràng và chi tiết hơn (ít nhất 10 ký tự).');
      return;
    }
    if (trimmed.length > 300) {
      setQuestionError('Câu hỏi quá dài (tối đa 300 ký tự).');
      return;
    }
    if (isRepetitive(trimmed)) {
      setQuestionError('Câu hỏi không hợp lệ. Hãy diễn đạt thật lòng điều bạn muốn biết.');
      return;
    }
    if (containsBanned(trimmed)) {
      setQuestionError('Câu hỏi chứa nội dung không hợp lệ. Vui lòng nhập câu hỏi có ý nghĩa.');
      return;
    }
    if (!hasMeaningfulWords(trimmed)) {
      setQuestionError('Câu hỏi cần có ít nhất 3 từ để vũ trụ có thể hiểu và giải đáp cho bạn.');
      return;
    }

    setQuestionError('');
    setStep(5);
  });

  // [FIX] Credit được tiêu TRUỚC khi lật bài (step 6 + revealed)
  // Guard `isConsuming` đảm bảo chỉ gọi consumeCredit đúng 1 lần dù useEffect chạy nhiều lần.
  useEffect(() => {
    if (step === 6 && revealed && user && !creditUsed && !isConsuming) {
      setIsConsuming(true);
      consumeCredit().then((success: boolean) => {
        if (success) {
          setCreditUsed(true);
        } else {
          // Không còn credit / hết hạn → ẩn kết quả, hiện paywall (App.tsx xử lý)
          setRevealed(false);
          setSelected([]);
        }
        setIsConsuming(false);
      });
    }
  }, [step, revealed, user, creditUsed, isConsuming, consumeCredit]);

  const shuffle = () => {
    const cards = [...TAROT_DB.cards];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    setShuffled(cards.map(c => ({ ...c, reversed: Math.random() > 0.5 })));
  };

  const handleSelectCard = (idx: number) => {
    if (selected.length < cardCount && !selected.includes(idx)) {
      const newSel = [...selected, idx];
      setSelected(newSel);
      if (newSel.length === cardCount) {
        // Đợi 1.5 giây để người dùng nhìn thấy lá bài cuối cùng lật lên
        setTimeout(() => {
          setIsFlyingUp(true);
          // Đợi thêm 1.5 giây cho hiệu ứng bay lên hoàn tất
          setTimeout(async () => {
            setRevealed(true);
            const pickedCards = newSel.map(i => shuffled[i]);
            setResult(pickedCards);
            
            // Gọi AI giải bài
            setLoadingAI(true);
            try {
              const aiResult = await generateTarotReading(
                name,
                TOPICS.find(t => t.id === topic)?.name || topic,
                subAnswer,
                question,
                pickedCards
              );
              setAiReading(aiResult);
              // [FIX] Sync Pet: đọc từ user state thay vì localStorage để tránh stale data
              const newFood = (user?.pet_food ?? parseInt(localStorage.getItem('chipstarot_chicken_food') || '0')) + 1;
              localStorage.setItem('chipstarot_chicken_food', newFood.toString());
              if (user) {
                const exp = user.pet_exp ?? parseInt(localStorage.getItem('chipstarot_chicken_exp') || '0');
                const claimed = user.pet_claimed_levels ?? JSON.parse(localStorage.getItem('chipstarot_chicken_claimed') || '[]');
                syncPetProgress(user.id, exp, newFood, claimed);
              }
            } catch (err) {
              console.error(err);
              setAiReading('Có lỗi xảy ra khi tải lời giải từ vũ trụ.');
            } finally {
              setLoadingAI(false);
            }
          }, 1500);
        }, 1500);
      }
    }
  };

  const reset = () => {
    setStep(user?.name ? 2 : 1); 
    setName(user?.name || ''); 
    setDob('');
    setTopic(''); 
    _setSubAnswer(''); 
    setQuestion('');
    setCardCount(0); setShuffled([]); setSelected([]); setRevealed(false); setResult([]);
    setCreditUsed(false); setAiReading(''); setLoadingAI(false); setIsShuffling(false); setIsFlyingUp(false);
    setIsConsuming(false); // [FIX] Reset guard khi bắt đầu lại
  };

  const currentTopic = TOPICS.find(t => t.id === topic);
  const subQ = topic ? SUB_QUESTIONS[topic] : null;
  const suggestedQs = topic ? SUGGESTED_QUESTIONS[topic] : [];

  const POSITIONS = ['✨ Thông điệp', '⬅️ Quá khứ', '🎯 Hiện tại', '🔮 Tương lai'];

  // Component render Markdown cơ bản & Hiệu ứng gõ phím
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    if (aiReading) {
      let i = 0;
      setDisplayedText('');
      const interval = setInterval(() => {
        setDisplayedText(prev => prev + aiReading.charAt(i));
        i++;
        if (i >= aiReading.length) clearInterval(interval);
      }, 15); // Tốc độ gõ phím
      return () => clearInterval(interval);
    }
  }, [aiReading]);

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-yellow-400 font-bold tracking-wide">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={j} className="text-purple-300 italic">{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-yellow-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`flex items-center gap-2 ${s < 5 ? '' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-yellow-400 text-purple-900' : 'bg-white/20 text-white/50'}`}>{s}</div>
              {s < 5 && <div className={`w-8 h-0.5 ${step > s ? 'bg-yellow-400' : 'bg-white/20'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Name & DOB */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🌟</div>
            <h2 className="text-3xl font-bold text-white mb-4">Bạn là ai?</h2>
            <p className="text-purple-200 mb-8">Để vũ trụ có thể gửi thông điệp riêng cho bạn</p>
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <input
                  className={`w-full block px-6 py-4 rounded-2xl bg-white/10 border ${nameError ? 'border-red-400 focus:border-red-400' : 'border-white/30 focus:border-yellow-400'} text-white placeholder-white/40 text-lg text-center focus:outline-none transition-colors`}
                  placeholder="Nhập tên của bạn..."
                  value={name}
                  onChange={e => { setName(e.target.value); setNameError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
                />
                {nameError && <p className="text-red-400 text-sm mt-2 font-medium">{nameError}</p>}
              </div>
              { !user && (
                <div>
                  <div className="text-left text-white/80 text-sm mb-1 ml-2">Ngày sinh:</div>
                  <input
                    type="date"
                    className={`w-full block px-6 py-4 rounded-2xl bg-white/10 border ${dobError ? 'border-red-400 focus:border-red-400' : 'border-white/30 focus:border-yellow-400'} text-white placeholder-white/40 text-lg text-center focus:outline-none transition-colors [color-scheme:dark]`}
                    value={dob}
                    onChange={e => { setDob(e.target.value); setDobError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
                  />
                  {dobError && <p className="text-red-400 text-sm mt-2 font-medium">{dobError}</p>}
                </div>
              )}
            </div>
            <button
              onClick={handleNameSubmit}
              disabled={isSubmitting}
              className="btn-3d-yellow mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '⏳ Đang kiểm tra...' : 'Tiếp tục →'}
            </button>
            <p className="text-yellow-400/80 text-xs mt-6 max-w-sm mx-auto flex items-start gap-1 text-left">
              <span>⚠️</span>
              <span>Lưu ý: Việc nhập sai thông tin có thể dẫn đến kết quả trải bài không chính xác do năng lượng không được kết nối đúng cách.</span>
            </p>
          </div>
        )}

        {/* Step 2: Topic */}
        {step === 2 && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Xin chào, <span className="text-yellow-400">{name}</span>! 👋</h2>
            <p className="text-purple-200 mb-8">Bạn muốn hỏi về chủ đề nào hôm nay?</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TOPICS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTopic(t.id); setStep(3); }}
                  className={`topic-card-3d p-4 text-center rounded-xl transition-all ${topic === t.id ? 'border-yellow-400 bg-yellow-400/20' : ''}`}
                >
                  <div className="text-3xl mb-2">{t.icon}</div>
                  <p className="text-white font-semibold text-sm">{t.name.replace(/^.{1,3} /, '')}</p>
                  <p className="text-white/60 text-xs mt-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Sub-question */}
        {step === 3 && subQ && (
          <div className="text-center">
            <div className="text-3xl mb-4">{currentTopic?.icon}</div>
            <h2 className="text-2xl font-bold text-white mb-2">{subQ.question}</h2>
            <p className="text-purple-200 mb-8 text-sm">Câu trả lời giúp AI cá nhân hóa lời giải cho bạn</p>
            <div className="space-y-3 max-w-lg mx-auto">
              {subQ.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { _setSubAnswer(opt.value); setStep(4); }}
                  className="w-full topic-card-3d text-left px-5 py-4 rounded-xl text-white hover:border-yellow-400"
                >
                  {opt.text}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(4)} className="mt-4 text-white/50 hover:text-white/80 text-sm">Bỏ qua →</button>
          </div>
        )}

        {/* Step 4: Question */}
        {step === 4 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Câu hỏi của {name} cho vũ trụ</h2>
            <p className="text-purple-200 mb-6 text-sm">Hãy hỏi thật cụ thể để nhận thông điệp chính xác nhất</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 max-w-2xl mx-auto">
              {suggestedQs.map(q => (
                <button key={q} onClick={() => setQuestion(q)} className="text-left text-sm bg-white/10 hover:bg-white/20 text-white/80 px-4 py-2 rounded-xl transition-all border border-white/10 hover:border-yellow-400">
                  💡 {q}
                </button>
              ))}
            </div>
            <div className="relative max-w-2xl mx-auto">
              <textarea
                className={`w-full block px-5 py-4 rounded-2xl bg-white/10 border ${
                  questionError
                    ? 'border-red-400 focus:border-red-400'
                    : question.trim().length > 0 && question.trim().length < 10
                      ? 'border-orange-400 focus:border-orange-400'
                      : 'border-white/30 focus:border-yellow-400'
                } text-white placeholder-white/40 focus:outline-none resize-none transition-colors pb-8`}
                placeholder="Ví dụ: Tôi có nên thay đổi công việc trong năm nay không?"
                rows={4}
                maxLength={300}
                value={question}
                onChange={e => { setQuestion(e.target.value); setQuestionError(''); }}
              />
              {/* Character counter */}
              <div className={`absolute bottom-3 right-4 text-xs font-mono ${
                question.length > 270 ? 'text-red-400' : question.length > 200 ? 'text-orange-400' : 'text-white/40'
              }`}>
                {question.length}/300
              </div>
            </div>
            {/* Hint text */}
            <div className="max-w-2xl mx-auto text-left space-y-1 mt-2">
              <p className="text-white/40 text-xs">
                💡 Câu hỏi tốt: Cụ thể, rõ ràng, ít nhất 3 từ. Tránh nhập ký tự ngẫu nhiên hoặc nội dung không có nghĩa.
              </p>
              <p className="text-yellow-400/80 text-xs flex items-start gap-1">
                <span>⚠️</span>
                <span>Lưu ý: Đặt câu hỏi hời hợt hoặc cố tình nhập sai có thể khiến vũ trụ nhiễu sóng, dẫn đến kết quả luận giải sai lệch.</span>
              </p>
            </div>
            {questionError && <p className="text-red-400 text-sm mt-2 font-medium">{questionError}</p>}
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={handleQuestionSubmit}
                disabled={isSubmitting}
                className="btn-3d-yellow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '⏳ Đang kiểm tra...' : 'Tiếp tục →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Card count */}
        {step === 5 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-8">Chọn cách trải bài</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
              {[
                { count: 1, title: '1 Lá Bài', desc: 'Thông điệp nhanh & rõ ràng', icon: '🃏' },
                { count: 3, title: '3 Lá Bài', desc: 'Quá khứ - Hiện tại - Tương lai', icon: '🎴' },
              ].map(opt => (
                <button
                  key={opt.count}
                  onClick={() => {
                    setCardCount(opt.count);
                    setIsShuffling(true);
                    setStep(6);
                    setTimeout(() => {
                      shuffle();
                      setIsShuffling(false);
                    }, 3500);
                  }}
                  className="spread-card-3d"
                >
                  <div className="text-4xl mb-3">{opt.icon}</div>
                  <h3 className="text-white font-bold text-xl mb-2">{opt.title}</h3>
                  <p className="text-white/60 text-sm">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Shuffling Animation */}
        {step === 6 && isShuffling && (
          <div className="flex flex-col items-center justify-center py-32 overflow-visible relative">
            <div className="absolute inset-0 bg-yellow-400/20 blur-[100px] rounded-full animate-pulse pointer-events-none" />
            <div className="relative w-32 h-48 perspective-1000 z-10">
               {[...Array(15)].map((_, i) => (
                 <div 
                   key={i}
                   className="absolute top-0 left-0 w-full h-full rounded-xl bg-[url('/card-back.png')] bg-cover bg-center magic-shuffle-card border border-white/20"
                   style={{ '--i': i } as any}
                 />
               ))}
            </div>
            <p className="mt-24 text-yellow-400 font-bold text-xl animate-pulse tracking-widest drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] z-10">
              Vũ trụ đang kết nối...
            </p>
          </div>
        )}

        {/* Step 6: Draw + Result */}
        {step === 6 && !isShuffling && !revealed && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Hãy chọn {cardCount} lá bài cho {name}
            </h2>
            <p className="text-purple-200 text-sm mb-6">
              Đã chọn: {selected.length}/{cardCount}
            </p>
            <div className="grid grid-cols-6 md:grid-cols-13 gap-1.5 max-w-3xl mx-auto">
              {shuffled.slice(0, 78).map((card, idx) => {
                const isSelected = selected.includes(idx);
                // Nếu đang hiệu ứng bay lên, lá bài KHÔNG ĐƯỢC CHỌN sẽ mờ đi và thu nhỏ, lá bài ĐƯỢC CHỌN sẽ bay lên.
                const flyingClass = isFlyingUp
                  ? (isSelected ? 'animate-fly-up z-50 pointer-events-none' : 'opacity-0 scale-90 pointer-events-none')
                  : '';
                
                return (
                  <div
                    key={idx}
                    className={`aspect-[2/3] perspective-1000 card-entrance transition-all duration-1000 ${flyingClass}`}
                    style={!isFlyingUp ? { animationDelay: `${(idx % 13) * 30 + Math.floor(idx / 13) * 15}ms` } : undefined}
                  >
                    <button
                      onClick={() => handleSelectCard(idx)}
                      disabled={isSelected || selected.length >= cardCount}
                      className={`relative w-full h-full rounded-lg transition-all duration-700 [transform-style:preserve-3d] outline-none ${
                        isSelected
                          ? 'scale-110 shadow-lg shadow-yellow-400/50 [transform:rotateY(180deg)] z-10'
                          : 'hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(168,85,247,0.4)] hover:ring-2 hover:ring-purple-400'
                      }`}
                    >
                      {/* Mặt sau (Card back) */}
                      <div className={`absolute inset-0 w-full h-full rounded-lg bg-[url('/card-back.png')] bg-cover bg-center border border-white/10 [backface-visibility:hidden] ${isSelected ? 'ring-2 ring-yellow-400' : ''}`} />
                      
                      {/* Mặt trước (Card face) */}
                      <div className="absolute inset-0 w-full h-full rounded-lg bg-[#0d0029] border-2 border-yellow-400 [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden flex items-center justify-center">
                        {isSelected && (
                          <img src={card.image} alt={card.name} className={`w-full h-full object-cover ${card.reversed ? 'rotate-180' : ''}`} onError={e => (e.currentTarget.src = '/card-back.png')} />
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Revealed Result */}
        {step === 6 && revealed && (
          <div className="animate-reveal-result">
            {!user ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">🔮 Lá bài của {name} đã sẵn sàng!</h2>
                <p className="text-purple-200 mb-6">Đăng nhập để xem ý nghĩa đầy đủ từ vũ trụ</p>
                <button onClick={() => navigate('/auth')} className="btn-3d-yellow">Đăng nhập để xem →</button>
              </div>
            ) : creditUsed ? (
              <div>
                <h2 className="text-2xl font-bold text-white text-center mb-8">🌟 Thông điệp cho {name}</h2>
                <div className={`grid gap-6 ${result.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>
                  {result.map((card, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center relative group">
                      {/* Magical Sparkle Effect */}
                      <div className="absolute -top-2 -right-2 text-xl animate-sparkle opacity-0 group-hover:opacity-100 transition-opacity">✨</div>
                      <div className="absolute -bottom-2 -left-2 text-xl animate-sparkle delay-300 opacity-0 group-hover:opacity-100 transition-opacity">✨</div>
                      
                      <p className="text-yellow-400 text-sm font-semibold mb-3">{POSITIONS[result.length === 1 ? 0 : i + 1]}</p>
                      <img
                        src={card.image}
                        alt={card.name}
                        className={`w-32 mx-auto rounded-xl shadow-2xl mb-4 transition-transform group-hover:scale-105 ${card.reversed ? 'rotate-180' : ''}`}
                        onError={e => (e.currentTarget.src = '/card-back.png')}
                      />
                      <h3 className="text-white font-bold text-lg mb-1">{card.name}</h3>
                      <p className="text-purple-300 text-xs mb-3">{card.reversed ? '🔄 Ngược' : '⬆️ Xuôi'}</p>
                      <p className="text-white/80 text-sm">{card.meanings?.[topic as keyof typeof card.meanings] || card.meanings?.general}</p>
                    </div>
                  ))}
                </div>

                {/* AI Reading Section */}
                <div className="mt-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                    <span>✨</span> Thông điệp sâu sắc từ Vũ trụ (AI)
                  </h3>
                  {loadingAI ? (
                    <div className="flex flex-col items-center py-8">
                      <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-purple-200 text-sm animate-pulse">Vũ trụ đang kết nối và luận giải thông điệp cho bạn...</p>
                    </div>
                  ) : aiReading ? (
                    <div className="text-white/90 leading-relaxed text-base font-medium animate-fade-in">
                      {renderFormattedText(displayedText)}
                      {displayedText.length < aiReading.length && (
                        <span className="inline-block w-2 h-4 bg-yellow-400 ml-1 animate-pulse"></span>
                      )}
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm italic">Nhập API Key trong file .env để nhận thông điệp từ AI.</p>
                  )}
                </div>

                <div className="flex gap-4 justify-center mt-10">
                  <button onClick={reset} className="btn-3d-yellow">🔄 Trải bài mới</button>
                  <button onClick={() => navigate('/shop')} className="btn-3d-white">🛍️ Khám phá shop</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl animate-spin inline-block mb-4">🔮</div>
                <h2 className="text-2xl font-bold text-white mb-2">Đang kết nối vũ trụ...</h2>
                <p className="text-purple-200">Vui lòng mua thêm lượt nếu bạn đã hết năng lượng.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
