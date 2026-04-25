export default function CartPage({ cart, updateQty, removeFromCart, total, setPage }: any) {
  if (cart.length === 0) return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 flex items-center justify-center py-12 px-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-600 mb-8">Khám phá shop để tìm những sản phẩm phong thủy tuyệt vời!</p>
        <button onClick={() => setPage('shop')} className="btn-3d-yellow">🛍️ Mua sắm ngay</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🛒 Giỏ Hàng ({cart.reduce((s: number, c: any) => s + c.qty, 0)} sản phẩm)</h1>
        <div className="space-y-4 mb-8">
          {cart.map((item: any) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 flex gap-4">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" onError={e => (e.currentTarget.src = '/hero-main.jpg')} />
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-red-500">{item.price.toLocaleString()}đ</span>
                  <span className="text-gray-400 line-through text-sm">{item.oldPrice.toLocaleString()}đ</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">-</button>
                  <span className="font-medium w-8 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">+</button>
                  <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500 hover:text-red-700 text-sm">Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="text-xl font-bold">{total.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span className="text-green-600 font-medium">Miễn phí</span>
          </div>
          <div className="flex justify-between items-center mb-6 pt-4 border-t">
            <span className="text-lg font-bold">Tổng cộng:</span>
            <span className="text-2xl font-bold text-red-500">{total.toLocaleString()}đ</span>
          </div>
          <button onClick={() => setPage('checkout')} className="btn-3d-yellow w-full">🔐 Tiến Hành Thanh Toán</button>
          <button onClick={() => setPage('shop')} className="w-full mt-3 py-3 text-gray-500 hover:text-gray-700 text-sm">← Tiếp tục mua sắm</button>
        </div>
      </div>
    </div>
  );
}
