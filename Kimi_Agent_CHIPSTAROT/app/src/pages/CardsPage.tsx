import { useState, useEffect } from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            ✨ Khám phá 78 lá bài Tarot
          </div>
          <h1 className="text-4xl font-black text-gray-800 mb-3">📖 Thư Viện Lá Bài Tarot</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Khám phá ý nghĩa 78 lá bài Tarot và ứng dụng trong cuộc sống</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 focus:border-yellow-400 focus:outline-none bg-white"
            placeholder="🔍 Tìm kiếm lá bài..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            {[{v:'all',l:'Tất cả'},{v:'Major',l:'Major Arcana'},{v:'Minor',l:'Minor Arcana'}].map(f => (
              <button key={f.v} onClick={() => setFilter(f.v)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${filter === f.v ? 'bg-yellow-400 text-white' : 'bg-white text-gray-600 hover:bg-yellow-50'}`}>
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl animate-bounce inline-block mb-4">🔮</div>
            <p className="text-gray-500 font-medium">Đang tải bộ bài Tarot...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map(card => (
              <button key={card.id} onClick={() => setSelectedCard(card)}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:-translate-y-2 hover:shadow-xl transition-all tarot-card">
                <div className="aspect-[2/3] bg-gradient-to-br from-purple-100 to-yellow-100 p-2">
                  <img src={card.image} alt={card.name}
                    className="w-full h-full object-cover rounded-xl"
                    onError={e => (e.currentTarget.src = '/card-back.png')} />
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2">{card.name}</p>
                  <p className="text-xs text-purple-500 mt-0.5">{card.arcana}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Premium Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 opacity-0 animate-[fadeIn_0.3s_forwards]" onClick={() => setSelectedCard(null)}>
          <div className="bg-white border border-gray-100 shadow-[0_0_50px_rgba(0,0,0,0.1)] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative flex flex-col scale-95 animate-[scaleIn_0.3s_forwards]" onClick={e => e.stopPropagation()}>
            {/* Header section with cover image background blur */}
            <div className="relative h-48 sm:h-56 w-full flex-shrink-0 overflow-hidden border-b border-gray-100">
               <div className="absolute inset-0 bg-cover bg-center blur-xl opacity-30 scale-110" style={{ backgroundImage: `url(${selectedCard.image || '/card-back.png'})` }}></div>
               <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
               <button onClick={() => setSelectedCard(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 bg-white/50 hover:bg-white/80 w-8 h-8 rounded-full flex items-center justify-center transition-all z-20 shadow-sm">&times;</button>
               
               <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex items-end gap-5 sm:gap-6 z-10">
                 <div className="relative group">
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-xl blur-md group-hover:bg-yellow-400/40 transition-all duration-500"></div>
                    <img src={selectedCard.image} alt={selectedCard.name} className="w-24 sm:w-32 rounded-xl shadow-lg border-2 border-white relative z-10 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2" onError={e => (e.currentTarget.src = '/card-back.png')} />
                 </div>
                 <div className="pb-1 sm:pb-2">
                   <h2 className="text-3xl sm:text-4xl font-black text-gray-800 drop-shadow-sm">{selectedCard.name}</h2>
                   <p className="text-purple-600 font-bold mt-1 tracking-wider uppercase text-xs sm:text-sm">{selectedCard.arcana} Arcana</p>
                 </div>
               </div>
            </div>

            {/* Content section */}
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
                  <div key={key} className="bg-gray-50 hover:bg-yellow-50/50 transition-colors border border-gray-100 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getIcon(key)}</span>
                      <h3 className="text-xs sm:text-sm font-bold text-yellow-600 uppercase tracking-widest">{key}</h3>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{val as string}</p>
                  </div>
                );
              })}
            </div>
            
            {/* Custom scrollbar & animation styles */}
            <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.02); }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.15); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); }
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes scaleIn { from { transform: scale(0.95); } to { transform: scale(1); } }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
