const axios = require('axios');
const config = require('../config');
const { cmd } = require('../command');

// --- Ovnix AI System Prompt (භාෂා පාලනය සහ උපදෙස්) ---
const SYSTEM_PROMPT = `
Role: You are "Ovnix AI", the official virtual assistant for Ovnix (Web Development Company in Sri Lanka).
STRICT RULE: Always respond in 100% SINHALA language ONLY.
Instruction: Even if the user talks to you in English, Singlish, or any other language, your reply MUST be in professional and friendly SINHALA.

Company Details:
- Services: Web Design, Full-stack Development, WhatsApp Bot Development.
- Pricing: Starting from Rs. 25,000 upwards.
- Tone: Professional, Helpful, and Courteous.
`;

/**
 * AI API එකෙන් පිළිතුරු ලබා ගැනීම සඳහා පොදු Function එක
 */
async function getOvnixAIResponse(userInput, pushname) {
    try {
        const query = `${SYSTEM_PROMPT}\n\nUser: ${pushname}\nMessage: ${userInput}\n(Important: Respond ONLY in Sinhala)`;
        const apiUrl = `https://d-ai-beige.vercel.app/api/gemini?q=${encodeURIComponent(query)}`;
        
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
// 1. .gemini COMMAND (ප්‍රශ්න ඇසීමට භාවිතා කළ හැක)
// -------------------------------------------------------------------
cmd({
    pattern: "gemini",
    react: "🤖",
    desc: "Talk to Ovnix AI using command",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, pushname }) => {
    try {
        const text = args.join(" ");
        if (!text) return reply("කරුණාකර ප්‍රශ්නයක් අසන්න. (උදා: .gemini වෙබ් අඩවියක් හදන්න කීයක් යනවද?) ");

        // AI පිළිතුර ලබා ගැනීම
        const result = await getOvnixAIResponse(text, pushname || "User");

        if (result) {
            // පිළිතුර පින්තූරයක්ද නැද්ද යන්න අනුව යැවීම
            if (result.startsWith("http") && (result.includes("googleusercontent") || result.includes("image"))) {
                await conn.sendMessage(from, { image: { url: result }, caption: "✨ Ovnix AI" }, { quoted: mek });
            } else {
                await reply(result);
            }
        } else {
            await reply("❌ සමාවන්න, පිළිතුරක් ලබා ගැනීමට නොහැකි විය.");
        }
    } catch (e) {
        console.error(e);
        reply("❌ දෝෂයක් සිදු විය.");
    }
});

// -------------------------------------------------------------------
// 2. AUTO CHATBOT (සාමාන්‍ය පණිවිඩ වලට ස්වයංක්‍රීයව පිළිතුරු දීම)
// -------------------------------------------------------------------
cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  isCmd,
  reply,
  sender,
  pushname
}) => {
  try {
    // නීති: තමන්ගෙම මැසේජ් වලට, මැසේජ් එකක් නැතිනම්, හෝ Command එකක් නම් ක්‍රියාත්මක නොවේ
    if (m.fromMe || !body || isCmd) return;

    // Chatbot ON ද කියා පරීක්ෂා කිරීම
    if (config.CHAT_BOT === "true") {
      
      // 1. පණිවිඩයට React කිරීම (🤖)
      await conn.sendMessage(from, { 
        react: { 
          text: "🤖", 
          key: m.key 
        } 
      });

      // 2. AI පිළිතුර ලබා ගැනීම
      const aiResult = await getOvnixAIResponse(body, pushname || "User");

      if (aiResult) {
        // 3. පිළිතුර පින්තූරයක්ද නැද්ද යන්න අනුව යැවීම
        if (aiResult.startsWith("http") && (aiResult.includes("googleusercontent") || aiResult.includes("image"))) {
            await conn.sendMessage(from, { 
                image: { url: aiResult }, 
                caption: "✨ Ovnix AI" 
            }, { quoted: m });
        } else {
            await conn.sendMessage(from, { text: aiResult }, { quoted: m });
        }
      }
    }

  } catch (error) {
    console.error("Chatbot Error:", error);
  }
});
