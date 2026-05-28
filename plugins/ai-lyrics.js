const { cmd } = require("../command");
const axios = require("axios");
const config = require('../config');
const NodeCache = require("node-cache");

// MoviePro එකේ වගේම Cache එක setup කිරීම
const lyricsCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

cmd({
    pattern: "lyrics",
    alias: ["ly", "lyric"],
    desc: "🎶 Search and get song lyrics (Plain & Synced)",
    category: "media",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, q }) => {

    if (!q) return await conn.sendMessage(from, { text: "Use: .lyrics <song name>" }, { quoted: mek });

    try {
        const cacheKey = `lyrics_${q.toLowerCase()}`;
        let data = lyricsCache.get(cacheKey);

        if (!data) {
            // API එක භාවිතයෙන් සෙවීම
            const url = `https://eliteprotech-apis.zone.id/lyrics?query=${encodeURIComponent(q)}`;
            const res = await axios.get(url);
            
            data = res.data;
            // API Response එකේ 'success' පරීක්ෂා කිරීම
            if (!data.success || !data.result?.length) throw new Error("No lyrics found.");
            lyricsCache.set(cacheKey, data);
        }

        const lyricsList = data.result.map((item, i) => ({
            number: i + 1,
            id: item.id,
            title: item.name, // API එකේ 'name' ලෙස ඇත
            track: item.trackName,
            artist: item.artistName,
            album: item.albumName,
            duration: item.duration,
            plainLyrics: item.plainLyrics,
            syncedLyrics: item.syncedLyrics
        }));

        let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━━━\n\n";
        lyricsList.forEach(l => {
            textList += `🔸 *${l.number}. ${l.title}* - ${l.artist}\n`;
        });

        const sentMsg = await conn.sendMessage(from, {
            text: `*🔍 𝐋𝐘𝐑𝐈𝐂𝐒 𝐒𝐄𝐀𝐑𝐂𝐇 🎶*\n\n${textList}\n💬 Reply with song number to view lyrics.\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`,
        }, { quoted: mek });

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
                const selected = lyricsList.find(l => l.number === num);
                if (!selected) return;

                await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

                const minutes = Math.floor(selected.duration / 60);
                const seconds = selected.duration % 60;

                let info = 
                    `🔍 *Lyrics Track Found* 🎵\n\n` +
                    `🎵 *Track:* ${selected.title}\n` +
                    `👤 *Artist:* ${selected.artist}\n` +
                    `💿 *Album:* ${selected.album}\n` +
                    `🕐 *Duration:* ${minutes}:${seconds < 10 ? '0' : ''}${seconds}\n\n` +
                    `━━━━━━━━━━━━━━━━━\n\n` +
                    `📝 *𝐏𝐥𝐚𝐢𝐧 𝐋𝐲𝐫𝐢𝐜𝐬:*\n\n${selected.plainLyrics || "Not Available"}\n\n` +
                    `━━━━━━━━━━━━━━━━━\n\n` +
                    `⏳ *𝐒𝐲𝐧𝐜𝐞𝐝 𝐋𝐲𝐫𝐢𝐜𝐬 (𝐓𝐢𝐦𝐞-𝐒𝐭𝐚𝐦𝐩𝐞𝐝):*\n\n${selected.syncedLyrics || "Not Available"}\n\n` +
                    `> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

                await conn.sendMessage(from, {
                    text: info
                }, { quoted: msg });
            }
        };

        conn.ev.on("messages.upsert", listener);

    } catch (err) {
        await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
    }
});

/*const config = require('../config');
const {cmd , commands} = require('../command');
const axios = require ("axios");

cmd({
    pattern: "lyrics",
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

        const apiUrl = `https://api.princetechn.com/api/search/lyrics?apikey=prince&query=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            await react("❌");
            return reply("Lyrics not found.");
        }

        const res = data.result;
        
        let text = `🔍 *Lyrics Track Found* 🎵\n\n`;
        text += `*📝 Name / TrackName:* ${res.title}\n`;
        text += `*🕵️ ArtistName:* ${res.artist}\n`;
        text += `*💽 AlbumName:* ${res.album}\n`;
        text += `*⏱️ Duration:* ${res.duration} seconds\n\n`;
        text += `*📃 PlainLyrics:*\n ${res.lyrics}\n\n`;
        text += `*📊 SyncedLyrics:*\n ${res.syncedLyrics}\n\n`;
        text += `> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;
       
        await reply(text);
        await react("✅");

    } catch (e) {
        console.error("Lirik Error:", e);
        await react("❌");
        reply("An error occurred while fetching lyrics.");
    }
});*/
