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
  getMyReadings: (page = 1, pageSize = 10) => request(`/tarot/readings?page=${page}&pageSize=${pageSize}`),

  // Shop / Products
  getProducts: (page = 1, pageSize = 12) => request(`/products?page=${page}&pageSize=${pageSize}`),
  getProductDetail: (id: number) => request(`/products/${id}`),
  getCategories: () => request('/products/categories'),

  // Orders
  createOrder: (data: any) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => request('/orders/my'),

  // Blog
  getBlogs: (page = 1) => request(`/blogs?page=${page}`),
  getBlogBySlug: (slug: string) => request(`/blogs/${slug}`),

  // NFC
  activateNfc: (data: any) => request('/nfc/activate', { method: 'POST', body: JSON.stringify(data) }),

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

  // Payments
  vnpayCreate: (orderId: string) => request(`/payments/vnpay/create/${orderId}`, { method: 'POST' }),

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
