const apiKey = 'AIzaSyABYP5dm8mkHjKDs3Xcj1v4xHf-fCJhz4E';
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
