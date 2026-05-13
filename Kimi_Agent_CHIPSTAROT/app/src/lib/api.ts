// Client API for ChipStarot .NET Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5096/api';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('chipstarot_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  } as any;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

export const api = {
  // Auth
  login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data: any) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email: string) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data: any) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  refreshToken: (data: any) => request('/auth/refresh-token', { method: 'POST', body: JSON.stringify(data) }),
  logout: (data: any) => request('/auth/logout', { method: 'POST', body: JSON.stringify(data) }),

  // Profile & RBAC — /me trả về role + permissions (RBAC.md Sec.6)
  getMe: () => request('/profile/me'),
  getProfile: () => request('/profile'),
  updateProfile: (data: any) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  feedPet: (foodAmount: number) => request('/profile/pet/feed', { method: 'POST', body: JSON.stringify({ foodAmount }) }),
  claimPetReward: (level: number) => request('/profile/pet/claim-reward', { method: 'POST', body: JSON.stringify({ level }) }),
  hatchPet: () => request('/profile/pet/hatch', { method: 'POST' }),

  // Tarot
  getCards: () => request('/tarot/cards'),
  startReading: (data: any) => request('/tarot/readings', { method: 'POST', body: JSON.stringify(data) }),
  getMyReadings: (page = 1, pageSize = 10) => request(`/tarot/readings/my?page=${page}&pageSize=${pageSize}`),
  getReadingById: (id: string) => request(`/tarot/readings/${id}`),
  rateReading: (readingId: string, rating: number) => request('/tarot/readings/rate', { method: 'POST', body: JSON.stringify({ readingId, rating }) }),
  saveReading: (readingId: string, isSaved: boolean) => request('/tarot/readings/save', { method: 'POST', body: JSON.stringify({ readingId, isSaved }) }),
  // Admin Tarot Cards
  createTarotCard: (data: any) => request('/tarot/cards', { method: 'POST', body: JSON.stringify(data) }),
  updateTarotCard: (id: number, data: any) => request(`/tarot/cards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTarotCard: (id: number) => request(`/tarot/cards/${id}`, { method: 'DELETE' }),

  // Shop / Products
  getProducts: (page = 1, pageSize = 12) => request(`/products?page=${page}&pageSize=${pageSize}`),
  getProductDetail: (id: number) => request(`/products/${id}`),
  getCategories: () => request('/products/categories'),

  // Cart (Backend-synced)
  getCart: () => request('/cart'),
  addToCart: (productId: number, quantity = 1) => request('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (productId: number, quantity: number) => request('/cart/items', { method: 'PUT', body: JSON.stringify({ productId, quantity }) }),
  removeFromCart: (productId: number) => request(`/cart/items/${productId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),

  // Orders
  createOrder: (data: any) => request('/orders/checkout', { method: 'POST', body: JSON.stringify(data) }), // FIX: was /orders
  getMyOrders: (page = 1, pageSize = 10) => request(`/orders/my?page=${page}&pageSize=${pageSize}`), // FIX: was /orders/my (no params)

  // Blog
  getBlogs: (page = 1, pageSize = 10) => request(`/blogs?page=${page}&pageSize=${pageSize}`),
  getBlogBySlug: (slug: string) => request(`/blogs/${slug}`),
  // Admin Blog CRUD
  getAdminBlogs: (page = 1, pageSize = 20) => request(`/blogs/admin?page=${page}&pageSize=${pageSize}`),
  createBlog: (data: any) => request('/blogs', { method: 'POST', body: JSON.stringify(data) }),
  updateBlog: (id: number, data: any) => request(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlog: (id: number) => request(`/blogs/${id}`, { method: 'DELETE' }),

  // NFC
  activateNfc: (data: any) => request('/nfc/scan', { method: 'POST', body: JSON.stringify(data) }),
  getMyNfcChips: () => request('/nfc/my-chips'),
  // Admin NFC
  generateNfcChip: (data: any) => request('/nfc/generate', { method: 'POST', body: JSON.stringify(data) }),
  bulkGenerateNfc: (data: any) => request('/nfc/bulk-generate', { method: 'POST', body: JSON.stringify(data) }),
  getAllNfcChips: () => request('/nfc/all'),

  // Tarot Packages
  getTarotPackages: () => request('/tarot/packages'),
  purchaseTarotPackage: (packageId: string) => request('/tarot/packages/purchase', { method: 'POST', body: JSON.stringify({ packageId }) }),

  // RBAC Admin
  getRbacMatrix: () => request('/rbac'),
  togglePermission: (roleId: number, permissionId: number) => request('/rbac/toggle', { 
    method: 'POST', 
    body: JSON.stringify({ roleId, permissionId }) 
  }),

  // Vouchers
  getVouchers: () => request('/vouchers'),
  createVoucher: (data: any) => request('/vouchers', { method: 'POST', body: JSON.stringify(data) }),
  updateVoucher: (id: number, data: any) => request(`/vouchers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVoucher: (id: number) => request(`/vouchers/${id}`, { method: 'DELETE' }),
  validateVoucher: (code: string, orderAmount: number) => request(`/vouchers/validate?code=${encodeURIComponent(code)}&orderAmount=${orderAmount}`),

  // Payments (VNPay)
  vnpayCreate: (orderId: string) => request(`/payments/vnpay/create/${orderId}`, { method: 'POST' }),
  // Note: vnpay/callback và vnpay/ipn được VNPAY gọi trực tiếp, không cần gọi từ FE
  // Tuy nhiên FE cần đọc query params từ URL khi user được redirect về từ VNPAY
  getOrderById: (id: string) => request(`/orders/${id}`),

  // Admin & Inventory
  getAdminStats: () => request('/admin/dashboard'),
  getRevenueChart: (days = 30) => request(`/admin/revenue-chart?days=${days}`),
  
  // Admin Customers
  getCustomers: (page = 1, pageSize = 20) => request(`/admin/customers?page=${page}&pageSize=${pageSize}`),
  updateCustomerStatus: (id: string, status: string) => request(`/admin/customers/${id}/status`, { 
    method: 'PUT', 
    body: JSON.stringify({ status }) 
  }),
  grantCredits: (accountId: string, amount: number) => request('/admin/grant-credits', {
    method: 'POST',
    body: JSON.stringify({ accountId, amount })
  }),

  // Admin Orders
  getAllOrders: (page = 1, pageSize = 20, status?: string) => 
    request(`/admin/orders?page=${page}&pageSize=${pageSize}${status ? `&status=${status}` : ''}`),
  updateOrderStatus: (id: string, status: string, note?: string) => request(`/admin/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, note })
  }),

  // Admin Inventory
  getInventoryLogs: (page = 1, pageSize = 20, productId?: number | null) => 
    request(`/admin/inventory/logs?page=${page}&pageSize=${pageSize}${productId ? `&productId=${productId}` : ''}`),
  adjustInventory: (data: any) => request('/admin/inventory/adjust', { method: 'POST', body: JSON.stringify(data) }),
  
  // Admin NFC & Settings
  getNfcOverview: () => request('/admin/nfc-overview'),
  getSettings: () => request('/admin/settings'),
  updateSetting: (key: string, value: string) => request(`/admin/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value })
  }),
};
