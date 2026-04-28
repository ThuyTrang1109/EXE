export default function NotFoundPage({ setPage }: { setPage: (p: any) => void }) {
  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-purple-900 via-purple-800 to-yellow-900 flex items-center justify-center p-4 text-center">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 max-w-lg w-full shadow-2xl border border-white/20 text-white">
        <div className="text-8xl mb-6 animate-bounce">🌌</div>
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Lạc vào hư không...</h2>
        <p className="text-white/70 mb-8">
          Có vẻ như vũ trụ đã chuyển hướng bạn đến một trang không tồn tại, hoặc lá bài này đã bị ẩn đi.
        </p>
        <button onClick={() => setPage('home')} className="btn-3d-yellow px-8 py-3 w-full font-bold">
          🏠 Quay lại thực tại (Trang chủ)
        </button>
      </div>
    </div>
  );
}
