// Tất cả dữ liệu tĩnh của ứng dụng

export const TAROT_DB = {
  cards: [] as any[]
};

// Load tarot data
fetch('/tarot_database.json')
  .then(r => r.json())
  .then(d => { TAROT_DB.cards = d.cards; })
  .catch(() => {
    TAROT_DB.cards = [
      { id: 0, name: "The Fool", arcana: "Major", image: "/tarot-cards/00-the-fool.jpg", meanings: { general: "Khởi đầu mới, vô tư, tiềm năng", love: "Tình yêu mới bắt đầu", marriage: "Hôn nhân mới", career: "Cơ hội mới", study: "Bắt đầu học tập", finance: "Cơ hội tài chính", investment: "Đầu tư mới", health: "Sức khỏe tốt", self: "Hành trình mới" }},
      { id: 1, name: "The Magician", arcana: "Major", image: "/tarot-cards/01-the-magician.jpg", meanings: { general: "Sức mạnh ý chí, khả năng", love: "Chủ động trong tình yêu", marriage: "Xây dựng hôn nhân", career: "Thành công nhờ kỹ năng", study: "Thành công nhờ nỗ lực", finance: "Tạo ra tiền bạc", investment: "Đầu tư thông minh", health: "Sức khỏe tốt", self: "Khai mở tiềm năng" }},
    ];
  });

export const TOPICS = [
  { id: 'love', name: '💖 Tình Yêu', desc: 'Hẹn hò, tán tỉnh, đang yêu', color: 'from-pink-400 to-rose-500', icon: '💖' },
  { id: 'marriage', name: '💍 Hôn Nhân', desc: 'Đời sống vợ chồng, gia đình', color: 'from-red-400 to-pink-500', icon: '💍' },
  { id: 'career', name: '💼 Sự Nghiệp', desc: 'Công việc, đi làm, thăng tiến', color: 'from-blue-400 to-indigo-500', icon: '💼' },
  { id: 'study', name: '📚 Học Tập', desc: 'Trường lớp, thi cử, ngành học', color: 'from-green-400 to-emerald-500', icon: '📚' },
  { id: 'finance', name: '💰 Tài Chính', desc: 'Tiền bạc cá nhân, thu chi', color: 'from-yellow-400 to-amber-500', icon: '💰' },
  { id: 'investment', name: '📈 Đầu Tư', desc: 'Kinh doanh, rót vốn, dự án', color: 'from-orange-400 to-red-500', icon: '📈' },
  { id: 'health', name: '🌿 Sức Khỏe', desc: 'Thể trạng, bệnh lý', color: 'from-teal-400 to-green-500', icon: '🌿' },
  { id: 'self', name: '🧘‍♀️ Bản Thân & Chữa Lành', desc: 'Tâm lý, phát triển bản thân', color: 'from-purple-400 to-violet-500', icon: '🧘‍♀️' },
  { id: 'general', name: '🌌 Thông Điệp Tổng Quan', desc: 'Tùy ý vũ trụ', color: 'from-indigo-400 to-blue-500', icon: '🌌' },
];

export const SUB_QUESTIONS: Record<string, { question: string; options: { text: string; value: string }[] }> = {
  love: {
    question: "Trạng thái tình cảm hiện tại của bạn đang nghiêng về hướng nào?",
    options: [
      { text: "✨ Độc thân & đang chờ đợi một kết nối mới", value: "single" },
      { text: "👀 Đang 'mập mờ' / Thầm thương trộm nhớ ai đó", value: "crush" },
      { text: "🥰 Đang trong một mối quan hệ hạnh phúc", value: "happy" },
      { text: "⛈️ Đang trục trặc / Cãi vã / Lạnh nhạt", value: "conflict" },
      { text: "💔 Vừa trải qua đổ vỡ / Đang tổn thương", value: "heartbroken" },
    ]
  },
  marriage: {
    question: "Tình trạng hôn nhân của bạn hiện tại đang ở giai đoạn nào?",
    options: [
      { text: "🥰 Đang êm ấm, bình yên và thấu hiểu nhau", value: "harmony" },
      { text: "🌫️ Đang nhạt nhẽo, thiếu kết nối", value: "dull" },
      { text: "⚡ Đang có mâu thuẫn lớn / Cãi vã thường xuyên", value: "conflict" },
      { text: "💔 Đang đứng trên bờ vực ly hôn / Ly thân", value: "divorce" },
      { text: "🌪️ Có sự xuất hiện của người thứ ba", value: "third_party" },
    ]
  },
  career: {
    question: "Từ khóa nào mô tả đúng nhất tình hình công việc của bạn lúc này?",
    options: [
      { text: "🧱 Đang bế tắc / Mất động lực / Chán nản", value: "stuck" },
      { text: "🧭 Đang muốn thay đổi môi trường / Tìm hướng đi mới", value: "change" },
      { text: "⚖️ Đang đứng trước quyết định/ngã rẽ quan trọng", value: "decision" },
      { text: "📈 Mọi thứ đang phát triển tốt, muốn biết tương lai", value: "growing" },
      { text: "🔍 Đang tìm việc / Khó khăn về tài chính", value: "jobless" },
    ]
  },
  study: {
    question: "Vấn đề lớn nhất của bạn trong việc học lúc này là gì?",
    options: [
      { text: "🤯 Đang quá tải / Áp lực thi cử cận kề", value: "overload" },
      { text: "🧭 Phân vân không biết chọn trường / Chọn ngành nào", value: "confused" },
      { text: "🥱 Chán nản / Mất gốc / Không có động lực học", value: "bored" },
      { text: "⏳ Đang hồi hộp chờ đợi kết quả thi/xét duyệt", value: "waiting" },
      { text: "🚀 Đang học tốt, muốn biết kết quả sắp tới", value: "good" },
    ]
  },
  finance: {
    question: "Tình hình tài chính của bạn lúc này như thế nào?",
    options: [
      { text: "📉 Đang khó khăn, cần giải pháp gấp", value: "hard" },
      { text: "⚖️ Đang cân bằng nhưng muốn cải thiện", value: "balance" },
      { text: "📊 Thu nhập ổn định, muốn tăng thêm", value: "stable" },
      { text: "💸 Chi tiêu không kiểm soát được", value: "spend" },
      { text: "🎯 Có mục tiêu tài chính rõ ràng", value: "goal" },
    ]
  },
  investment: {
    question: "Tình hình dự án kinh doanh / khoản đầu tư của bạn ra sao?",
    options: [
      { text: "⚖️ Đang cầm tiền, phân vân có nên xuống tiền", value: "hesitate" },
      { text: "📉 Đang gồng lỗ / Bị kẹt vốn / Dự án đình trệ", value: "losing" },
      { text: "🌱 Mới bắt đầu khởi nghiệp / Giai đoạn đầu", value: "startup" },
      { text: "🚀 Đang sinh lời tốt, muốn mở rộng", value: "profitable" },
      { text: "🤝 Đang tìm kiếm đối tác / Người góp vốn", value: "partner" },
    ]
  },
  health: {
    question: "Bạn đang quan tâm đến khía cạnh nào của sức khỏe?",
    options: [
      { text: "🤒 Cơ thể mệt mỏi, suy nhược kéo dài", value: "tired" },
      { text: "🩺 Đang trong quá trình điều trị bệnh / Uống thuốc", value: "treatment" },
      { text: "⏳ Đang chờ kết quả xét nghiệm / Khám bệnh", value: "testing" },
      { text: "💪 Sức khỏe ổn định, muốn kiểm tra thông điệp", value: "check" },
      { text: "🧠 Vấn đề tinh thần, stress, lo âu", value: "mental" },
    ]
  },
  self: {
    question: "Thế giới bên trong bạn lúc này đang cảm thấy ra sao?",
    options: [
      { text: "🥀 Đang kiệt sức / Overthinking", value: "exhausted" },
      { text: "🌫️ Trống rỗng / Mất kết nối với chính mình", value: "empty" },
      { text: "🩹 Vẫn đang mang một nỗi buồn/ám ảnh cũ", value: "healing" },
      { text: "🌱 Đang bình yên và muốn thấu hiểu bản thân", value: "peaceful" },
    ]
  },
  general: {
    question: "Năng lượng của bạn hôm nay như thế nào?",
    options: [
      { text: "🥱 Hơi uể oải / Thiếu năng lượng", value: "tired" },
      { text: "🤔 Đang phân vân, cần lời khuyên ngẫu nhiên", value: "confused" },
      { text: "😊 Đang rất vui vẻ, tích cực", value: "happy" },
      { text: "🤫 Khá bình thường, chỉ là tò mò", value: "curious" },
    ]
  },
};

export const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  love: [
    "Người ấy đang thực sự nghĩ gì / cảm thấy gì về tôi?",
    "Diễn biến tình cảm của tôi trong 3 tháng tới sẽ ra sao?",
    "Liệu mối quan hệ này có cơ hội quay lại không?",
    "Tôi cần làm gì để thu hút đúng người?",
  ],
  marriage: [
    "Vấn đề cốt lõi thực sự giữa vợ/chồng tôi lúc này là gì?",
    "Tôi cần làm gì để hàn gắn cuộc hôn nhân này?",
    "Tương lai của cuộc hôn nhân này sẽ đi về đâu?",
    "Bài học tôi cần nhận ra trong mối quan hệ này là gì?",
  ],
  career: [
    "Tôi có nên nghỉ việc / chuyển việc vào thời điểm này không?",
    "Làm sao để tôi vượt qua sự bế tắc trong công việc?",
    "Cơ hội thăng tiến / tăng lương của tôi thế nào?",
    "Tôi nên giữ thái độ thế nào với sếp/đồng nghiệp?",
  ],
  study: [
    "Tôi có đang đi đúng hướng với ngành học hiện tại không?",
    "Kết quả kỳ thi / dự án sắp tới của tôi sẽ ra sao?",
    "Điều gì đang cản trở việc học và làm sao để khắc phục?",
    "Lời khuyên nào giúp tôi lấy lại động lực học tập?",
  ],
  finance: [
    "Tình hình tài chính của tôi sắp tới có khởi sắc không?",
    "Tôi cần thay đổi điều gì để thoát khỏi bế tắc tiền bạc?",
    "Lỗ hổng nào đang làm thất thoát dòng tiền của tôi?",
    "Thông điệp vũ trụ về quản lý tài chính cho tôi là gì?",
  ],
  investment: [
    "Dự án / Kế hoạch kinh doanh sắp tới có khả quan không?",
    "Tôi có nên hợp tác với đối tác này không?",
    "Rủi ro lớn nhất trong quyết định đầu tư lúc này là gì?",
    "Tôi cần chiến lược gì để mở rộng công việc kinh doanh?",
  ],
  health: [
    "Thông điệp vũ trụ cho tình trạng sức khỏe của tôi là gì?",
    "Tôi cần thay đổi thói quen sinh hoạt nào?",
    "Nguồn gốc tâm lý nào đang ảnh hưởng đến sức khỏe tôi?",
    "Lời khuyên nào giúp tôi phục hồi năng lượng nhanh nhất?",
  ],
  self: [
    "Nỗi đau / Tổn thương nào mà tôi cần đối mặt và chữa lành?",
    "Làm sao để thoát khỏi tình trạng suy nghĩ tiêu cực?",
    "Bài học linh hồn mà tôi cần giác ngộ là gì?",
    "Vũ trụ muốn tôi tập trung vào điều gì lúc này?",
  ],
  general: [
    "Vũ trụ muốn nhắn nhủ điều gì quan trọng nhất đến tôi hôm nay?",
    "Năng lượng tuần mới / tháng mới của tôi sẽ xoay quanh vấn đề gì?",
    "Điều bất ngờ hoặc cơ hội nào sắp đến với tôi?",
    "Tôi đang mang năng lượng gì và nó đang thu hút điều gì?",
  ],
};

export const PRODUCTS = [
  { id: 1, name: "Móc khóa NFC CHIPSTAROT", desc: "Chạm vào điện thoại để xem bài Tarot mỗi ngày. Tặng kèm 10 lượt bốc bài!", price: 199000, oldPrice: 299000, image: "/products/nfc-chick.jpg", rating: 4.9, reviews: 128, tag: "Bán chạy", tagColor: "bg-red-500", nfcCredits: 10 },
  { id: 2, name: "Móc khóa Đá Thạch Anh Tím", desc: "Đá thạch anh tím tự nhiên, mang lại bình an và may mắn. Tặng kèm 10 lượt bốc bài!", price: 89000, oldPrice: 129000, image: "/products/amethyst.jpg", rating: 4.8, reviews: 86, tag: "Mới", tagColor: "bg-green-500", nfcCredits: 10 },
  { id: 3, name: "Móc khóa Đá Mắt Hổ", desc: "Đá mắt hổ mang lại sự tự tin và bảo vệ. Tặng kèm 10 lượt bốc bài!", price: 79000, oldPrice: 99000, image: "/products/tiger-eye.jpg", rating: 4.7, reviews: 52, tag: "", tagColor: "", nfcCredits: 10 },
  { id: 4, name: "Móc khóa Đá Thạch Anh Hồng", desc: "Đá thạch anh hồng mang lại tình yêu và sự hòa hợp. Tặng kèm 10 lượt bốc bài!", price: 85000, oldPrice: 109000, image: "/products/rose-quartz.jpg", rating: 4.9, reviews: 34, tag: "", tagColor: "", nfcCredits: 10 },
  { id: 5, name: "Móc khóa Đá Aventurine Xanh", desc: "Đá aventurine xanh mang lại may mắn và thịnh vượng. Tặng kèm 10 lượt bốc bài!", price: 79000, oldPrice: 99000, image: "/products/green-stone.jpg", rating: 4.7, reviews: 45, tag: "Mới", tagColor: "bg-green-500", nfcCredits: 10 },
  { id: 6, name: "Móc khóa Đá Thạch Anh Trắng", desc: "Đá thạch anh trắng trong suốt, khuếch đại năng lượng tích cực. Tặng kèm 10 lượt bốc bài!", price: 69000, oldPrice: 89000, image: "/products/clear-quartz.jpg", rating: 4.8, reviews: 67, tag: "", tagColor: "", nfcCredits: 10 },
];

// ─── Gói Mua Lượt Tarot (Digital Credit Packages) ───
// expiryDays: số ngày lượt còn hiệu lực kể từ ngày mua (khớp với schema.sql)
export const CREDIT_PACKAGES = [
  {
    id: 'cp_starter',
    name: 'Gói Khởi Đầu',
    credits: 5,
    price: 29000,
    oldPrice: 39000,
    expiryDays: 30,                              // *** Hạn dùng: 30 ngày ***
    expiryLabel: '30 ngày',
    icon: '🌙',
    tag: '',
    tagColor: '',
    color: 'from-indigo-400 to-purple-500',
    desc: 'Trải nghiệm 5 lần bốc bài trong 30 ngày, phù hợp người mới.',
    perCredit: 5800,
  },
  {
    id: 'cp_popular',
    name: 'Gói Phổ Biến',
    credits: 15,
    price: 69000,
    oldPrice: 99000,
    expiryDays: 90,                              // *** Hạn dùng: 90 ngày ***
    expiryLabel: '90 ngày',
    icon: '🔮',
    tag: 'Phổ biến nhất',
    tagColor: 'bg-purple-500',
    color: 'from-purple-500 to-pink-500',
    desc: '15 lượt bốc bài trong 90 ngày — tiết kiệm 30% so với mua lẻ.',
    perCredit: 4600,
  },
  {
    id: 'cp_premium',
    name: 'Gói Cao Cấp',
    credits: 50,
    price: 179000,
    oldPrice: 290000,
    expiryDays: 365,                             // *** Hạn dùng: 365 ngày (1 năm) ***
    expiryLabel: '365 ngày',
    icon: '✨',
    tag: 'Tiết kiệm 38%',
    tagColor: 'bg-yellow-500',
    color: 'from-yellow-400 to-orange-500',
    desc: '50 lượt bốc bài trong 365 ngày — dành cho tín đồ Tarot thực thụ.',
    perCredit: 3580,
  },
];
