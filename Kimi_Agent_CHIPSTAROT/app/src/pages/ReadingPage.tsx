import { useState, useEffect } from 'react';
import { TAROT_DB, TOPICS, SUB_QUESTIONS, SUGGESTED_QUESTIONS } from '../data/constants';

export default function ReadingPage({ user, consumeCredit, setPage }: any) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [, _setSubAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [cardCount, setCardCount] = useState(0);
  const [shuffled, setShuffled] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<any[]>([]);
  const [creditUsed, setCreditUsed] = useState(false);

  useEffect(() => {
    if (step === 6 && revealed && user && !creditUsed) {
      const success = consumeCredit();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (success) setCreditUsed(true);
    }
  }, [step, revealed, user, creditUsed, consumeCredit]);

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
        setTimeout(() => {
          setRevealed(true);
          setResult(newSel.map(i => shuffled[i]));
        }, 500);
      }
    }
  };

  const reset = () => {
    setStep(1); setName(''); setTopic(''); _setSubAnswer(''); setQuestion('');
    setCardCount(0); setShuffled([]); setSelected([]); setRevealed(false); setResult([]);
    setCreditUsed(false);
  };

  const currentTopic = TOPICS.find(t => t.id === topic);
  const subQ = topic ? SUB_QUESTIONS[topic] : null;
  const suggestedQs = topic ? SUGGESTED_QUESTIONS[topic] : [];

  const POSITIONS = ['✨ Thông điệp', '⬅️ Quá khứ', '🎯 Hiện tại', '🔮 Tương lai'];

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

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🌟</div>
            <h2 className="text-3xl font-bold text-white mb-4">Bạn tên là gì?</h2>
            <p className="text-purple-200 mb-8">Để vũ trụ có thể gửi thông điệp riêng cho bạn</p>
            <input
              className="w-full max-w-md mx-auto block px-6 py-4 rounded-2xl bg-white/10 border border-white/30 text-white placeholder-white/40 text-lg text-center focus:outline-none focus:border-yellow-400"
              placeholder="Nhập tên của bạn..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
            />
            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="btn-3d-yellow mt-6 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Tiếp tục →
            </button>
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
            <textarea
              className="w-full max-w-2xl mx-auto block px-5 py-4 rounded-2xl bg-white/10 border border-white/30 text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 resize-none"
              placeholder="Hoặc nhập câu hỏi của bạn..."
              rows={3}
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <div className="flex gap-4 justify-center mt-6">
              <button onClick={() => setStep(5)} className="btn-3d-yellow">Tiếp tục →</button>
              <button onClick={() => { setQuestion(''); setStep(5); }} className="btn-3d-white">Bỏ qua</button>
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
                    shuffle();
                    setStep(6);
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

        {/* Step 6: Draw + Result */}
        {step === 6 && !revealed && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Hãy chọn {cardCount} lá bài cho {name}
            </h2>
            <p className="text-purple-200 text-sm mb-6">
              Đã chọn: {selected.length}/{cardCount}
            </p>
            <div className="grid grid-cols-6 md:grid-cols-13 gap-1.5 max-w-3xl mx-auto">
              {shuffled.slice(0, 78).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectCard(idx)}
                  disabled={selected.includes(idx) || selected.length >= cardCount}
                  className={`aspect-[2/3] rounded-lg transition-all ${
                    selected.includes(idx)
                      ? 'bg-yellow-400 scale-110 shadow-lg shadow-yellow-400/50'
                      : 'bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 hover:-translate-y-1'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Revealed Result */}
        {step === 6 && revealed && (
          <div>
            {!user ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">🔮 Lá bài của {name} đã sẵn sàng!</h2>
                <p className="text-purple-200 mb-6">Đăng nhập để xem ý nghĩa đầy đủ từ vũ trụ</p>
                <button onClick={() => setPage('auth')} className="btn-3d-yellow">Đăng nhập để xem →</button>
              </div>
            ) : creditUsed ? (
              <div>
                <h2 className="text-2xl font-bold text-white text-center mb-8">🌟 Thông điệp cho {name}</h2>
                <div className={`grid gap-6 ${result.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>
                  {result.map((card, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                      <p className="text-yellow-400 text-sm font-semibold mb-3">{POSITIONS[result.length === 1 ? 0 : i + 1]}</p>
                      <img
                        src={card.image}
                        alt={card.name}
                        className={`w-32 mx-auto rounded-xl shadow-2xl mb-4 ${card.reversed ? 'rotate-180' : ''}`}
                        onError={e => (e.currentTarget.src = '/card-back.png')}
                      />
                      <h3 className="text-white font-bold text-lg mb-1">{card.name}</h3>
                      <p className="text-purple-300 text-xs mb-3">{card.reversed ? '🔄 Ngược' : '⬆️ Xuôi'}</p>
                      <p className="text-white/80 text-sm">{card.meanings?.[topic as keyof typeof card.meanings] || card.meanings?.general}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 justify-center mt-10">
                  <button onClick={reset} className="btn-3d-yellow">🔄 Trải bài mới</button>
                  <button onClick={() => setPage('shop')} className="btn-3d-white">🛍️ Khám phá shop</button>
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
