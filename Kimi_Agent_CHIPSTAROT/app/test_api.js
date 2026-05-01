// Sử dụng mã từ .env hoặc điền thủ công khi test (KHÔNG LƯU MÃ VÀO ĐÂY KHI PUSH GITHUB)
const apiKey = process.env.VITE_GEMINI_API_KEY || 'YOUR_NEW_GEMINI_API_KEY_HERE';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [{ parts: [{ text: 'Test' }] }] })
}).then(async r => {
  console.log(r.status);
  const data = await r.json();
  console.log(JSON.stringify(data, null, 2));
}).catch(console.error);
