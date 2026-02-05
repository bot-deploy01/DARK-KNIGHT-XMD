const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "spotify",
    desc: "Search Spotify tracks",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("*Please provide a song name to search on Spotify.*");

        reply("🔍 *Searching Spotify... Please wait!*");

        const { data } = await axios.get(`https://vajira-api.vercel.app/search/spotify?q=`, {
            params: { q }
        });

        if (!data.status || !data.result || data.result.length === 0)
            return reply("*No songs found!*");

        let txt = `🎧 *SPOTIFY SEARCH RESULTS*\n\n`;
        data.result.slice(0, 30).forEach((s, i) => {
            const durationSec = Math.floor(s.duration / 1000);
            const min = Math.floor(durationSec / 60).toString().padStart(2, '0');
            const sec = (durationSec % 60).toString().padStart(2, '0');
            txt += `*${i + 1}. ${s.title}*\n👤 Artist: ${s.artist}\n⏱️ Duration: ${min}:${sec}\n🔥 Popularity: ${s.popularity}\n🔗 ${s.url}\n\n`;
        });

        txt += `> *© Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳*`;

        await conn.sendMessage(from, { text: txt }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply("*Error fetching Spotify data.*");
    }
});


cmd({
    pattern: "spotify2",
    alias: ["spot2"],
    react: "🎵",
    desc: "Download Spotify MP3",
    category: "download",
    use: ".spotify2 <spotify link>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("❓ Please provide a Spotify track link!");

        if (!q.includes("spotify.com/track")) {
            return reply("❌ Invalid Spotify link! Please send a valid Spotify track URL.");
        }

        const api = `https://api-aswin-sparky.koyeb.app/api/downloader/spotify?url=${encodeURIComponent(q)}`;
        const { data: apiRes } = await axios.get(api);

        if (!apiRes?.status || !apiRes.data?.download) {
            return reply("❌ Unable to download this Spotify track. Please try another link!");
        }

        const result = apiRes.data;

        // Convert duration from milliseconds → mm:ss
        const minutes = Math.floor(result.durasi / 60000);
        const seconds = Math.floor((result.durasi % 60000) / 1000);
        const duration = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

        const caption = `
🎧 *Spotify Downloader* 📥

📑 *Title:* ${result.title}
👤 *Artist:* ${result.artis}
⏱️ *Duration:* ${duration}
🎶 *Type:* ${result.type}
🔗 *Link:* ${q}

🔢 *Reply Below Number*

1️⃣ *Audio Type*
2️⃣ *Document Type*
3️⃣ *Voice Note*

> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙄𝙶𝙷𝚃-𝚇𝙼𝙳
`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: result.cover },
            caption
        }, { quoted: m });

        const messageID = sentMsg.key.id;

        conn.ev.on("messages.upsert", async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;

            const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToBot) {
                await conn.sendMessage(senderID, { react: { text: '⏳', key: receivedMsg.key } });

                switch (receivedText.trim()) {
                    case "1":
                        await conn.sendMessage(senderID, {
                            audio: { url: result.download },
                            mimetype: "audio/mpeg",
                            ptt: false,
                        }, { quoted: receivedMsg });
                        break;

                    case "2":
                        await conn.sendMessage(senderID, {
                            document: { url: result.download },
                            mimetype: "audio/mpeg",
                            fileName: `${result.title}.mp3`
                        }, { quoted: receivedMsg });
                        break;

                    case "3":
                        await conn.sendMessage(senderID, {
                            audio: { url: result.download },
                            mimetype: "audio/mpeg",
                            ptt: true,
                        }, { quoted: receivedMsg });
                        break;

                    default:
                        reply("❌ Invalid option! Please reply with 1, 2, or 3.");
                }
            }
        });

    } catch (error) {
        console.error("Spotify Command Error:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
});
