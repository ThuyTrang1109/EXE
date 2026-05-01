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

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedCard(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedCard(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            <div className="flex gap-4 mb-6">
              <img src={selectedCard.image} alt={selectedCard.name} className="w-24 rounded-xl shadow-lg"
                onError={e => (e.currentTarget.src = '/card-back.png')} />
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedCard.name}</h2>
                <p className="text-purple-500 text-sm">{selectedCard.arcana} Arcana</p>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(selectedCard.meanings || {}).map(([key, val]) => (
                <div key={key} className="bg-gradient-to-r from-yellow-50 to-purple-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-yellow-600 uppercase mb-1">{key}</p>
                  <p className="text-gray-700 text-sm">{val as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
