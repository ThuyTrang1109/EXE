import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 text-center">
      <div className="max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <div className="text-8xl mb-6 animate-bounce">🌌</div>
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Lạc vào hư không...</h2>
        <p className="text-gray-600 mb-8">
          Có vẻ như vũ trụ đã chuyển hướng bạn đến một trang không tồn tại, hoặc lá bài này đã bị ẩn đi.
        </p>
        <button onClick={() => navigate('/')} className="btn-3d-yellow px-8 py-3 w-full font-bold">
          🏠 Quay lại thực tại (Trang chủ)
        </button>
      </div>
    </div>
  );
}
