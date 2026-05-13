import { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Search, Loader2 } from 'lucide-react';

interface TarotCard {
  id: number;
  name: string;
  arcana: string;
  image?: string;
  meanings: Record<string, string>;
}

function useTarotData() {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/tarot_database.json')
      .then(r => r.json())
      .then(d => { setCards(d.cards); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  return { cards, loading };
}

export default function CardsPage() {
  const { cards, loading } = useTarotData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

  useEffect(() => {
    if (selectedCard) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedCard]);

  const filtered = cards.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.arcana?.toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" /> Khám phá 78 lá bài Tarot
          </div>
          <h1 className="text-4xl font-black text-white mb-3 flex justify-center items-center gap-3">
            <BookOpen className="w-10 h-10 text-white" /> Thư Viện Lá Bài Tarot
          </h1>
          <p className="text-purple-200 max-w-xl mx-auto">Khám phá ý nghĩa 78 lá bài Tarot và ứng dụng trong cuộc sống</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-purple-300/50" />
            <input
              className="w-full pl-11 pr-5 py-3 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md text-white placeholder-white/30 focus:border-yellow-400/50 focus:outline-none focus:bg-white/[0.09] transition-all"
              placeholder="Tìm kiếm lá bài..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {[{v:'all',l:'Tất cả'},{v:'Major',l:'Major Arcana'},{v:'Minor',l:'Minor Arcana'}].map(f => (
              <button key={f.v} onClick={() => setFilter(f.v)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${filter === f.v ? 'bg-yellow-400 text-purple-900' : 'bg-white/[0.06] backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'}`}>
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block mb-4">
              <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto drop-shadow-xl" />
            </div>
            <p className="text-purple-200 font-medium">Đang tải bộ bài Tarot...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map(card => (
              <button key={card.id} onClick={() => setSelectedCard(card)}
                className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(139,92,246,0.3)] hover:border-purple-400/40 transition-all tarot-card">
                <div className="aspect-[2/3] bg-gradient-to-br from-purple-900/50 to-indigo-900/50 p-2">
                  <img src={card.image} alt={card.name}
                    className="w-full h-full object-cover rounded-xl"
                    onError={e => (e.currentTarget.src = '/card-back.png')} />
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs font-semibold text-white/90 line-clamp-2">{card.name}</p>
                  <p className="text-xs text-purple-300/60 mt-0.5">{card.arcana}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Premium Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 opacity-0 animate-[fadeIn_0.3s_forwards]" onClick={() => setSelectedCard(null)}>
          <div className="bg-[#0d0d2b]/95 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.2)] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative flex flex-col scale-95 animate-[scaleIn_0.3s_forwards]" onClick={e => e.stopPropagation()}>
            <div className="relative h-48 sm:h-56 w-full flex-shrink-0 overflow-hidden border-b border-white/10">
               <div className="absolute inset-0 bg-cover bg-center blur-xl opacity-30 scale-110" style={{ backgroundImage: `url(${selectedCard.image || '/card-back.png'})` }}></div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d2b] via-[#0d0d2b]/60 to-transparent"></div>
               <button onClick={() => setSelectedCard(null)} className="absolute top-4 right-4 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-all z-20">&times;</button>
               
               <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex items-end gap-5 sm:gap-6 z-10">
                 <div className="relative group">
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-xl blur-md group-hover:bg-yellow-400/40 transition-all duration-500"></div>
                    <img src={selectedCard.image} alt={selectedCard.name} className="w-24 sm:w-32 rounded-xl shadow-lg border-2 border-white/20 relative z-10 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2" onError={e => (e.currentTarget.src = '/card-back.png')} />
                 </div>
                 <div className="pb-1 sm:pb-2">
                   <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-sm">{selectedCard.name}</h2>
                   <p className="text-yellow-400/80 font-bold mt-1 tracking-wider uppercase text-xs sm:text-sm">{selectedCard.arcana} Arcana</p>
                 </div>
               </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {Object.entries(selectedCard.meanings || {}).map(([key, val]) => {
                const getIcon = (k: string) => {
                  const upperK = k.toUpperCase();
                  if(upperK.includes('GENERAL')) return '✨';
                  if(upperK.includes('LOVE') || upperK.includes('MARRIAGE')) return '❤️';
                  if(upperK.includes('CAREER') || upperK.includes('WORK')) return '💼';
                  if(upperK.includes('STUDY') || upperK.includes('EDUCATION')) return '📚';
                  if(upperK.includes('HEALTH')) return '🌿';
                  if(upperK.includes('FINANCE') || upperK.includes('MONEY')) return '💰';
                  return '🔮';
                };
                
                return (
                  <div key={key} className="bg-white/[0.05] hover:bg-white/[0.09] transition-colors border border-white/10 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getIcon(key)}</span>
                      <h3 className="text-xs sm:text-sm font-bold text-yellow-400 uppercase tracking-widest">{key}</h3>
                    </div>
                    <p className="text-white/80 text-sm sm:text-base leading-relaxed">{val as string}</p>
                  </div>
                );
              })}
            </div>
            
            <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes scaleIn { from { transform: scale(0.95); } to { transform: scale(1); } }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
