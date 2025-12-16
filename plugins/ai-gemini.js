const config = require('../config');
const {cmd , commands} = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require ("axios");

const GEMINI_API_KEY = "AIzaSyC8pSIvRTtYS-ZghDZWWPUY360gEFB37hM";

cmd(
  {
    pattern: "gemini2",
    react: "🤖",
    desc: "Ask Gemini AI anything",
    category: "ai",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      if (!q)
        return reply("❓ Please provide a question.\n\n*Example:* `.ask What is the capital of France?`");

      await reply("🤖 Gemini is thinking...");

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: q }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const aiReply = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!aiReply) return reply("❌ Gemini did not return a valid response.");

      await robin.sendMessage(from, { text: `🤖 *Gemini says:*\n\n${aiReply}` }, { quoted: mek });
    } catch (e) {
      const errMsg = e?.response?.data?.error?.message || e.message || "Unknown error occurred.";
      console.error("Gemini API Error:", errMsg);
      reply(`❌ Error from Gemini API:\n\n${errMsg}`);
    }
  }
);


cmd({
    pattern: "gemini",
    desc: "Chat with Gemini AI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Gemini AI.\nExample: `.gemini Hello`");

        const apiUrl = `https://sadiya-tech-apis.vercel.app/ai/gemini?q=${encodeURIComponent(q)}&apikey=YOU_API_KEY`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            await react("❌");
            return reply("Gemini AI failed to respond. Please try again later.");
        }

        await reply(`🧠 *Gemini AI Response:*\n\n${data.result}`);
        await react("✅");
    } catch (e) {
        console.error("Error in Gemini AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with Gemini AI.");
    }
});


cmd({
    pattern: "lirik",
    desc: "Get song lyrics",
    category: "tools",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, react }) => {
    try {
        if (!q) {
            return reply(
                "Please provide a song title.\n\nExample: .lirik Lelena"
            );
        }

        const apiUrl = `https://api.zenzxz.my.id/api/tools/lirik?title=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.success || !data.data || !data.data.result || data.data.result.length === 0) {
            await react("❌");
            return reply("Lyrics not found.");
        }

        const song = data.data.result[0];

        let text = `🔍 *Lyrics Track Found* 🎵\n\n`;
        text += `*📝 Name / TrackName:* ${song.trackName}\n`;
        text += `*🕵️ ArtistName:* ${song.artistName}\n`;
        text += `*💽 AlbumName:* ${song.albumName}\n`;
        text += `*⏱️ Duration:* ${song.duration}s\n\n`;
        text += `*📃 PlainLyrics:*\n ${song.plainLyrics}\n\n`;
        text += `*📊 SyncedLyrics:*\n ${song.syncedLyrics}\n\n`;
        text += `> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;
       
        await reply(text);
        await react("✅");

    } catch (e) {
        console.error("Lirik Error:", e);
        await react("❌");
        reply("An error occurred while fetching lyrics.");
    }
});
