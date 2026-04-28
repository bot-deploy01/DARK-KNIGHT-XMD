const axios = require('axios');
const config = require('../config');
const { cmd } = require('../command');

/**
 * AI API එකෙන් පිළිතුරු ලබා ගැනීම සඳහා පොදු Function එක
 */
async function getAIResponse(userInput) {
    try {
        // AI එකට සිංහලෙන් පමණක් පිළිතුරු දීමට බල කිරීම සඳහා උපදෙස් එකතු කිරීම
        const prompt = `Strictly respond in 100% Sinhala language only. User message: ${userInput}`;
        const apiUrl = `https://d-ai-beige.vercel.app/api/gemini?q=${encodeURIComponent(prompt)}`;
        
        const response = await axios.get(apiUrl);

        if (response.data && response.data.success) {
            return response.data.result;
        }
        return null;
    } catch (e) {
        console.error("AI API Error:", e);
        return null;
    }
}

// -------------------------------------------------------------------
// 1. .gemini COMMAND (ප්‍රශ්න ඇසීමට)
// -------------------------------------------------------------------
cmd({
    pattern: "gemini",
    react: "🤖",
    desc: "Talk to AI in Sinhala",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        const text = args.join(" ");
        if (!text) return reply("කරුණාකර ප්‍රශ්නයක් අසන්න.");

        // AI පිළිතුර ලබා ගැනීම
        const result = await getAIResponse(text);

        if (result) {
            await reply(result);
        } else {
            await reply("❌ සමාවන්න, පිළිතුරක් ලබා ගැනීමට නොහැකි විය.");
        }
    } catch (e) {
        console.error(e);
        reply("❌ දෝෂයක් සිදු විය.");
    }
});

// -------------------------------------------------------------------
// 2. AUTO CHATBOT (සාමාන්‍ය මැසේජ් වලට 100% සිංහලෙන් පිළිතුරු දීම)
// -------------------------------------------------------------------
cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  isCmd,
  reply
}) => {
  try {
    // තමන්ගේ මැසේජ් වලට හෝ Command වලට හෝ හිස් මැසේජ් වලට ක්‍රියා නොකරයි
    if (m.fromMe || !body || isCmd) return;

    // Chatbot එක ON කර ඇත්නම් පමණක් ක්‍රියා කරයි
    if (config.CHAT_BOT === "true") {
      
      // AI පිළිතුර ලබා ගැනීම
      const aiResult = await getAIResponse(body);

      if (aiResult) {
        // AI එකෙන් පිළිතුරක් ලැබුනොත් පමණක් React කර Text එක යවයි
        await conn.sendMessage(from, { react: { text: "🤖", key: m.key } });
        await conn.sendMessage(from, { text: aiResult }, { quoted: m });
      }
    }
  } catch (error) {
    console.error("Chatbot Error:", error);
  }
});
