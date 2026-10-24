// api/send-message.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, visitorInfo } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0 || text.length > 300) {
    return res.status(400).json({ error: 'Invalid text length' });
  }

  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Безопасное экранирование текста пользователя для HTML
  const safeText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Блок с информацией об отправителе завернут в тег <tg-spoiler>
  const fullMessage =
    `📩 <b>New anonymous message from the site:</b>\n\n` +
    `💬 <b>Message (${text.length}/300 chars):</b>\n${safeText}\n\n` +
    `<tg-spoiler>📊 <b>Visitor Info:</b>\n` +
    `🌐 IP & Location: ${visitorInfo?.ipLocation || "Unknown"}\n` +
    `🗣 System Language: ${visitorInfo?.systemLang || "Unknown"}\n` +
    `💻 Platform: ${visitorInfo?.platform || "Unknown"}\n` +
    `📱 User-Agent: ${visitorInfo?.userAgent || "Unknown"}</tg-spoiler>`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: fullMessage, 
        parse_mode: "HTML" // Включаем поддержку HTML-тегов, включая спойлер
      })
    });
    const tgData = await tgRes.json();

    if (tgData.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: "Telegram API error" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Network error" });
  }
}
