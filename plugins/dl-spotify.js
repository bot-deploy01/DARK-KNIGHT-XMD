const { cmd } = require("../command");
const axios = require("axios");
const config = require('../config');
const NodeCache = require("node-cache");

const movieCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

cmd({
    pattern: "spotify",
    alias: ["spot"],
    desc: "🎧 Search and download songs from Spotify",
    category: "media",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q }) => {

    if (!q) return await conn.sendMessage(from, { text: "Use: .spotify <song name>" }, { quoted: mek });

    try {
        const cacheKey = `spotify_${q.toLowerCase()}`;
        let data = movieCache.get(cacheKey);

        if (!data) {
            // New Search API
            const url = `https://api.nexray.eu.cc/search/spotify?q=${encodeURIComponent(q)}`;
            const res = await axios.get(url);
            
            data = res.data;
            if (data.status !== true || !data.result?.length) throw new Error("No results found.");
            movieCache.set(cacheKey, data);
        }

        const songList = data.result.map((s, i) => ({
            number: i + 1,
            title: s.title,
            artist: s.artist,
            duration: s.duration,
            image: s.thumbnail,
            url: s.url,
            popularity: s.popularity,
            album: s.album,
            release_date: s.release_date
        }));

        let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━━━\n\n";
        songList.forEach(s => {
            textList += `🔸 *${s.number}. ${s.title}* - ${s.artist}\n`;
        });

        const sentMsg = await conn.sendMessage(from, {
            text: `*🔍 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐌𝐔𝐒𝐈𝐂 𝐒𝐄𝐀𝐑𝐂𝐇 🎧*\n\n${textList}\n💬 Reply with song number to view details.\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`,
        }, { quoted: mek });

        const spotifyMap = new Map();

        const listener = async (update) => {
            const msg = update.messages?.[0];
            if (!msg?.message?.extendedTextMessage) return;

            const replyText = msg.message.extendedTextMessage.text.trim();
            const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

            if (replyText.toLowerCase() === "done") {
                conn.ev.off("messages.upsert", listener);
                return conn.sendMessage(from, { text: "✅ Cancelled." }, { quoted: msg });
            }

            if (repliedId === sentMsg.key.id) {
                const num = parseInt(replyText);
                const selected = songList.find(s => s.number === num);
                if (!selected) return;

                await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

                let info = 
                    `🎧 *Spotify Downloader* 📥\n\n` +
                    `🎵 *Track:* ${selected.title}\n` +
                    `👤 *Artist:* ${selected.artist}\n` +
                    `⏱️ *Duration:* ${selected.duration}\n` +
                    `🌟 *Popularity:* ${selected.popularity}\n` +
                    `💿 *Album:* ${selected.album}\n` +
                    `📅 *Release Date:* ${selected.release_date}\n` +
                    `🔗 *URL:* ${selected.url}\n\n` +
                    `🎥 *𝑺𝒆𝒍𝒆𝒄𝒕 𝑭𝒐𝒓𝒎𝒂𝒕:* 📥\n\n` +
                    `♦️ 1. *Audio* — MP3 Format\n` +
                    `♦️ 2. *Document* — File Format\n` +
                    `♦️ 3. *Voice* — PTT Format\n\n` +
                    `> 🔢 Reply with number to download.`;

                const downloadMsg = await conn.sendMessage(from, {
                    image: { url: selected.image },
                    caption: info
                }, { quoted: msg });

                spotifyMap.set(downloadMsg.key.id, { selected });
            }

            else if (spotifyMap.has(repliedId)) {
                const { selected } = spotifyMap.get(repliedId);
                const num = replyText;
                
                await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

                // New Downloader API
                const dlUrl = `https://api.nexray.eu.cc/downloader/spotify?url=${encodeURIComponent(selected.url)}`;
                const dlRes = await axios.get(dlUrl);
                const downloadLink = dlRes.data.result.url;

                if (!downloadLink) return;

                if (num === "1") {
                    await conn.sendMessage(from, {
                        audio: { url: downloadLink },
                        mimetype: "audio/mpeg",
                        ptt: false
                    }, { quoted: msg });
                } 
                else if (num === "2") {
                    await conn.sendMessage(from, {
                        document: { url: downloadLink },
                        mimetype: "audio/mpeg",
                        fileName: `${selected.title}.mp3`,
                        caption: `\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
                    }, { quoted: msg });
                } 
                else if (num === "3") {
                    await conn.sendMessage(from, {
                        audio: { url: downloadLink },
                        mimetype: "audio/mpeg",
                        ptt: true
                    }, { quoted: msg });
                }
            }
        };

        conn.ev.on("messages.upsert", listener);

    } catch (err) {
        await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
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
