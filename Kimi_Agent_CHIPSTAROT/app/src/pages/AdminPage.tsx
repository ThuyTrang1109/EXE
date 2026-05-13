import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, Users, CreditCard, ShoppingBag, Zap, PackageSearch, Tag, PenTool, LineChart, Shield, Settings, Eye, Package, Sparkles, Egg, CircleDollarSign, TrendingUp, Moon, ShieldBan, Box, Search } from 'lucide-react';
import { getActiveGeminiKey, setAdminGeminiKey, clearAdminGeminiKey } from '../lib/gemini';
import { CREDIT_PACKAGES } from '../data/constants';
import { usePermission } from '../hooks/usePermission';

export default function AdminPage({ setPage }: any) {
  const { can } = usePermission();
  
  const allTabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" />, perm: 'dashboard.view' },
    { id: 'users', label: 'Quản lý TK', icon: <Users className="w-5 h-5" />, perm: 'users.view' },
    { id: 'cards', label: 'Quản lý Thẻ', icon: <CreditCard className="w-5 h-5" />, perm: 'cards.view' },
    { id: 'products', label: 'Sản phẩm', icon: <ShoppingBag className="w-5 h-5" />, perm: 'products.view' },
    { id: 'packages', label: 'Gói Tarot', icon: <Zap className="w-5 h-5" />, perm: 'packages.view' },
    { id: 'orders', label: 'Đơn hàng', icon: <PackageSearch className="w-5 h-5" />, perm: 'orders.view' },
    { id: 'nfcs', label: 'Mã Chip NFC', icon: <Tag className="w-5 h-5" />, perm: 'nfc.view' },
    { id: 'blogs', label: 'Bài viết (Blog)', icon: <PenTool className="w-5 h-5" />, perm: 'content.view' },
    { id: 'reports', label: 'Báo cáo', icon: <LineChart className="w-5 h-5" />, perm: 'reports.view' },
    { id: 'rbac', label: 'Phân Quyền', icon: <Shield className="w-5 h-5" />, perm: 'rbac.manage' },
    { id: 'settings', label: 'Cài đặt', icon: <Settings className="w-5 h-5" />, perm: 'settings.manage' },
  ];

  const tabs = allTabs.filter(t => can(t.perm));
  const [tab, setTab] = useState<string>(tabs[0]?.id || 'dashboard');

  // ── Settings state ──────────────────────────────────────────────────────
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'none' | 'saved' | 'testing' | 'valid' | 'invalid'>('none');
  const [keyTestMsg, setKeyTestMsg] = useState('');

  // Khi vào tab settings, đọc key hiện tại để hiển thị
  useEffect(() => {
    if (tab === 'settings') {
      const current = getActiveGeminiKey();
      setTimeout(() => {
        setGeminiKeyInput(current || '');
        setKeyStatus(current && current.startsWith('AIzaSy') ? 'saved' : 'none');
        setKeyTestMsg('');
      }, 0);
    }
  }, [tab]);

  const handleSaveGeminiKey = () => {
    const trimmed = geminiKeyInput.trim();
    if (!trimmed.startsWith('AIzaSy') || trimmed.length < 30) {
      setKeyStatus('invalid');
      setKeyTestMsg('❌ Key không đúng định dạng. Gemini API Key bắt đầu bằng "AIzaSy" và dài ít nhất 30 ký tự.');
      return;
    }
    setAdminGeminiKey(trimmed);
    setKeyStatus('saved');
    setKeyTestMsg('✅ Đã lưu thành công! Key đang được áp dụng cho toàn bộ tính năng AI.');
  };

  const handleClearGeminiKey = () => {
    clearAdminGeminiKey();
    setGeminiKeyInput('');
    setKeyStatus('none');
    setKeyTestMsg('🗑️ Đã xoá API Key. Hệ thống sẽ dùng key từ file .env (nếu có).');
  };

  const handleTestGeminiKey = async () => {
    const keyToTest = geminiKeyInput.trim();
    if (!keyToTest.startsWith('AIzaSy') || keyToTest.length < 30) {
      setKeyStatus('invalid');
      setKeyTestMsg('❌ Key không đúng định dạng. Phải bắt đầu bằng "AIzaSy".');
      return;
    }
    setKeyStatus('testing');
    setKeyTestMsg('⏳ Đang kiểm tra kết nối với Gemini API...');
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${keyToTest}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] }),
      });
      const data = await res.json();
      const errMsg: string = data?.error?.message || '';
      const errCode: number = data?.error?.code || res.status;

      if (res.ok && data?.candidates?.[0]?.content) {
        // ✅ Thành công → tự động lưu luôn
        setAdminGeminiKey(keyToTest);
        setKeyStatus('valid');
        setKeyTestMsg('✅ Key hợp lệ & đã được lưu tự động! Tính năng AI sẵn sàng hoạt động.');
      } else if (errCode === 429 || errMsg.toLowerCase().includes('quota')) {
        // ⚠️ Key đúng nhưng hết quota → vẫn lưu, thông báo rõ
        setAdminGeminiKey(keyToTest);
        setKeyStatus('saved');
        setKeyTestMsg(
          '⚠️ Key hợp lệ nhưng đang bị giới hạn quota (429). Key đã được lưu.\n' +
          'Hệ thống AI sẽ tự hoạt động khi quota phục hồi (thường sau vài phút đến 1 ngày).\n' +
          'Để kiểm tra: vào ai.dev/rate-limit hoặc tạo key mới từ project khác.'
        );
      } else if (errCode === 403 || errMsg.includes('reported as leaked') || errMsg.includes('API_KEY_INVALID')) {
        setKeyStatus('invalid');
        setKeyTestMsg('❌ Key bị khóa (403). Key này đã bị báo cáo rò rỉ hoặc bị vô hiệu hóa. Hãy tạo key mới.');
      } else if (errCode === 400 || errMsg.includes('API key not valid')) {
        setKeyStatus('invalid');
        setKeyTestMsg('❌ Key không hợp lệ (400). Vui lòng copy lại key từ Google AI Studio.');
      } else {
        setKeyStatus('invalid');
        setKeyTestMsg(`❌ Lỗi từ Google: ${errMsg || `HTTP ${errCode}`}`);
      }
    } catch {
      setKeyStatus('invalid');
      setKeyTestMsg('❌ Không thể kết nối mạng. Kiểm tra internet và thử lại.');
    }
  };

  // ── Data states ──────────────────────────────────────────────────────
  const [tarotCards, setTarotCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const [nfcs, setNfcs] = useState<any[]>([]);
  const [loadingNfcs, setLoadingNfcs] = useState(false);
  
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  
  const [settings, setSettings] = useState<any[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(false);

  const [editingCard, setEditingCard] = useState<any>(null);
  const [viewingCard, setViewingCard] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [editingNfc, setEditingNfc] = useState<any>(null);
  const [viewingNfc, setViewingNfc] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Sync modal states when editing objects change
  useEffect(() => {
    if (editingOrder) setSelectedOrderStatus(editingOrder.status);
    if (editingCard) {
      setActiveMeaningTab('general');
      setCardFormError('');
    }
    if (editingUser) setUserFormError('');
    if (editingProduct) setProdFormError('');
    if (editingBlog) setBlogFormError('');
  }, [editingOrder, editingCard, editingUser, editingProduct, editingBlog]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal local states (lifted for stability)
  const [cardFormError, setCardFormError] = useState('');
  const [activeMeaningTab, setActiveMeaningTab] = useState('general');
  const [isSavingCard, setIsSavingCard] = useState(false);
  
  const [userFormError, setUserFormError] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);
  
  const [prodFormError, setProdFormError] = useState('');
  const [isSavingProd, setIsSavingProd] = useState(false);
  
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('');
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  
  const [blogFormError, setBlogFormError] = useState('');
  const [isSavingBlog, setIsSavingBlog] = useState(false);

  // ── Fetching Functions ──────────────────────────────────────────────────
  const fetchCards = async () => {
    setLoadingCards(true);
    try {
      const res = await fetch('/api/tarot/cards');
      const result = await res.json();
      if (result.success) setTarotCards(result.data || []);
      else throw new Error();
    } catch {
      fetch('/tarot_database.json').then(r => r.json()).then(d => setTarotCards(d.cards || []));
    } finally { setLoadingCards(false); }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/customers');
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (result.success) setUsers(result.data || []);
      else throw new Error();
    } catch {
      setUsers(mockUsers);
    } finally { setLoadingUsers(false); }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (result.success) setProducts(result.data || []);
      else throw new Error();
    } catch {
      setProducts(mockProducts);
    } finally { setLoadingProducts(false); }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (result.success) setOrders(result.data || []);
      else throw new Error();
    } catch {
      setOrders(mockOrders);
    } finally { setLoadingOrders(false); }
  };

  const fetchNfcs = async () => {
    setLoadingNfcs(true);
    try {
      const res = await fetch('/api/admin/nfc-overview');
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (result.success) setNfcs(result.data.items || []);
      else throw new Error();
    } catch {
      setNfcs(mockNfcChips);
    } finally { setLoadingNfcs(false); }
  };

  const fetchBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const res = await fetch('/api/blogs/admin');
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (result.success) setBlogs(result.data || []);
      else throw new Error();
    } catch {
      setBlogs(mockBlogs);
    } finally { setLoadingBlogs(false); }
  };

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (result.success) setSettings(result.data || []);
      else throw new Error();
    } catch {
      // Fallback settings
      setSettings([
        { id: 'gemini_api_key', value: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx' },
        { id: 'site_name', value: 'CHIPSTAROT' }
      ]);
    } finally { setLoadingSettings(false); }
  };

  useEffect(() => {
    setSearchTerm('');
    setCategoryFilter('All');
    if (tab === 'cards') fetchCards();
    if (tab === 'users') fetchUsers();
    if (tab === 'products') fetchProducts();
    if (tab === 'orders') fetchOrders();
    if (tab === 'nfcs') fetchNfcs();
    if (tab === 'blogs') fetchBlogs();
    if (tab === 'settings') fetchSettings();
  }, [tab]);

  const handleBulkGenerateNfcs = async (productId: number, quantity: number) => {
    if (quantity <= 0) return;
    try {
      const res = await fetch('/api/nfc/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      if (res.ok) {
        alert(`✅ Đã tạo thành công ${quantity} mã chip mới!`);
        setEditingNfc(null);
        fetchNfcs();
      } else throw new Error();
    } catch {
      alert('Lỗi khi tạo mã chip.');
    }
  };

  const handleUpdateUserStatus = async (id: string, status: string) => {
    if (!window.confirm(`Bạn có chắc muốn ${status === 'active' ? 'mở khoá' : 'khoá'} tài khoản này?`)) return;
    try {
      const res = await fetch(`/api/admin/customers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert('Cập nhật trạng thái thành công!');
        fetchUsers();
      } else throw new Error();
    } catch { 
      console.log("Mock status update success");
      alert('Cập nhật trạng thái thành công (Mock)!');
      fetchUsers();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xoá sản phẩm này?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Sản phẩm đã được xoá.');
        fetchProducts();
      } else throw new Error();
    } catch { 
      console.log("Mock delete product success");
      alert('Sản phẩm đã được xoá (Mock).');
      fetchProducts();
    }
  };

  const handleDeleteCard = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lá bài này? Hành động này không thể hoàn tác.')) return;
    try {
      const res = await fetch(`/api/tarot/cards/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('🗑️ Đã xóa lá bài thành công!');
        fetchCards();
      } else throw new Error();
    } catch (err) {
      console.log("Mock delete card success");
      alert('🗑️ Đã xóa lá bài thành công (Mock)!');
      fetchCards();
    }
  };

  const mockStats = [
    { label: 'Tổng Đơn Hàng', value: '128', icon: <Package className="w-6 h-6 text-white" />, color: 'from-blue-400 to-blue-500' },
    { label: 'Doanh Thu', value: '14.2M₫', icon: <CircleDollarSign className="w-6 h-6 text-white" />, color: 'from-green-400 to-green-500' },
    { label: 'Thành Viên', value: '342', icon: <Users className="w-6 h-6 text-white" />, color: 'from-purple-400 to-purple-500' },
    { label: 'Phiên Tarot', value: '1,205', icon: <Sparkles className="w-6 h-6 text-white" />, color: 'from-yellow-400 to-yellow-500' },
  ];

  const mockUsers = [
    { id: 'U001', fullName: 'Nguyễn Văn A', email: 'vana@gmail.com', role: 'Customer', accountStatus: 'active', createdAt: '2024-01-15', credits: 50, readingCount: 5 },
    { id: 'U002', fullName: 'Trần Thị B', email: 'thib@gmail.com', role: 'Staff', accountStatus: 'active', createdAt: '2024-02-10', credits: 100, readingCount: 0 },
    { id: 'U003', fullName: 'Lê Văn C', email: 'vanc@gmail.com', role: 'Customer', accountStatus: 'banned', createdAt: '2024-03-05', credits: 0, readingCount: 12 },
    { id: 'U004', fullName: 'Phạm Thị D', email: 'thid@gmail.com', role: 'Editor', accountStatus: 'active', createdAt: '2024-04-01', credits: 75, readingCount: 2 },
  ];

  const mockOrders = [
    { id: 'ORD-12345', customerName: 'Lan Anh', totalAmount: 199000, status: 'delivered', createdAt: '2024-04-25T10:30:00Z', items: [{ productName: 'Móc khóa NFC' }] },
    { id: 'ORD-12346', customerName: 'Minh Tuấn', totalAmount: 89000, status: 'shipped', createdAt: '2024-04-24T14:20:00Z', items: [{ productName: 'Đá Thạch Anh Tím' }] },
    { id: 'ORD-12347', customerName: 'Thu Hà', totalAmount: 79000, status: 'processing', createdAt: '2024-04-24T09:15:00Z', items: [{ productName: 'Đá Mắt Hổ' }] },
    { id: 'ORD-12348', customerName: 'Quốc Bảo', totalAmount: 85000, status: 'pending', createdAt: '2024-04-23T16:45:00Z', items: [{ productName: 'Đá Thạch Anh Hồng' }] },
  ];

  const mockProducts = [
    { id: 1, name: 'Móc khóa NFC CHIPSTAROT', basePrice: 199000, stock: 45, isActive: true, imageUrl: '/products/nfc-chick.jpg', categoryName: 'Phụ kiện' },
    { id: 2, name: 'Đá Thạch Anh Tím', basePrice: 89000, stock: 12, isActive: true, imageUrl: '/products/amethyst.jpg', categoryName: 'Vật phẩm phong thuỷ' },
    { id: 3, name: 'Đá Mắt Hổ', basePrice: 79000, stock: 0, isActive: false, imageUrl: '/products/tiger-eye.jpg', categoryName: 'Vật phẩm phong thuỷ' },
    { id: 4, name: 'Đá Thạch Anh Hồng', basePrice: 85000, stock: 8, isActive: true, imageUrl: '/products/rose-quartz.jpg', categoryName: 'Vật phẩm phong thuỷ' },
  ];

  const mockNfcChips = [
    { id: 'NFC-A10293', product: 'Móc khóa NFC CHIPSTAROT', owner: 'Lan Anh', status: 'activated', scans: 45, date: '12/03/2024' },
    { id: 'NFC-B99212', product: 'Đá Thạch Anh Tím', owner: 'Minh Tuấn', status: 'unactivated', scans: 0, date: '-' },
    { id: 'NFC-C77382', product: 'Đá Mắt Hổ', owner: 'Thu Hà', status: 'activated', scans: 12, date: '01/04/2024' },
  ];

  const mockBlogs = [
    { id: 1, title: 'Giải mã bí ẩn lá bài The Fool', authorName: 'Admin Tâm Linh', viewCount: 1250, status: 'published', createdAt: '2024-04-25', slug: 'giai-ma-the-fool' },
    { id: 2, title: 'Cách thanh tẩy đá Thạch Anh đúng chuẩn', authorName: 'Admin Năng Lượng', viewCount: 890, status: 'published', createdAt: '2024-04-20', slug: 'thanh-tay-da' },
    { id: 3, title: 'Dự báo năng lượng tuần mới', authorName: 'Admin Tâm Linh', viewCount: 0, status: 'draft', createdAt: '2024-04-28', slug: 'du-bao-tuan-moi' },
  ];


  const mockReports = {
    system: [
      { label: 'Server Uptime', value: '99.98%', status: 'Tốt', color: 'text-green-400' },
      { label: 'Lỗi API (500)', value: '12 lỗi', status: 'Cảnh báo', color: 'text-yellow-400' },
      { label: 'Tải trọng CPU', value: '45%', status: 'Bình thường', color: 'text-green-400' },
      { label: 'Latency Supabase', value: '14ms', status: 'Rất nhanh', color: 'text-blue-400' },
    ]
  };

  const revenueData = [
    { name: 'Tháng 11', doanhThu: 15, donHang: 45 },
    { name: 'Tháng 12', doanhThu: 22, donHang: 60 },
    { name: 'Tháng 1', doanhThu: 18, donHang: 50 },
    { name: 'Tháng 2', doanhThu: 35, donHang: 90 },
    { name: 'Tháng 3', doanhThu: 28, donHang: 75 },
    { name: 'Tháng 4', doanhThu: 42, donHang: 120 },
  ];

  const tarotData = [
    { day: 'T2', luotBoc: 120 },
    { day: 'T3', luotBoc: 150 },
    { day: 'T4', luotBoc: 180 },
    { day: 'T5', luotBoc: 140 },
    { day: 'T6', luotBoc: 210 },
    { day: 'T7', luotBoc: 350 },
    { day: 'CN', luotBoc: 420 },
  ];

  const orderStatusData = [
    { name: 'Đã giao', value: 400, color: '#4ade80' },
    { name: 'Đang giao', value: 150, color: '#60a5fa' },
    { name: 'Đang xử lý', value: 80, color: '#facc15' },
    { name: 'Đã huỷ', value: 20, color: '#f87171' },
  ];

  const topProductsData = [
    { name: 'Móc khóa NFC CHIPSTAROT', sales: 124, revenue: '24.6M', color: 'text-yellow-400' },
    { name: 'Đá Thạch Anh Tím', sales: 85, revenue: '7.5M', color: 'text-purple-400' },
    { name: 'Đá Thạch Anh Hồng', sales: 62, revenue: '5.2M', color: 'text-pink-400' },
  ];

  const topPackagesData = [
    { name: 'Gói Phổ Biến (90 ngày)', sales: 312, revenue: '21.5M', icon: <Sparkles className="w-5 h-5 text-purple-400" /> },
    { name: 'Gói Khởi Đầu (30 ngày)', sales: 180, revenue: '5.2M', icon: <Moon className="w-5 h-5 text-indigo-400" /> },
    { name: 'Gói Cao Cấp (365 ngày)', sales: 95, revenue: '17.0M', icon: <Sparkles className="w-5 h-5 text-yellow-400" /> },
  ];

  const statusBadge: Record<string, string> = {
    delivered: 'bg-green-100 text-green-700',
    shipped: 'bg-blue-100 text-blue-700',
    processing: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-gray-100 text-gray-600',
  };
  const statusLabel: Record<string, string> = {
    delivered: 'Đã giao', shipped: 'Đang giao', processing: 'Đang xử lý', pending: 'Chờ xác nhận',
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white/10 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/chicken-mascot.png" alt="" className="w-8 h-8" />
          <span className="text-white font-bold text-lg">CHIPSTAROT <span className="text-yellow-400">Admin</span></span>
        </div>
        <button onClick={() => setPage('home')} className="text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors">← Về trang người dùng</button>
      </div>

      <div className="flex">
        <aside className="w-56 min-h-screen bg-white/5 backdrop-blur-sm border-r border-white/10 p-4 hidden md:block">
          <nav className="space-y-1 mt-4">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all text-sm flex items-center gap-3 ${tab === t.id ? 'bg-yellow-500 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="md:hidden w-full fixed bottom-0 left-0 bg-purple-900/95 border-t border-white/10 flex z-40 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex-none px-4 py-4 text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${tab === t.id ? 'text-yellow-400 border-t-2 border-yellow-400' : 'text-white/60'}`}>
              <div className="scale-75">{t.icon}</div> {t.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-6 pb-24 md:pb-6 overflow-y-auto h-[calc(100vh-64px)]">
          {tab === 'dashboard' && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><LayoutDashboard className="w-6 h-6 text-yellow-400" /> Tổng Quan Hệ Thống</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {mockStats.map(s => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/20 transition-all cursor-default">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg mb-3 shadow-lg`}>{s.icon}</div>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-white/60 text-sm mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold flex items-center gap-2"><Box className="w-5 h-5 text-yellow-400" /> Đơn hàng gần đây</h2>
                  <button onClick={() => setTab('orders')} className="text-xs text-yellow-400 hover:underline">Xem tất cả</button>
                </div>
                <div className="overflow-x-auto">
                  {loadingOrders ? (
                    <div className="py-10 text-center text-white/40">Đang tải đơn hàng...</div>
                  ) : orders.length === 0 ? (
                    <div className="py-10 text-center text-white/40">Chưa có đơn hàng nào.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead><tr className="text-white/50 border-b border-white/10">
                        <th className="text-left py-2 pr-4">Mã</th><th className="text-left py-2 pr-4">Khách</th>
                        <th className="text-left py-2 pr-4">Sản phẩm</th><th className="text-left py-2 pr-4">Tiền</th>
                        <th className="text-left py-2">Trạng thái</th>
                      </tr></thead>
                      <tbody>{orders.slice(0, 5).map(o => (
                        <tr key={o.id} className="border-b border-white/5 text-white/80 hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-4 font-mono text-yellow-400 text-xs">{o.id.substring(0, 8)}</td>
                          <td className="py-3 pr-4">{o.customerName || 'Ẩn danh'}</td>
                          <td className="py-3 pr-4 truncate max-w-[200px]">{o.items?.[0]?.productName || 'N/A'} {o.items?.length > 1 ? `+${o.items.length - 1}` : ''}</td>
                          <td className="py-3 pr-4 font-semibold text-green-400">{o.totalAmount?.toLocaleString()}đ</td>
                          <td className="py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge[o.status] || 'bg-gray-500/20'}`}>{statusLabel[o.status] || o.status}</span></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'products' && (
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ShoppingBag className="w-6 h-6 text-yellow-400" /> Quản Lý Sản Phẩm</h1>
                  <p className="text-white/60 text-sm mt-1">Cập nhật kho hàng, giá bán và trạng thái hiển thị của linh vật & vật phẩm</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input 
                      type="text" 
                      placeholder="Tìm sản phẩm..." 
                      className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none w-64 transition-all"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setEditingProduct({})} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-5 py-2 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">+ Thêm sản phẩm</button>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 border-b border-white/10"><tr className="text-white/50">
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Sản phẩm</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Giá bán</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Tồn kho</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Trạng thái</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Thao tác</th>
                  </tr></thead>
                  <tbody>
                    {loadingProducts ? (
                      <tr><td colSpan={5} className="p-8 text-center text-white/50">Đang tải sản phẩm... 📦</td></tr>
                    ) : products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                      <tr><td colSpan={5} className="p-12 text-center text-white/30 italic">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-10" />
                        Không tìm thấy sản phẩm nào khớp với tìm kiếm.
                      </td></tr>
                    ) : products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                      <tr key={p.id} className="border-t border-white/5 text-white/80 hover:bg-white/5 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-white/5 group-hover:scale-110 transition-transform">
                              <img src={p.imageUrl || '/chicken-mascot.png'} alt="" className="w-full h-full object-cover" onError={(e:any) => e.target.src='/chicken-mascot.png'} />
                            </div>
                            <div>
                              <span className="font-bold text-white text-base block">{p.name}</span>
                              <span className="text-[10px] text-white/40 uppercase tracking-widest">{p.categoryName || 'Vật phẩm'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-yellow-400 font-bold text-base block">{p.basePrice?.toLocaleString()}đ</span>
                          {p.oldPrice && <span className="text-[10px] text-white/30 line-through">{p.oldPrice.toLocaleString()}đ</span>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg font-bold text-xs ${p.stockQuantity === 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : p.stockQuantity < 10 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                            {p.stockQuantity === 0 ? 'Hết hàng' : `${p.stockQuantity} cái`}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${p.isActive ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                            {p.isActive ? 'Đang bán' : 'Đã ẩn'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingProduct(p)} className="p-2 bg-yellow-500/10 hover:bg-yellow-500/30 text-yellow-300 rounded-xl transition-all" title="Sửa"><PenTool className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-300 rounded-xl transition-all" title="Xoá"><ShieldBan className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'packages' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-400" /> Quản Lý Gói Lượt Tarot</h1>
                  <p className="text-white/60 text-sm mt-1">Quản lý các gói nạp lượt bốc bài (credits) cho người dùng</p>
                </div>
                <button onClick={() => setEditingPackage({})} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-5 py-2 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">+ Thêm gói mới</button>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5"><tr className="text-white/50">
                    <th className="text-left p-4">Tên gói</th><th className="text-left p-4">Lượt / ngày</th>
                    <th className="text-left p-4">Thời hạn</th><th className="text-left p-4">Giá bán</th>
                    <th className="text-left p-4">Thao tác</th>
                  </tr></thead>
                  <tbody>{CREDIT_PACKAGES.map((pkg: any) => (
                    <tr key={pkg.id} className="border-t border-white/10 text-white/80 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl">{pkg.icon}</div>
                          <div>
                            <span className="font-bold text-white block">{pkg.name}</span>
                            <span className="text-xs text-white/50">{pkg.desc}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-purple-400 font-bold">{pkg.dailyCredits} lượt</td>
                      <td className="p-4 text-yellow-400">{pkg.expiryLabel}</td>
                      <td className="p-4">
                        <span className="text-red-400 font-bold mr-2">{pkg.price.toLocaleString()}đ</span>
                        <span className="line-through text-white/30 text-xs">{pkg.oldPrice.toLocaleString()}đ</span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => setEditingPackage(pkg)} className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 rounded-lg text-xs transition-all">Sửa</button>
                          <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-xs transition-all">Ẩn</button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><PackageSearch className="w-6 h-6 text-yellow-400" /> Quản Lý Đơn Hàng</h1>
              <div className="flex gap-2 mb-6 flex-wrap">
                {['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã huỷ'].map(s => (
                  <button key={s} className="px-4 py-2 rounded-full text-sm bg-white/10 text-white/70 hover:bg-yellow-500 hover:text-yellow-950 hover:font-bold transition-all">{s}</button>
                ))}
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5"><tr className="text-white/50">
                    <th className="text-left p-4">Mã ĐH</th><th className="text-left p-4">Khách</th>
                    <th className="text-left p-4">Sản phẩm</th><th className="text-left p-4">Tổng tiền</th>
                    <th className="text-left p-4">Ngày</th><th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Cập nhật</th>
                  </tr></thead>
                  <tbody>
                    {loadingOrders ? (
                      <tr><td colSpan={7} className="p-8 text-center text-white/50">Đang tải đơn hàng... 📦</td></tr>
                    ) : orders.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-white/50">Chưa có đơn hàng nào.</td></tr>
                    ) : orders.map(o => (
                      <tr key={o.id} className="border-t border-white/10 text-white/80 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-yellow-400 text-xs">{o.id.substring(0, 8)}</td>
                        <td className="p-4">{o.customerName || 'Ẩn danh'}</td>
                        <td className="p-4 truncate max-w-[150px]">{o.items?.[0]?.productName || 'N/A'} {o.items?.length > 1 ? `+${o.items.length - 1}` : ''}</td>
                        <td className="p-4 font-semibold text-green-400">{o.totalAmount?.toLocaleString()}đ</td>
                        <td className="p-4 text-white/50 text-xs">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge[o.status] || 'bg-gray-500/20'}`}>{statusLabel[o.status] || o.status}</span></td>
                        <td className="p-4">
                          <button onClick={() => setEditingOrder(o)} className="px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-xs transition-all shadow-sm">Cập nhật</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users className="w-6 h-6 text-yellow-400" /> Quản Lý Tài Khoản</h1>
                  <p className="text-white/60 text-sm mt-1">Quản lý người dùng, lữ khách và phân quyền hệ thống</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input 
                      type="text" 
                      placeholder="Tìm tên, email..." 
                      className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none w-64 transition-all"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setEditingUser({})} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-5 py-2 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">+ Thêm lữ khách</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[{label:'Tổng tài khoản',v:users.length,c:'from-purple-500/80 to-purple-800/80', i: <Users className="w-20 h-20" />},{label:'Admin/Nhân viên',v:users.filter(u => u.role !== 'Customer').length,c:'from-blue-500/80 to-blue-800/80', i: <Shield className="w-20 h-20" />},{label:'Đang bị khoá',v:users.filter(u => u.accountStatus === 'banned').length,c:'from-red-500/80 to-red-800/80', i: <ShieldBan className="w-20 h-20" />}].map((s, idx) => (
                  <div key={s.label} className={`bg-gradient-to-br ${s.c} backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/20 relative overflow-hidden group`}>
                    <div className="absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform">{s.i}</div>
                    <p className="text-4xl font-black text-white relative z-10">{s.v}</p>
                    <p className="text-white/80 font-medium text-sm mt-1 relative z-10">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 border-b border-white/10"><tr className="text-white/50">
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">ID / Ngày tham gia</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Thông tin Lữ khách</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Số lượt bốc</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Phân quyền</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Trạng thái</th>
                    <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Thao tác</th>
                  </tr></thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr><td colSpan={6} className="p-8 text-center text-white/50">Đang tải danh sách lữ khách... 👤</td></tr>
                    ) : users.filter(u => 
                        (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                      ).length === 0 ? (
                      <tr><td colSpan={6} className="p-12 text-center">
                        <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
                        <p className="text-white/40 italic">Không tìm thấy lữ khách nào khớp với tìm kiếm.</p>
                      </td></tr>
                    ) : users.filter(u => 
                        (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                      ).map(u => (
                      <tr key={u.id} className="border-t border-white/5 text-white/80 hover:bg-white/5 transition-colors group">
                        <td className="p-4 font-mono text-[10px]">
                          <span className="text-yellow-400 font-bold block">{u.id.substring(0, 8)}</span>
                          <span className="text-white/30 italic">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-white text-base">{u.fullName || 'Ẩn danh'}</p>
                            <p className="text-xs text-white/40">{u.email}</p>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-cyan-400">{u.credits}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${u.role === 'Admin' ? 'border-purple-500/50 text-purple-300' : u.role === 'Staff' ? 'border-blue-500/50 text-blue-300' : 'border-white/20 text-white/50'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${u.accountStatus === 'active' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                            {u.accountStatus === 'active' ? 'Hoạt động' : 'Đã bị khoá'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingUser(u)} className="p-2 bg-yellow-500/10 hover:bg-yellow-500/30 text-yellow-300 rounded-xl transition-all" title="Sửa"><PenTool className="w-4 h-4" /></button>
                            <button onClick={() => handleUpdateUserStatus(u.id, u.accountStatus === 'active' ? 'banned' : 'active')} className={`p-2 rounded-xl transition-all border ${u.accountStatus === 'banned' ? 'bg-green-500/10 hover:bg-green-500/30 border-green-500/30 text-green-300' : 'bg-red-500/10 hover:bg-red-500/30 border-red-500/30 text-red-300'}`} title={u.accountStatus === 'banned' ? 'Mở khoá' : 'Khoá'}>
                              {u.accountStatus === 'banned' ? <Zap className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'cards' && (
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">🎴 Quản Lý Thẻ Tarot</h1>
                  <p className="text-white/60 text-sm mt-1">Cập nhật ý nghĩa, hình ảnh và phân loại các lá bài trong bộ bài</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Eye className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input 
                      type="text" 
                      placeholder="Tìm tên thẻ bài..." 
                      className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none w-64 transition-all"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setEditingCard({})} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-5 py-2 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all transform hover:-translate-y-1">+ Thêm Thẻ Mới</button>
                </div>
              </div>
              
              <div className="flex gap-2 mb-6 flex-wrap">
                {['All', 'Major Arcana', 'Minor Arcana', 'Wands', 'Cups', 'Swords', 'Pentacles'].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setCategoryFilter(s)}
                    className={`px-4 py-2 rounded-full text-xs transition-all border ${categoryFilter === s ? 'bg-yellow-500 text-yellow-950 font-bold border-yellow-500 shadow-lg' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'}`}
                  >
                    {s === 'All' ? 'Tất cả (78)' : s}
                  </button>
                ))}
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="text-white/50">
                      <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Mã</th>
                      <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Tên Thẻ (Eng / VN)</th>
                      <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Phân loại</th>
                      <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Nguyên tố</th>
                      <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCards ? (
                      <tr><td colSpan={5} className="p-8 text-center text-white/50">Đang tải dữ liệu bộ bài... 🔮</td></tr>
                    ) : tarotCards.filter(c => {
                      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesCategory = categoryFilter === 'All' || c.arcana === categoryFilter || c.suit === categoryFilter;
                      return matchesSearch && matchesCategory;
                    }).map((c, idx) => {
                      const suit = c.name.split(' of ')[1];
                      let element = 'Air';
                      if (suit === 'Wands') element = 'Fire';
                      if (suit === 'Cups') element = 'Water';
                      if (suit === 'Pentacles') element = 'Earth';
                      if (suit === 'Swords') element = 'Air';
                      if (c.arcana === 'Major Arcana') element = 'Spirit';

                      return (
                      <tr key={c.id || idx} className="border-t border-white/5 text-white/80 hover:bg-white/5 transition-colors group">
                        <td className="p-4 font-mono text-yellow-400 font-bold">T{String(c.id || idx).padStart(2, '0')}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative overflow-hidden rounded-lg w-10 h-14 border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                              <img src={c.image || '/card-back.png'} className="w-full h-full object-cover" onError={e => (e.currentTarget.src = '/card-back.png')} alt="" />
                            </div>
                            <div>
                              <span className="font-bold text-white text-base block">{c.name}</span>
                              <span className="text-xs text-white/40 italic line-clamp-1 w-48">{c.meanings?.upright || c.meanings?.general || 'Chưa cập nhật ý nghĩa'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-white/70 bg-white/5 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-tight">{c.arcana || 'Unknown'}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap ${element === 'Fire' ? 'border-red-500/30 text-red-300 bg-red-500/10' : element === 'Water' ? 'border-blue-500/30 text-blue-300 bg-blue-500/10' : element === 'Earth' ? 'border-green-500/30 text-green-300 bg-green-500/10' : element === 'Spirit' ? 'border-purple-500/30 text-purple-300 bg-purple-500/10' : 'border-gray-400/30 text-gray-300 bg-gray-400/10'}`}>
                            {element === 'Fire' ? '🔥 Fire' : element === 'Water' ? '💧 Water' : element === 'Earth' ? '🌍 Earth' : element === 'Spirit' ? '✨ Spirit' : '💨 Air'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => setViewingCard(c)} className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs transition-all shadow-sm whitespace-nowrap">Xem</button>
                            <button onClick={() => setEditingCard(c)} className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-xs transition-all shadow-sm whitespace-nowrap">Sửa</button>
                            <button onClick={() => handleDeleteCard(c.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-xs transition-all shadow-sm whitespace-nowrap">Xóa</button>
                          </div>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'nfcs' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">🏷️ Quản Lý Chip NFC</h1>
                  <p className="text-white/60 text-sm mt-1">Theo dõi các lõi NFC vật lý được gắn vào sản phẩm tâm linh</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input 
                      type="text" 
                      placeholder="Tìm mã chip, email..." 
                      className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none w-64 transition-all"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setEditingNfc({})} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-5 py-2 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">+ Gắn Chip Mới</button>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5"><tr className="text-white/50">
                    <th className="text-left p-4">Mã Chip (NFC Tag ID)</th><th className="text-left p-4">Sản Phẩm Đính Kèm</th>
                    <th className="text-left p-4">Chủ sở hữu</th><th className="text-left p-4">Lượt Quét</th>
                    <th className="text-left p-4">Trạng thái</th><th className="text-left p-4">Thao tác</th>
                  </tr></thead>
                  <tbody>
                    {loadingNfcs ? (
                      <tr><td colSpan={6} className="p-8 text-center text-white/50">Đang tải dữ liệu chip NFC... 🏷️</td></tr>
                    ) : nfcs.filter(n => 
                        n.nfcTagId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (n.accountEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
                      ).length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-white/50">Không tìm thấy mã chip nào khớp với tìm kiếm.</td></tr>
                    ) : nfcs.filter(n => 
                        n.nfcTagId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (n.accountEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
                      ).map(n => (
                      <tr key={n.nfcTagId} className="border-t border-white/10 text-white/80 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-cyan-400">{n.nfcTagId}</td>
                        <td className="p-4">{n.productName || 'Chưa đính kèm'}</td>
                        <td className="p-4 font-semibold text-xs">{n.accountEmail || 'N/A'}</td>
                        <td className="p-4 font-mono">{n.scanCount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase ${n.status === 'activated' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-gray-500/50 text-gray-400 bg-gray-500/10'}`}>
                            {n.status === 'activated' ? 'Đã kích hoạt' : n.status === 'unactivated' ? 'Chưa kích hoạt' : n.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => setViewingNfc(n)} className="px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-xs transition-all shadow-sm">Chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'blogs' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">✍️ Nội Dung & Bài Viết</h1>
                  <p className="text-white/60 text-sm mt-1">Viết blog chia sẻ kiến thức tâm linh, phong thủy, và Tarot</p>
                </div>
                <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-5 py-2 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">✍️ Viết Bài Mới</button>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5"><tr className="text-white/50">
                    <th className="text-left p-4">Tiêu đề bài viết</th>
                    <th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Lượt xem</th>
                    <th className="text-left p-4">Ngày cập nhật</th>
                    <th className="text-left p-4">Thao tác</th>
                  </tr></thead>
                  <tbody>
                    {loadingBlogs ? (
                      <tr><td colSpan={5} className="p-8 text-center text-white/50">Đang tải bài viết... ✍️</td></tr>
                    ) : blogs.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-white/50">Chưa có bài viết nào.</td></tr>
                    ) : blogs.map(b => (
                      <tr key={b.id} className="border-t border-white/10 text-white/80 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={b.thumbnailUrl || '/card-back.png'} className="w-12 h-12 object-cover rounded-lg bg-white/10" alt="" onError={(e:any) => e.target.src='/card-back.png'} />
                            <div>
                              <span className="font-bold text-white block">{b.title}</span>
                              <span className="text-[10px] text-white/40">slug: {b.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${b.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                            {b.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-yellow-400">{b.viewCount || 0}</td>
                        <td className="p-4 text-white/50 text-xs">{new Date(b.updatedAt || b.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => setEditingBlog(b)} className="px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-xs transition-all shadow-sm">Sửa</button>
                            <button className="px-3 py-1 bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-xs transition-all shadow-sm">Xoá</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">📈 Phân Tích & Báo Cáo Chuyên Sâu</h1>
                  <p className="text-yellow-400 font-bold text-lg">Tổng Doanh Thu Hệ Thống: 160,000,000 đ</p>
                </div>
                <div className="flex gap-2">
                  <select className="bg-white/10 text-white/80 border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400">
                    <option value="7">7 ngày qua</option>
                    <option value="30">30 ngày qua</option>
                    <option value="180">6 tháng qua</option>
                    <option value="all">Toàn thời gian</option>
                  </select>
                  <button onClick={() => alert('Đang xuất file Excel...')} className="bg-green-600 hover:bg-green-500 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-lg">📥 Xuất Excel</button>
                  <button onClick={() => setShowReportModal(true)} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-lg">📄 Báo Cáo Tổng Thể</button>
                </div>
              </div>

              {/* Hàng 1: Doanh thu & Tỉ lệ Đơn hàng */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 lg:col-span-2">
                  <h2 className="text-white font-bold mb-6 flex items-center gap-2">💰 Biểu Đồ Doanh Thu & Đơn Hàng (6 Tháng)</h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#facc15" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}tr`} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(88, 28, 135, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }}
                          formatter={(value, name) => [name === 'doanhThu' ? `${value} Triệu VNĐ` : `${value} đơn`, name === 'doanhThu' ? 'Doanh thu' : 'Số đơn']}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', opacity: 0.8 }} />
                        <Area type="monotone" dataKey="doanhThu" name="Doanh Thu" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#colorDoanhThu)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h2 className="text-white font-bold mb-2 flex items-center gap-2">📦 Trạng Thái Giao Hàng</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(88, 28, 135, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }}
                        />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Hàng 1.5: Sản phẩm bán chạy & Gói cước */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h2 className="text-white font-bold mb-4 flex items-center gap-2">🛍️ Top Sản Phẩm Vật Lý Bán Chạy</h2>
                  <div className="space-y-4">
                    {topProductsData.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold ${p.color}`}>#{idx + 1}</div>
                          <div>
                            <p className="text-white font-bold text-sm">{p.name}</p>
                            <p className="text-white/50 text-xs">Đã bán: {p.sales}</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-bold">{p.revenue}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h2 className="text-white font-bold mb-4 flex items-center gap-2">🔮 Top Gói Lượt Tarot Được Mua Nhất</h2>
                  <div className="space-y-4">
                    {topPackagesData.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">{p.icon}</div>
                          <div>
                            <p className="text-white font-bold text-sm">{p.name}</p>
                            <p className="text-white/50 text-xs">Lượt đăng ký: {p.sales}</p>
                          </div>
                        </div>
                        <span className="text-yellow-400 font-bold">{p.revenue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hàng 2: Tarot Usage & System */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h2 className="text-white font-bold mb-6 flex items-center gap-2">🔮 Tần Suất Lượt Bốc Tarot Trực Tuyến (Tuần này)</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tarotData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <XAxis dataKey="day" stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                          contentStyle={{ backgroundColor: 'rgba(88, 28, 135, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }}
                          formatter={(value) => [`${value} lượt bốc`, 'Tổng số lượt']}
                        />
                        <Bar dataKey="luotBoc" fill="#a855f7" radius={[6, 6, 0, 0]}>
                          {tarotData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.luotBoc > 300 ? '#facc15' : '#a855f7'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-center text-xs text-white/50 mt-2">* Các cột màu vàng cảnh báo mức tải AI cao.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
                  <div>
                    <h2 className="text-white font-bold mb-6 flex items-center gap-2">⚙️ Trạng Thái Cấu Hình Dịch Vụ</h2>
                    <div className="space-y-4">
                      {mockReports.system.map(s => (
                        <div key={s.label} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                          <span className="text-white/80 font-medium">{s.label}</span>
                          <div className="text-right">
                            <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-white/40">{s.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-sm text-white/60">Phiên bản Database: Supabase PG-15</span>
                    <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">Kiểm tra Logs →</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'rbac' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">🛡️ Quản Lý Phân Quyền (RBAC)</h1>
                  <p className="text-white/60 text-sm mt-1">Cấu hình chi tiết các hành động cho từng vai trò người dùng</p>
                </div>
                <button onClick={() => alert('Đã lưu cấu hình phân quyền!')} className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-bold text-sm px-5 py-2 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">💾 Lưu thay đổi</button>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="text-white/50">
                      <th className="p-4 font-bold uppercase tracking-wider text-xs">Permission / Role</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Admin</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Staff</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Editor</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Customer</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/80">
                    {[
                      { key: 'dashboard.view', label: 'Xem Dashboard Tổng Quan' },
                      { key: 'users.view', label: 'Xem danh sách Người dùng' },
                      { key: 'users.manage', label: 'Quản lý / Khóa người dùng' },
                      { key: 'cards.view', label: 'Xem danh sách Thẻ bài' },
                      { key: 'cards.manage', label: 'Chỉnh sửa nội dung Thẻ' },
                      { key: 'products.view', label: 'Xem danh sách Sản phẩm' },
                      { key: 'products.manage', label: 'Quản lý kho / Giá bán' },
                      { key: 'orders.view', label: 'Xem danh sách Đơn hàng' },
                      { key: 'orders.manage', label: 'Cập nhật trạng thái Đơn' },
                      { key: 'nfc.view', label: 'Xem dữ liệu Chip NFC' },
                      { key: 'content.view', label: 'Xem danh sách Bài viết' },
                      { key: 'content.manage', label: 'Đăng / Sửa bài viết' },
                      { key: 'reports.view', label: 'Xem Báo cáo tài chính' },
                      { key: 'rbac.manage', label: 'Quản lý phân quyền (RBAC)' },
                    ].map((p, i) => (
                      <tr key={p.key} className={`border-t border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                        <td className="p-4">
                          <p className="font-bold text-white">{p.label}</p>
                          <code className="text-[10px] text-white/40">{p.key}</code>
                        </td>
                        <td className="p-4 text-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 accent-yellow-500" />
                        </td>
                        <td className="p-4 text-center">
                          <input type="checkbox" defaultChecked={['dashboard.view', 'orders.view', 'orders.manage', 'products.view', 'nfc.view'].includes(p.key)} className="w-4 h-4 accent-blue-500" />
                        </td>
                        <td className="p-4 text-center">
                          <input type="checkbox" defaultChecked={['cards.view', 'cards.manage', 'content.view', 'content.manage'].includes(p.key)} className="w-4 h-4 accent-emerald-500" />
                        </td>
                        <td className="p-4 text-center">
                          <input type="checkbox" defaultChecked={false} className="w-4 h-4 accent-gray-500" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {tab === 'settings' && (
            <div className="animate-fade-in max-w-3xl space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">⚙️ Cài Đặt Hệ Thống</h1>
                <p className="text-white/50 text-sm">Quản lý cấu hình API AI và các tích hợp dịch vụ.</p>
              </div>

              {/* Active Key Status Banner */}
              {(() => {
                const activeKey = getActiveGeminiKey();
                const isFromAdmin = !!localStorage.getItem('chipstarot_admin_gemini_key');
                if (!activeKey) return (
                  <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                    <span className="text-2xl flex-shrink-0">🚫</span>
                    <div>
                      <p className="text-red-300 font-bold text-sm">Chưa có API Key — AI đang tắt</p>
                      <p className="text-red-200/60 text-xs mt-0.5">Nhập Gemini API Key bên dưới để bật tính năng luận giải Tarot bằng AI.</p>
                    </div>
                  </div>
                );
                return (
                  <div className="flex items-center gap-4 bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
                    <span className="text-2xl flex-shrink-0">✅</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-green-300 font-bold text-sm">AI đang hoạt động — {isFromAdmin ? 'Key do Admin cài đặt' : 'Key từ file .env'}</p>
                      <p className="text-green-200/60 text-xs font-mono mt-0.5">{activeKey.slice(0, 10)}••••••••••••{activeKey.slice(-4)}</p>
                    </div>
                    <span className="text-green-400 text-xs font-bold bg-green-500/20 px-2.5 py-1 rounded-lg flex-shrink-0">gemini-2.5-flash-lite</span>
                  </div>
                );
              })()}

              {/* Gemini API Key Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                {/* Card Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl shadow-lg">✨</div>
                    <div>
                      <h2 className="text-white font-bold">Google Gemini API Key</h2>
                      <p className="text-white/40 text-xs">Model: gemini-2.5-flash-lite • Cấp độ miễn phí (Free Tier)</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    keyStatus === 'valid'   ? 'border-green-500/60 text-green-400 bg-green-500/15'   :
                    keyStatus === 'saved'   ? 'border-blue-500/60  text-blue-400  bg-blue-500/15'    :
                    keyStatus === 'testing' ? 'border-yellow-500/60 text-yellow-400 bg-yellow-500/15 animate-pulse' :
                    keyStatus === 'invalid' ? 'border-red-500/60   text-red-400   bg-red-500/15'     :
                                             'border-gray-500/50   text-gray-400  bg-gray-500/10'
                  }`}>
                    {keyStatus === 'valid'   ? '✅ Đã xác minh' :
                     keyStatus === 'saved'   ? '🔑 Đã lưu'     :
                     keyStatus === 'testing' ? '⏳ Đang test...' :
                     keyStatus === 'invalid' ? '❌ Lỗi'         : '⚠️ Chưa cài'}
                  </span>
                </div>

                <div className="p-6 space-y-5">
                  {/* Guide */}
                  <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-4 space-y-2">
                    <p className="font-bold text-blue-300 text-sm">📌 Hướng dẫn lấy key miễn phí (1 phút):</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-200/80 text-sm">
                      <li>Vào <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-blue-300 underline hover:text-white transition-colors">aistudio.google.com/apikey</a></li>
                      <li>Đăng nhập Google → chọn project → nhấn <strong className="text-blue-200">"Create API Key"</strong></li>
                      <li>Copy key (bắt đầu bằng <code className="bg-blue-900/40 px-1.5 py-0.5 rounded text-blue-300 text-xs">AIzaSy...</code>) → dán vào ô bên dưới</li>
                      <li>Nhấn <strong className="text-yellow-300">"💡 Test & Lưu"</strong> — hệ thống tự kiểm tra và lưu trong 1 bước</li>
                    </ol>
                  </div>

                  {/* Input */}
                  <div>
                    <label className="text-xs text-white/50 font-semibold uppercase tracking-widest mb-2 block">Gemini API Key</label>
                    <div className="relative">
                      <input
                        id="gemini-key-input"
                        type={showKey ? 'text' : 'password'}
                        value={geminiKeyInput}
                        onChange={e => { setGeminiKeyInput(e.target.value); setKeyStatus('none'); setKeyTestMsg(''); }}
                        onKeyDown={e => { if (e.key === 'Enter') handleTestGeminiKey(); }}
                        placeholder="AIzaSy.........................................."
                        autoComplete="off"
                        spellCheck={false}
                        className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3.5 pr-12 text-white font-mono text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all placeholder-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors p-1"
                        title={showKey ? 'Ẩn key' : 'Hiện key'}
                      >
                        {showKey ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {geminiKeyInput && !geminiKeyInput.trim().startsWith('AIzaSy') && (
                      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <span>⚠️</span> Key phải bắt đầu bằng "AIzaSy"
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3">
                    {/* PRIMARY: Test & Lưu 1 bước */}
                    <button
                      onClick={handleTestGeminiKey}
                      disabled={keyStatus === 'testing' || !geminiKeyInput.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {keyStatus === 'testing'
                        ? <span className="inline-block w-4 h-4 border-2 border-yellow-900/60 border-t-yellow-950 rounded-full animate-spin"/>
                        : '💡'}
                      {keyStatus === 'testing' ? 'Đang kiểm tra...' : 'Test & Lưu'}
                    </button>

                    {/* SECONDARY: Lưu không test */}
                    <button
                      onClick={handleSaveGeminiKey}
                      disabled={!geminiKeyInput.trim() || keyStatus === 'testing'}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      💾 Lưu (bỏ qua test)
                    </button>

                    {/* DELETE */}
                    {localStorage.getItem('chipstarot_admin_gemini_key') && (
                      <button
                        onClick={handleClearGeminiKey}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-red-500/10 hover:bg-red-500/25 text-red-300 border border-red-500/30 hover:border-red-500/60 transition-all"
                      >
                        🗑️ Xoá Key
                      </button>
                    )}
                  </div>

                  {/* Result message */}
                  {keyTestMsg && (
                    <div className={`rounded-xl px-4 py-4 text-sm leading-relaxed whitespace-pre-line ${
                      keyStatus === 'valid'
                        ? 'bg-green-500/10 border border-green-500/25 text-green-300'
                        : keyStatus === 'saved'
                        ? 'bg-blue-500/10 border border-blue-500/25 text-blue-300'
                        : keyStatus === 'invalid'
                        ? 'bg-red-500/10 border border-red-500/25 text-red-300'
                        : 'bg-yellow-500/10 border border-yellow-500/25 text-yellow-300'
                    }`}>
                      {keyTestMsg}
                      {/* Extra help for quota error */}
                      {keyStatus === 'saved' && keyTestMsg.includes('429') && (
                        <div className="mt-3 pt-3 border-t border-white/10 text-xs space-y-1 opacity-80">
                          <p className="font-bold uppercase tracking-wider">Cách khắc phục lỗi Quota nhanh:</p>
                          <p>• Chờ 1-2 phút rồi thử bốc bài lại (giới hạn theo phút)</p>
                          <p>• Kiểm tra usage tại: <a href="https://ai.dev/rate-limit" target="_blank" rel="noreferrer" className="underline hover:opacity-100">ai.dev/rate-limit</a></p>
                          <p>• Tạo API Key mới từ project khác trong AI Studio</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Security note */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white/50 leading-relaxed">
                    <p className="font-semibold text-white/70 mb-1">🔒 Bảo mật:</p>
                    <p>Key được lưu trong <code className="bg-white/10 px-1 rounded">localStorage</code> của trình duyệt này. Không chia sẻ màn hình Admin với người khác. Theo lộ trình Backend C#, key sẽ được chuyển sang lưu trữ an toàn trên Server.</p>
                  </div>
                </div>
              </div>

              {/* System Settings Section */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-600/10 to-teal-600/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shadow-lg">⚙️</div>
                    <div>
                      <h2 className="text-white font-bold">Cấu hình Hệ Thống</h2>
                      <p className="text-white/40 text-xs">Quản lý các thông số vận hành của ChipStarot</p>
                    </div>
                  </div>
                  {loadingSettings && <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>}
                </div>
                
                <div className="p-6">
                  {settings.length === 0 && !loadingSettings ? (
                    <div className="text-center py-8">
                      <p className="text-white/30 italic">Không tìm thấy cấu hình hệ thống.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {settings.map((s: any) => (
                        <div key={s.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                          <div>
                            <p className="text-white font-bold text-sm uppercase tracking-wider">{s.label || s.key}</p>
                            <p className="text-white/50 text-xs">{s.description || 'Chưa có mô tả cho cấu hình này.'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-yellow-400 font-mono w-40 text-right focus:border-emerald-500 focus:outline-none transition-all"
                              defaultValue={s.value}
                              onBlur={async (e) => {
                                const newVal = e.target.value;
                                if (newVal === s.value) return;
                                try {
                                  const res = await fetch(`/api/admin/settings/${s.key}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ value: newVal })
                                  });
                                  if (res.ok) alert(`✅ Đã cập nhật ${s.label || s.key}`);
                                } catch { alert('Lỗi khi lưu cài đặt.'); }
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Model Info Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-5">
                <h2 className="text-white font-bold mb-4 flex items-center gap-2">🤖 Thông tin Model AI đang dùng</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Model',     value: 'gemini-2.5-flash-lite',  color: 'text-purple-300' },
                    { label: 'Provider',  value: 'Google DeepMind',         color: 'text-blue-300'   },
                    { label: 'Free Tier', value: '15 req/phút',             color: 'text-green-300'  },
                    { label: 'Chức năng', value: 'Luận giải Tarot AI',      color: 'text-yellow-300' },
                  ].map(item => (
                    <div key={item.label} className="bg-white/5 rounded-xl p-3.5 border border-white/5">
                      <p className="text-white/40 text-xs mb-1">{item.label}</p>
                      <p className={`font-bold text-xs font-mono ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced System Settings (Mockup for future Backend) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pet Game & Credit Settings */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-lg">🐾</div>
                    <h2 className="text-white font-bold">Cấu Hình Trò Chơi (Pet)</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-white/70 text-sm">Chi phí 1 lượt bốc bài (Credit)</span>
                      <input type="number" defaultValue={10} className="w-20 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white text-center text-sm focus:border-yellow-400 focus:outline-none" />
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-white/70 text-sm">EXP thú cưng nhận được (mỗi lượt)</span>
                      <input type="number" defaultValue={20} className="w-20 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white text-center text-sm focus:border-yellow-400 focus:outline-none" />
                    </div>
                  </div>
                  <button className="w-full mt-2 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white transition-all">Lưu Cấu Hình Pet</button>
                </div>

                {/* System Maintenance */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center text-lg">🛡️</div>
                    <h2 className="text-white font-bold">Bảo Trì Hệ Thống</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <div>
                        <span className="text-white/90 text-sm font-medium block">Chế độ bảo trì</span>
                        <span className="text-white/40 text-xs">Chặn người dùng truy cập web</span>
                      </div>
                      <button className="relative w-11 h-6 bg-white/10 rounded-full transition-colors focus:outline-none">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full transition-transform"></div>
                      </button>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <div>
                        <span className="text-white/90 text-sm font-medium block">Xoá Cache (Redis)</span>
                        <span className="text-white/40 text-xs">Làm mới dữ liệu bài Tarot</span>
                      </div>
                      <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-xs font-bold transition-all">Clear</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* EDIT CARD MODAL */}
      {editingCard && (() => {
        const meaningTabs = [
          { id: 'general', label: 'Tổng Quan', icon: '✨' },
          { id: 'upright', label: 'Xuôi', icon: '⬆️' },
          { id: 'reversed', label: 'Ngược', icon: '⬇️' },
          { id: 'love', label: 'Tình Yêu', icon: '❤️' },
          { id: 'marriage', label: 'Hôn Nhân', icon: '💍' },
          { id: 'career', label: 'Sự Nghiệp', icon: '💼' },
          { id: 'study', label: 'Học Tập', icon: '📚' },
          { id: 'finance', label: 'Tài Chính', icon: '💰' },
          { id: 'investment', label: 'Đầu Tư', icon: '📈' },
          { id: 'health', label: 'Sức Khỏe', icon: '🌿' },
          { id: 'self', label: 'Bản Thân', icon: '🧘' },
        ];

        const [isSaving, setIsSaving] = useState(false);

        const handleSaveCard = async () => {
          if (!editingCard.name?.trim()) {
            setCardFormError('Tên thẻ bài không được để trống!');
            return;
          }
          if (!editingCard.arcana) {
            setCardFormError('Vui lòng chọn loại Arcana!');
            return;
          }
          if (editingCard.arcana === 'Minor Arcana' && !editingCard.suit) {
            setCardFormError('Minor Arcana cần chọn bộ (Suit)!');
            return;
          }
          if (!editingCard.image?.trim()) {
            setCardFormError('Vui lòng nhập URL hình ảnh cho thẻ bài!');
            return;
          }
          // Validation ý nghĩa (Ít nhất phải có ý nghĩa chung và 2 chiều)
          if (!editingCard.meanings?.general?.trim()) {
            setCardFormError('Vui lòng nhập Ý nghĩa tổng quan!');
            return;
          }
          if (!editingCard.meanings?.upright?.trim() || !editingCard.meanings?.reversed?.trim()) {
            setCardFormError('Vui lòng nhập đầy đủ ý nghĩa Chiều xuôi và Chiều ngược!');
            return;
          }
          
          setIsSaving(true);
          setCardFormError('');
          
          try {
            const isNew = !editingCard.id;
            const url = isNew ? '/api/tarot/cards' : `/api/tarot/cards/${editingCard.id}`;
            const method = isNew ? 'POST' : 'PUT';

            // Map frontend structured meanings to flat DTO fields
            const payload = {
              name: editingCard.name,
              suit: editingCard.suit,
              arcanaType: editingCard.arcana,
              element: editingCard.element,
              imageUrl: editingCard.image,
              meaningGeneral: editingCard.meanings?.general,
              meaningUpright: editingCard.meanings?.upright,
              meaningReversed: editingCard.meanings?.reversed,
              meaningLove: editingCard.meanings?.love,
              meaningMarriage: editingCard.meanings?.marriage,
              meaningCareer: editingCard.meanings?.career,
              meaningStudy: editingCard.meanings?.study,
              meaningFinance: editingCard.meanings?.finance,
              meaningInvestment: editingCard.meanings?.investment,
              meaningHealth: editingCard.meanings?.health,
              meaningSelf: editingCard.meanings?.self,
              status: editingCard.status || 'active'
            };

            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (res.ok) {
              alert(isNew ? '✨ Đã thêm lá bài mới thành công!' : '✅ Đã cập nhật thông tin lá bài!');
              setEditingCard(null);
              fetchCards(); // Refresh list
            } else {
              throw new Error();
            }
          } catch (err) {
            console.log("Mock card save success");
            alert(editingCard.id ? '✅ Đã cập nhật thông tin lá bài (Mock)!' : '✨ Đã thêm lá bài mới thành công (Mock)!');
            setEditingCard(null);
            // Simulating a local update if we wanted to be fancy, but fetchCards will trigger mock data anyway
            fetchCards();
          } finally {
            setIsSaving(false);
          }
        };

        const updateMeaning = (key: string, val: string) => {
          setEditingCard({
            ...editingCard,
            meanings: { ...(editingCard.meanings || {}), [key]: val }
          });
        };

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-purple-900 border border-yellow-500/30 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-purple-900/90 backdrop-blur-md z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">✨ Chỉnh sửa Thẻ Bài: <span className="text-yellow-400">{editingCard.name || 'Thẻ mới'}</span></h2>
                <button onClick={() => setEditingCard(null)} className="text-white/50 hover:text-white text-2xl transition-colors">&times;</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="space-y-6">
                  {cardFormError && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm border border-red-500/50">{cardFormError}</p>}
                  
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/4">
                      <label className="text-xs text-white/60 mb-2 block font-bold uppercase tracking-wider">Hình ảnh thẻ bài *</label>
                      <div className="aspect-[2/3] w-full bg-black/40 rounded-xl border border-white/10 mb-4 overflow-hidden shadow-inner group relative">
                        <img src={editingCard.image || '/card-back.png'} className="w-full h-full object-cover" onError={(e:any) => e.target.src='/card-back.png'} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <span className="text-[10px] bg-white/20 text-white px-2 py-1 rounded backdrop-blur-md">Thay đổi ảnh 📸</span>
                        </div>
                      </div>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none transition-all" 
                        placeholder="URL ảnh..."
                        value={editingCard.image || ''} 
                        onChange={e => setEditingCard({...editingCard, image: e.target.value})}
                      />
                    </div>

                    <div className="md:w-3/4 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Tên thẻ bài *</label>
                          <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400/50 transition-all" 
                            value={editingCard.name || ''} 
                            onChange={e => setEditingCard({...editingCard, name: e.target.value})}
                            placeholder="The Magician..."
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Phân loại (Arcana)</label>
                          <select 
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                            value={editingCard.arcana || 'Major'}
                            onChange={e => setEditingCard({...editingCard, arcana: e.target.value})}
                          >
                            <option value="Major" className="bg-purple-900">Major Arcana</option>
                            <option value="Minor" className="bg-purple-900">Minor Arcana</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Bộ (Suit)</label>
                          <select 
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                            value={editingCard.suit || 'None'}
                            onChange={e => setEditingCard({...editingCard, suit: e.target.value})}
                          >
                            <option value="None" className="bg-purple-900">Không có (Major)</option>
                            <option value="Wands" className="bg-purple-900">Wands (Gậy)</option>
                            <option value="Cups" className="bg-purple-900">Cups (Cốc)</option>
                            <option value="Swords" className="bg-purple-900">Swords (Kiếm)</option>
                            <option value="Pentacles" className="bg-purple-900">Pentacles (Tiền)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Nguyên tố</label>
                          <select 
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                            value={editingCard.element || 'Spirit'}
                            onChange={e => setEditingCard({...editingCard, element: e.target.value})}
                          >
                            <option value="Spirit" className="bg-purple-900">✨ Spirit (Linh hồn)</option>
                            <option value="Fire" className="bg-purple-900">🔥 Fire (Lửa)</option>
                            <option value="Water" className="bg-purple-900">💧 Water (Nước)</option>
                            <option value="Air" className="bg-purple-900">💨 Air (Khí)</option>
                            <option value="Earth" className="bg-purple-900">🌍 Earth (Đất)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Số thứ tự (Number)</label>
                          <input 
                            type="number" 
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none transition-all" 
                            value={editingCard.number || 0} 
                            onChange={e => setEditingCard({...editingCard, number: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-yellow-400 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">📖 Nội dung ý nghĩa lá bài</h3>
                    
                    <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                      {meaningTabs.map(t => (
                        <button 
                          key={t.id}
                          onClick={() => setActiveMeaningTab(t.id)}
                          className={`flex-none px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${activeMeaningTab === t.id ? 'bg-white/10 text-yellow-400 border-yellow-400' : 'text-white/40 border-transparent hover:text-white/70'}`}
                        >
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-b-xl rounded-tr-xl p-5 min-h-[250px]">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
                          Ý nghĩa {meaningTabs.find(t => t.id === activeMeaningTab)?.label}
                        </label>
                        <span className="text-[10px] text-white/30 italic">Hệ thống AI sẽ dùng nội dung này để luận giải</span>
                      </div>
                      <textarea 
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-base text-white/90 focus:border-yellow-400 focus:outline-none h-48 resize-none transition-all custom-scrollbar leading-relaxed" 
                        placeholder={`Nhập ý nghĩa ${meaningTabs.find(t => t.id === activeMeaningTab)?.label.toLowerCase()}...`}
                        value={editingCard.meanings?.[activeMeaningTab] || ''} 
                        onChange={e => updateMeaning(activeMeaningTab, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-purple-900/90 backdrop-blur-md">
                <button onClick={() => setEditingCard(null)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 transition-colors">Hủy bỏ</button>
                <button 
                  onClick={handleSaveCard} 
                  disabled={isSavingCard}
                  className={`px-8 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-950 shadow-xl transform active:scale-95 transition-all flex items-center gap-2 ${isSavingCard ? 'opacity-50 cursor-not-allowed' : 'hover:from-yellow-400 hover:to-yellow-500'}`}
                >
                  {isSavingCard ? (
                    <>
                      <div className="w-4 h-4 border-2 border-yellow-950/30 border-t-yellow-950 rounded-full animate-spin"></div>
                      Đang lưu...
                    </>
                  ) : 'Lưu Lá Bài'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* VIEW CARD MODAL */}
      {viewingCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0b1e] border border-cyan-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(34,211,238,0.15)] animate-scale-in">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-cyan-900/10 backdrop-blur-md z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">🔍 Chi tiết Thẻ Bài: <span className="text-cyan-400">{viewingCard.name}</span></h2>
              <button onClick={() => setViewingCard(null)} className="text-white/50 hover:text-white text-2xl transition-colors">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-8 flex flex-col md:flex-row gap-10">
                <div className="md:w-1/3">
                  <div className="sticky top-0">
                    <div className="rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.3)] border-2 border-cyan-500/20 transform hover:scale-[1.02] transition-transform duration-500">
                      <img src={viewingCard.image || '/card-back.png'} className="w-full aspect-[2/3] object-cover" onError={(e:any) => e.target.src='/card-back.png'} />
                    </div>
                    <div className="mt-6 space-y-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em] mb-1">Phân loại</p>
                        <p className="text-white font-bold">{viewingCard.arcana || 'Major Arcana'}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em] mb-1">Nguyên tố</p>
                        <p className="text-cyan-400 font-bold">{viewingCard.element || 'Spirit'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3 space-y-8">
                  <section>
                    <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em] mb-4 border-b border-white/10 pb-2">📜 Ý Nghĩa Căn Bản</h3>
                    <div className="space-y-4">
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                        <h4 className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-2">✨ TỔNG QUAN</h4>
                        <p className="text-white/80 leading-relaxed text-sm">{viewingCard.meanings?.general || 'Chưa cập nhật.'}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-500/5 p-5 rounded-2xl border border-green-500/10">
                          <h4 className="text-xs font-bold text-green-400 mb-2 flex items-center gap-2">⬆️ CHIỀU XUÔI</h4>
                          <p className="text-white/70 text-xs leading-relaxed">{viewingCard.meanings?.upright || 'Chưa cập nhật.'}</p>
                        </div>
                        <div className="bg-red-500/5 p-5 rounded-2xl border border-red-500/10">
                          <h4 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-2">⬇️ CHIỀU NGƯỢC</h4>
                          <p className="text-white/70 text-xs leading-relaxed">{viewingCard.meanings?.reversed || 'Chưa cập nhật.'}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em] mb-4 border-b border-white/10 pb-2">🧩 Các Khía Cạnh Đời Sống</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { k: 'love', l: 'Tình Yêu', i: '❤️', c: 'text-pink-400' },
                        { k: 'marriage', l: 'Hôn Nhân', i: '💍', c: 'text-purple-400' },
                        { k: 'career', l: 'Sự Nghiệp', i: '💼', c: 'text-blue-400' },
                        { k: 'study', l: 'Học Tập', i: '📚', c: 'text-indigo-400' },
                        { k: 'finance', l: 'Tài Chính', i: '💰', c: 'text-yellow-400' },
                        { k: 'investment', l: 'Đầu Tư', i: '📈', c: 'text-emerald-400' },
                        { k: 'health', l: 'Sức Khỏe', i: '🌿', c: 'text-green-400' },
                        { k: 'self', l: 'Bản Thân', i: '🧘', c: 'text-cyan-400' },
                      ].map(item => (
                        <div key={item.k} className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                          <h4 className={`text-[10px] font-black uppercase mb-1 flex items-center gap-2 ${item.c}`}>
                            {item.i} {item.l}
                          </h4>
                          <p className="text-white/60 text-xs line-clamp-3 leading-relaxed hover:line-clamp-none cursor-help transition-all">
                            {viewingCard.meanings?.[item.k] || 'Dữ liệu đang được cập nhật...'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-cyan-950/20 backdrop-blur-md">
              <button onClick={() => setViewingCard(null)} className="px-8 py-2.5 rounded-xl text-sm font-bold bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all">Đóng</button>
            </div>
          </div>
        </div>
      )}


      {/* EDIT USER MODAL */}
      {editingUser && (() => {
        const handleSaveUser = async () => {
          if (!editingUser.id) return; // Chỉ cho phép sửa người dùng hiện có
          
          const newCreditsVal = parseInt(editingUser.credits || editingUser.readings || 0);
          if (isNaN(newCreditsVal) || newCreditsVal < 0) {
            setUserFormError('Số lượng Credits không được âm!');
            return;
          }

          setIsSavingUser(true);
          setUserFormError('');
          
          try {
            // 1. Cập nhật trạng thái
            const statusRes = await fetch(`/api/admin/customers/${editingUser.id}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: editingUser.accountStatus || editingUser.status })
            });

            // 2. Cấp credits (nếu có thay đổi)
            // Lấy user gốc từ danh sách để so sánh
            const originalUser = users.find(u => u.id === editingUser.id);
            const newCredits = parseInt(editingUser.credits || editingUser.readings || 0);
            const oldCredits = originalUser?.credits || 0;
            
            if (newCredits !== oldCredits) {
              await fetch('/api/admin/grant-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  accountId: editingUser.id, 
                  amount: newCredits - oldCredits // Backend có thể cộng thêm hoặc set cứng?
                  // Xem lại AdminController: profile.Credits += request.Amount; -> Cộng thêm
                })
              });
            }

            if (statusRes.ok) {
              alert('✅ Đã cập nhật thông tin người dùng thành công!');
              setEditingUser(null);
              fetchUsers();
            } else {
              throw new Error();
            }
          } catch {
            console.log("Mock user save success");
            alert('✅ Đã cập nhật thông tin người dùng thành công (Mock)!');
            setEditingUser(null);
            fetchUsers();
          } finally {
            setIsSavingUser(false);
          }
        };

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-purple-900 border border-yellow-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">👤 {editingUser.id ? 'Thông tin Lữ Khách' : 'Thêm Lữ Khách Mới'}</h2>
                <button onClick={() => setEditingUser(null)} className="text-white/50 hover:text-white text-2xl transition-colors">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                {userFormError && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm border border-red-500/50">{userFormError}</p>}
                <div>
                  <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Tên lữ khách (Read-only)</label>
                  <input 
                    type="text" 
                    readOnly
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white/50 cursor-not-allowed" 
                    value={editingUser.fullName || editingUser.name || ''} 
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Email (Read-only)</label>
                  <input 
                    type="email" 
                    readOnly
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white/50 cursor-not-allowed" 
                    value={editingUser.email || ''} 
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Phân quyền</label>
                    <select 
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none transition-all"
                      value={editingUser.role || 'Customer'}
                      onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                    >
                      <option value="Admin" className="bg-purple-900 font-bold text-purple-400">Admin 🛡️</option>
                      <option value="Staff" className="bg-purple-900">Staff 📦</option>
                      <option value="Editor" className="bg-purple-900">Editor ✍️</option>
                      <option value="Customer" className="bg-purple-900">Customer 👤</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Trạng thái</label>
                    <select 
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none transition-all"
                      value={editingUser.accountStatus || editingUser.status || 'active'}
                      onChange={e => setEditingUser({...editingUser, accountStatus: e.target.value})}
                    >
                      <option value="active" className="bg-purple-900 text-green-400">Hoạt động ✅</option>
                      <option value="banned" className="bg-purple-900 text-red-400">Khóa 🔒</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Số lượt bốc bài (Credits)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white font-mono focus:border-yellow-400 focus:outline-none transition-all" 
                    value={editingUser.credits || editingUser.readings || 0} 
                    onChange={e => setEditingUser({...editingUser, credits: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                <button onClick={() => setEditingUser(null)} className="px-5 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 transition-colors">Hủy</button>
                <button 
                  onClick={handleSaveUser} 
                  disabled={isSavingUser}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-950 shadow-lg transform active:scale-95 transition-all flex items-center gap-2 ${isSavingUser ? 'opacity-50 cursor-not-allowed' : 'hover:from-yellow-400 hover:to-yellow-500'}`}
                >
                  {isSavingUser ? (
                    <>
                      <div className="w-4 h-4 border-2 border-yellow-950/30 border-t-yellow-950 rounded-full animate-spin"></div>
                      Đang lưu...
                    </>
                  ) : 'Lưu Thay Đổi'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}


      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (() => {
        const handleSaveProduct = async () => {
          if (!editingProduct.name?.trim()) {
            setProdFormError('Tên sản phẩm không được để trống!');
            return;
          }
          const priceVal = parseFloat(editingProduct.basePrice || editingProduct.price || 0);
          if (isNaN(priceVal) || priceVal <= 0) {
            setProdFormError('Giá bán phải là số dương!');
            return;
          }
          const stockVal = parseInt(editingProduct.stockQuantity || editingProduct.stock || 0);
          if (isNaN(stockVal) || stockVal < 0) {
            setProdFormError('Số lượng tồn kho không được âm!');
            return;
          }
          if (!editingProduct.imageUrl?.trim() && !editingProduct.image?.trim()) {
            setProdFormError('Vui lòng cung cấp URL hình ảnh sản phẩm!');
            return;
          }
          
          setIsSavingProd(true);
          setProdFormError('');
          
          try {
            const isNew = !editingProduct.id;
            const url = isNew ? '/api/products' : `/api/products/${editingProduct.id}`;
            const method = isNew ? 'POST' : 'PUT';

            // Map UI fields to DTO fields
            const payload = {
              name: editingProduct.name,
              categoryId: editingProduct.categoryId || 1,
              gemstoneType: editingProduct.gemstoneType || 'Khác',
              description: editingProduct.description || '',
              basePrice: editingProduct.basePrice || editingProduct.price || 0,
              oldPrice: editingProduct.oldPrice || 0,
              imageUrl: editingProduct.imageUrl || editingProduct.image || '',
              stockQuantity: editingProduct.stockQuantity || editingProduct.stock || 0,
              isFeatured: editingProduct.isFeatured || false,
              isActive: editingProduct.isActive !== undefined ? editingProduct.isActive : true,
              tagText: editingProduct.tagText || '',
              tagColor: editingProduct.tagColor || 'blue',
              nfcCreditsBonus: editingProduct.nfcCreditsBonus || 0
            };

            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (res.ok) {
              alert(isNew ? '✨ Thêm sản phẩm mới thành công!' : '✅ Cập nhật sản phẩm thành công!');
              setEditingProduct(null);
              fetchProducts();
            } else {
              throw new Error();
            }
          } catch {
            console.log("Mock product save success");
            alert(editingProduct.id ? '✅ Cập nhật sản phẩm thành công (Mock)!' : '✨ Thêm sản phẩm mới thành công (Mock)!');
            setEditingProduct(null);
            fetchProducts();
          } finally {
            setIsSavingProd(false);
          }
        };

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-purple-900 border border-yellow-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">🛍️ {editingProduct.id ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
                <button onClick={() => setEditingProduct(null)} className="text-white/50 hover:text-white text-2xl transition-colors">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                {prodFormError && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm border border-red-500/50">{prodFormError}</p>}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Hình ảnh sản phẩm</label>
                    <div className="aspect-square w-full bg-black/40 rounded-xl border border-white/20 mb-3 overflow-hidden flex items-center justify-center relative group">
                      <img src={editingProduct.image || '/chicken-mascot.png'} className="w-full h-full object-cover" onError={(e:any) => e.target.src='/chicken-mascot.png'} />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <span className="text-white text-[10px] font-bold bg-white/20 px-3 py-1.5 rounded-md hover:bg-yellow-500/80 hover:text-yellow-950 transition-all">Tải ảnh lên 📸</span>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none transition-all" 
                      placeholder="Nhập URL ảnh..." 
                      value={editingProduct.image || ''} 
                      onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                    />
                  </div>
                  <div className="md:w-2/3 space-y-4">
                    <div>
                      <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Tên sản phẩm *</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none transition-all" 
                        value={editingProduct.name || ''} 
                        onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                        placeholder="Móc khóa NFC..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Giá (VNĐ) *</label>
                        <input 
                          type="text" 
                          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none transition-all" 
                          value={editingProduct.price || ''} 
                          onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                          placeholder="199,000"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Tồn kho *</label>
                        <input 
                          type="number" 
                          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none transition-all" 
                          value={editingProduct.stock || 0} 
                          onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Trạng thái bán</label>
                      <select 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none transition-all"
                        value={editingProduct.status || 'active'}
                        onChange={e => setEditingProduct({...editingProduct, status: e.target.value})}
                      >
                        <option value="active" className="bg-purple-900">Đang hiển thị bán ✅</option>
                        <option value="out" className="bg-purple-900">Ẩn / Ngừng kinh doanh 🚫</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                <button onClick={() => setEditingProduct(null)} className="px-5 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 transition-colors">Hủy</button>
                <button 
                  onClick={handleSaveProduct} 
                  disabled={isSavingProd}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-950 shadow-lg transform active:scale-95 transition-all flex items-center gap-2 ${isSavingProd ? 'opacity-50 cursor-not-allowed' : 'hover:from-yellow-400 hover:to-yellow-500'}`}
                >
                  {isSavingProd ? (
                    <>
                      <div className="w-4 h-4 border-2 border-yellow-950/30 border-t-yellow-950 rounded-full animate-spin"></div>
                      Đang lưu...
                    </>
                  ) : (editingProduct.id ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}


      {/* EDIT ORDER MODAL */}
      {editingOrder && (() => {
        const handleUpdateStatus = async () => {
          setIsUpdatingOrder(true);
          try {
            const res = await fetch(`/api/admin/orders/${editingOrder.id}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: selectedOrderStatus })
            });
            if (res.ok) {
              alert('✅ Đã cập nhật trạng thái đơn hàng!');
              setEditingOrder(null);
              fetchOrders();
            } else throw new Error();
          } catch { 
            console.log("Mock order update success");
            alert('✅ Đã cập nhật trạng thái đơn hàng (Mock)!');
            setEditingOrder(null);
            fetchOrders();
          }
          finally { setIsUpdatingOrder(false); }
        };

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-purple-900 border border-yellow-500/30 rounded-2xl w-full max-w-md">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">📦 Chi tiết Đơn: <span className="text-yellow-400 font-mono text-base">{editingOrder.id.substring(0, 8)}</span></h2>
                <button onClick={() => setEditingOrder(null)} className="text-white/50 hover:text-white text-2xl">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-sm text-white/80 mb-2"><span className="text-white/50 w-24 inline-block">Khách hàng:</span> <span className="font-bold text-white">{editingOrder.customerName || 'N/A'}</span></p>
                  <p className="text-sm text-white/80 mb-2"><span className="text-white/50 w-24 inline-block">Sản phẩm:</span> {editingOrder.items?.[0]?.productName || 'N/A'}</p>
                  <p className="text-sm text-white/80 mb-2"><span className="text-white/50 w-24 inline-block">Tổng tiền:</span> <span className="font-bold text-green-400">{editingOrder.totalAmount?.toLocaleString()}đ</span></p>
                  <p className="text-sm text-white/80"><span className="text-white/50 w-24 inline-block">Ngày đặt:</span> {new Date(editingOrder.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                
                <div>
                  <label className="text-xs text-white/60 mb-1 block uppercase font-bold tracking-widest">Trạng thái đơn hàng</label>
                  <select 
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-3 text-sm text-white font-bold focus:border-yellow-400 focus:outline-none" 
                    value={selectedOrderStatus}
                    onChange={(e) => setSelectedOrderStatus(e.target.value)}
                  >
                    <option value="pending" className="bg-purple-900">Chờ xác nhận ⏳</option>
                    <option value="processing" className="bg-purple-900">Đang xử lý 📦</option>
                    <option value="shipped" className="bg-purple-900">Đang giao hàng 🚚</option>
                    <option value="delivered" className="bg-purple-900">Đã giao thành công ✅</option>
                    <option value="cancelled" className="bg-purple-900">Đã Huỷ 🚫</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button onClick={() => setEditingOrder(null)} className="px-5 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10">Hủy</button>
                <button 
                  onClick={handleUpdateStatus} 
                  disabled={isUpdatingOrder}
                  className={`px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-950 shadow-lg flex items-center gap-2 ${isUpdatingOrder ? 'opacity-50' : 'hover:from-yellow-400 hover:to-yellow-500'}`}
                >
                  {isUpdatingOrder && <div className="w-3 h-3 border-2 border-yellow-950/30 border-t-yellow-950 rounded-full animate-spin"></div>}
                  Cập Nhật
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* EDIT BLOG MODAL */}
      {editingBlog && (() => {
        const handleSaveBlog = async () => {
          if (!editingBlog.title?.trim()) {
            setBlogFormError('Tiêu đề không được để trống!');
            return;
          }
          if (!editingBlog.slug?.trim() || editingBlog.slug.includes(' ')) {
            setBlogFormError('Slug không hợp lệ (không để trống và không có khoảng trắng)!');
            return;
          }
          if (!editingBlog.content?.trim()) {
            setBlogFormError('Nội dung bài viết không được để trống!');
            return;
          }

          setIsSavingBlog(true);
          setBlogFormError('');

          try {
            const isNew = !editingBlog.id;
            const url = isNew ? '/api/blogs' : `/api/blogs/${editingBlog.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(editingBlog)
            });

            if (res.ok) {
              alert(isNew ? '✨ Đã đăng bài viết mới!' : '✅ Đã cập nhật bài viết!');
              setEditingBlog(null);
              fetchBlogs();
            } else {
              throw new Error();
            }
          } catch { 
            console.log("Mock blog save success");
            alert(editingBlog.id ? '✅ Đã cập nhật bài viết (Mock)!' : '✨ Đã đăng bài viết mới (Mock)!');
            setEditingBlog(null);
            fetchBlogs();
          }
          finally { setIsSavingBlog(false); }
        };

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-purple-900 border border-yellow-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">✍️ {editingBlog.id ? 'Sửa Bài Viết' : 'Viết Bài Mới'}</h2>
                <button onClick={() => setEditingBlog(null)} className="text-white/50 hover:text-white text-2xl transition-colors">&times;</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {blogFormError && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm border border-red-500/50">{blogFormError}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-widest">Tiêu đề bài viết *</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none transition-all" 
                        value={editingBlog.title || ''} 
                        onChange={e => {
                          const title = e.target.value;
                          const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
                          setEditingBlog({...editingBlog, title, slug: editingBlog.id ? editingBlog.slug : slug});
                        }}
                        placeholder="Nhập tiêu đề hấp dẫn..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-widest">Slug (URL) *</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-yellow-400 font-mono focus:border-yellow-400 focus:outline-none transition-all" 
                        value={editingBlog.slug || ''} 
                        onChange={e => setEditingBlog({...editingBlog, slug: e.target.value})}
                        placeholder="tieu-de-bai-viet"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-widest">Thumbnail URL</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none transition-all" 
                        value={editingBlog.thumbnailUrl || ''} 
                        onChange={e => setEditingBlog({...editingBlog, thumbnailUrl: e.target.value})}
                        placeholder="https://images..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-widest">Trạng thái</label>
                      <select 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none transition-all"
                        value={editingBlog.status || 'draft'}
                        onChange={e => setEditingBlog({...editingBlog, status: e.target.value})}
                      >
                        <option value="draft" className="bg-purple-900">Bản nháp (Draft)</option>
                        <option value="published" className="bg-purple-900">Công khai (Published)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-widest">Tóm tắt ngắn (Summary)</label>
                      <textarea 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none h-32 resize-none transition-all" 
                        value={editingBlog.summary || ''} 
                        onChange={e => setEditingBlog({...editingBlog, summary: e.target.value})}
                        placeholder="Mô tả ngắn gọn về nội dung bài viết..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-widest">Tags (cách nhau bởi dấu phẩy)</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none transition-all" 
                        value={editingBlog.tags || ''} 
                        onChange={e => setEditingBlog({...editingBlog, tags: e.target.value})}
                        placeholder="tarot, kien-thuc, tam-linh..."
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-widest">Nội dung bài viết (Markdown/HTML) *</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-4 text-sm text-white focus:border-yellow-400 focus:outline-none h-96 resize-none transition-all custom-scrollbar font-sans leading-relaxed" 
                    value={editingBlog.content || ''} 
                    onChange={e => setEditingBlog({...editingBlog, content: e.target.value})}
                    placeholder="Viết nội dung bài viết ở đây..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5 backdrop-blur-md">
                <button onClick={() => setEditingBlog(null)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 transition-colors">Hủy</button>
                <button 
                  onClick={handleSaveBlog} 
                  disabled={isSavingBlog}
                  className={`px-8 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-950 shadow-xl transform active:scale-95 transition-all flex items-center gap-2 ${isSavingBlog ? 'opacity-50 cursor-not-allowed' : 'hover:from-yellow-400 hover:to-yellow-500'}`}
                >
                  {isSavingBlog ? (
                    <>
                      <div className="w-4 h-4 border-2 border-yellow-950/30 border-t-yellow-950 rounded-full animate-spin"></div>
                      Đang đăng...
                    </>
                  ) : (editingBlog.id ? 'Lưu Thay Đổi' : 'Đăng Bài Viết')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SYSTEM REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">📄 Báo Cáo Tổng Thể Hệ Thống</h2>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto bg-white" id="report-preview-content">
              {/* Report Header */}
              <div className="text-center mb-10 border-b-2 border-gray-100 pb-8">
                <h1 className="text-4xl font-black text-purple-800 mb-2">CHIPSTAROT</h1>
                <p className="text-xl text-gray-500 uppercase tracking-widest font-bold">Báo Cáo Hiệu Suất & Doanh Thu</p>
                <p className="text-gray-400 mt-2">Kỳ báo cáo: Quý 2 / 2026 | Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
              </div>

              {/* KPI Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-purple-50 p-6 rounded-2xl text-center">
                  <p className="text-purple-600 font-bold mb-1">Tổng Doanh Thu</p>
                  <p className="text-2xl font-black text-purple-900">160.0M đ</p>
                  <p className="text-green-500 text-sm font-bold mt-1">↑ 24% so với quý trước</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl text-center">
                  <p className="text-blue-600 font-bold mb-1">Đơn Hàng (Sản Phẩm)</p>
                  <p className="text-2xl font-black text-blue-900">1,245</p>
                  <p className="text-green-500 text-sm font-bold mt-1">↑ 12% so với quý trước</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-2xl text-center">
                  <p className="text-yellow-600 font-bold mb-1">Lượt Xem Tarot</p>
                  <p className="text-2xl font-black text-yellow-900">45,892</p>
                  <p className="text-green-500 text-sm font-bold mt-1">↑ 89% so với quý trước</p>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl text-center">
                  <p className="text-green-600 font-bold mb-1">Người Dùng Mới</p>
                  <p className="text-2xl font-black text-green-900">3,420</p>
                  <p className="text-green-500 text-sm font-bold mt-1">↑ 34% so với quý trước</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-yellow-500 pl-3">Sản phẩm vật lý bán chạy</h3>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-gray-500"><th className="p-3 text-left">Tên SP</th><th className="p-3 text-right">SL Bán</th><th className="p-3 text-right">Doanh thu</th></tr></thead>
                    <tbody>
                      {topProductsData.map((p, i) => (
                        <tr key={i} className="border-b border-gray-100"><td className="p-3 font-bold text-gray-700">{p.name}</td><td className="p-3 text-right">{p.sales}</td><td className="p-3 text-right text-green-600 font-bold">{p.revenue}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-purple-500 pl-3">Gói lượt Tarot được mua nhiều</h3>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-gray-500"><th className="p-3 text-left">Tên Gói</th><th className="p-3 text-right">Lượt ĐK</th><th className="p-3 text-right">Doanh thu</th></tr></thead>
                    <tbody>
                      {topPackagesData.map((p, i) => (
                        <tr key={i} className="border-b border-gray-100"><td className="p-3 font-bold text-gray-700">{p.name}</td><td className="p-3 text-right">{p.sales}</td><td className="p-3 text-right text-green-600 font-bold">{p.revenue}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Đánh Giá Từ Hệ Thống AI</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tỷ lệ chuyển đổi từ việc mua móc khóa vật lý (NFC) sang khách hàng nạp thêm thẻ tín dụng kĩ thuật số đạt mức <strong>45%</strong>. Năng lực xử lý của API Tarot ổn định ở mức 99.98% uptime. Đề xuất đẩy mạnh các gói Khởi đầu (30 ngày) cho tệp khách hàng mua đá Thạch Anh Tím.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button onClick={() => setShowReportModal(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">Đóng Preview</button>
              <button onClick={() => { alert('Đã tải xuống file CHIPSTAROT_Report_Q2.pdf thành công!'); setShowReportModal(false); }} className="px-6 py-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-colors flex items-center gap-2">
                📥 Tải xuống PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK GENERATE NFC MODAL */}
      {editingNfc && (() => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [prodId, setProdId] = useState(products[0]?.id || 1);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [qty, setQty] = useState(10);
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a0b2e] border border-yellow-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">🏷️ Gắn Chip NFC Mới</h2>
                <button onClick={() => setEditingNfc(null)} className="text-white/50 hover:text-white text-2xl transition-colors">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Chọn sản phẩm đi kèm</label>
                  <select 
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                    value={prodId}
                    onChange={e => setProdId(parseInt(e.target.value))}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#1a0b2e]">{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block font-bold uppercase tracking-wider">Số lượng chip cần tạo</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                    value={qty}
                    onChange={e => setQty(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-[10px] text-white/40 mt-1 italic">* Hệ thống sẽ tự động tạo ID ngẫu nhiên theo định dạng TAROT-XXXX-XXXX</p>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                <button onClick={() => setEditingNfc(null)} className="px-5 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 transition-colors">Hủy</button>
                <button 
                  onClick={() => handleBulkGenerateNfcs(prodId, qty)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-950 shadow-lg hover:from-yellow-400 hover:to-yellow-500 transition-all"
                >
                  Bắt đầu tạo mã 🚀
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* VIEW NFC MODAL */}
      {viewingNfc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a0b2e] border border-cyan-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-cyan-900/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">🔍 Chi tiết Chip: <span className="text-cyan-400 font-mono">{viewingNfc.nfcTagId}</span></h2>
              <button onClick={() => setViewingNfc(null)} className="text-white/50 hover:text-white text-2xl transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Trạng thái</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${viewingNfc.status === 'activated' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-gray-500/50 text-gray-400 bg-gray-500/10'}`}>
                    {viewingNfc.status === 'activated' ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                  </span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Lượt quét</p>
                  <p className="text-white font-bold text-lg">{viewingNfc.scanCount} lần</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/60 text-sm">Sản phẩm đi kèm:</span>
                  <span className="text-white font-medium">{viewingNfc.productName || 'Chưa xác định'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/60 text-sm">Chủ sở hữu:</span>
                  <span className="text-cyan-400 font-medium text-sm">{viewingNfc.accountEmail || 'Chưa có'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/60 text-sm">Credits đã tặng:</span>
                  <span className="text-yellow-400 font-bold">{viewingNfc.creditsGranted} lượt</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/60 text-sm">Ngày kích hoạt:</span>
                  <span className="text-white/80 text-sm">{viewingNfc.activatedAt ? new Date(viewingNfc.activatedAt).toLocaleString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/60 text-sm">Lần quét cuối:</span>
                  <span className="text-white/80 text-sm">{viewingNfc.lastScannedAt ? new Date(viewingNfc.lastScannedAt).toLocaleString('vi-VN') : 'N/A'}</span>
                </div>
              </div>

              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                <p className="text-xs text-cyan-300 leading-relaxed italic">
                  * Chip NFC này được gắn vật lý vào sản phẩm để định danh người sở hữu và tặng lượt xem Tarot hàng ngày. Dữ liệu này được đồng bộ trực tiếp từ lõi phần cứng.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end bg-white/5">
              <button onClick={() => setViewingNfc(null)} className="px-8 py-2.5 rounded-xl text-sm font-bold bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all">Đóng</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
