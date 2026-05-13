import { useNavigate } from 'react-router-dom';

export default function CartPage({ cart, updateQty, removeFromCart, total }: any) {
  const navigate = useNavigate();

  if (cart.length === 0) return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="text-center bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-3xl p-10 max-w-md">
        <div className="text-8xl mb-6 drop-shadow-xl">🛒</div>
        <h2 className="text-2xl font-bold text-white mb-4">Giỏ hàng của bạn đang trống</h2>
        <p className="text-purple-200/60 mb-8">Khám phá shop để tìm những sản phẩm phong thủy tuyệt vời!</p>
        <button onClick={() => navigate('/shop')} className="btn-3d-yellow">🛍️ Mua sắm ngay</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 drop-shadow-md">🛒 Giỏ Hàng ({cart.reduce((s: number, c: any) => s + c.qty, 0)} sản phẩm)</h1>
        <div className="space-y-4 mb-8">
          {cart.map((item: any) => (
            <div key={item.id} className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl p-6 flex gap-4 hover:bg-white/[0.09] transition-colors">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" onError={e => (e.currentTarget.src = '/hero-main.jpg')} />
              <div className="flex-1">
                <h3 className="font-bold text-white">{item.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-red-400">{item.price.toLocaleString()}đ</span>
                  {item.oldPrice && <span className="text-white/30 line-through text-sm">{item.oldPrice.toLocaleString()}đ</span>}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center">-</button>
                  <span className="font-medium w-8 text-center text-white">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center">+</button>
                  <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-400 hover:text-red-300 text-sm">Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white/60">Tạm tính:</span>
            <span className="text-xl font-bold text-white">{total.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-white/60">Phí vận chuyển:</span>
            <span className="text-green-400 font-medium">Miễn phí</span>
          </div>
          <div className="flex justify-between items-center mb-6 pt-4 border-t border-white/10">
            <span className="text-lg font-bold text-white">Tổng cộng:</span>
            <span className="text-2xl font-bold text-red-400">{total.toLocaleString()}đ</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-3d-yellow w-full">🔐 Tiến Hành Thanh Toán</button>
          <button onClick={() => navigate('/shop')} className="w-full mt-3 py-3 text-white/40 hover:text-white/70 text-sm">← Tiếp tục mua sắm</button>
        </div>
      </div>
    </div>
  );
}
