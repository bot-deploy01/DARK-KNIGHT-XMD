const axios = require('axios');
const { cmd, commands } = require('../command');

// සරල cache එකක් search results තබා ගැනීමට
const movieCache = new Map();

cmd({
    pattern: "mp",
    alias: ["mpro"],
    desc: "🎥 Search movies from Silent Tech MovieAPI",
    category: "media",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q }) => {

    if (!q) return await conn.sendMessage(from, { text: "Use: .moviepro <movie name>" }, { quoted: mek });

    try {
        const cacheKey = `moviepro_${q.toLowerCase()}`;
        let data = movieCache.get(cacheKey);

        if (!data) {
            const url = `https://silent-movies-api.vercel.app/api/search?q=${encodeURIComponent(q)}&key=silent`;
            const res = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Accept': 'application/json, text/plain, */*'
                }
            });
            
            data = res.data;

            if (!data.data?.items?.length) throw new Error("No results found.");

            movieCache.set(cacheKey, data);
        }

        // API එකෙන් එන items list එක map කරගැනීම
        const movieList = data.data.items.map((m, i) => ({
            number: i + 1,
            id: m.subjectId,
            title: m.title,
            year: m.releaseDate,
            duration: Math.floor(m.duration / 60), // තත්පර විනාඩි වලට හරවයි
            genre: m.genre,
            thumbnail: m.cover?.url,
            country: m.countryName,
            imdb: m.imdbRatingValue,
            post: m.postTitle,
            subtitles: m.subtitles
        }));

        let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━━━\n\n";
        movieList.forEach(m => {
            textList += `🔸 *${m.number}. ${m.title}* (${m.year.split('-')[0]})\n`;
        });

        const sentMsg = await conn.sendMessage(from, {
            text: `*🔍 𝐌𝐎𝐕𝐈𝐄𝐏𝐑𝐎 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n💬 Reply with movie number to view details.\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`,
        }, { quoted: mek });

        const movieMap = new Map();

        const listener = async (update) => {
            const msg = update.messages?.[0];
            if (!msg?.message?.extendedTextMessage) return;

            const replyText = msg.message.extendedTextMessage.text.trim();
            const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

            // සෙවුම අවලංගු කිරීම
            if (replyText.toLowerCase() === "done") {
                conn.ev.off("messages.upsert", listener);
                return;
            }

            // මුල් message එකට reply කළහොත් (Details පෙන්වීමට)
            if (repliedId === sentMsg.key.id) {
                const num = parseInt(replyText);
                const selected = movieList.find(m => m.number === num);
                if (!selected) return;

                await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

                const movieUrl = `https://silent-movies-api.vercel.app/api/media?id=${selected.id}&key=silent`;
                const movieRes = await axios.get(movieUrl);
               
                const downloads = movieRes.data?.data?.data?.downloadUrls || movieRes.data?.data?.downloadUrls;

                  if (!downloads || !Array.isArray(downloads) || downloads.length === 0) {
                  return conn.sendMessage(from, { text: "❌ No download links available for this movie." }, { quoted: msg });
                }
                /*const downloads = movieRes.data.data?.downloadUrls;

                if (!downloads || downloads.length === 0) {
                    return conn.sendMessage(from, { text: "❌ No download links available for this movie." }, { quoted: msg });
                }*/
                
                let info = 
                    `🎬 *Movie:* ${selected.title}\n\n` +
                    `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑸𝒖𝒂𝒍𝒊𝒕𝒊𝒆𝒔:* 📥\n\n`;
                
                downloads.forEach((d, i) => {
                    info += `♦️ ${i + 1}. *${d.quality}p* — (${d.size_formatted})\n`;
                });
                info += "\n🔢 Reply with the quality number to download.";

                const downloadMsg = await conn.sendMessage(from, {
                    text: info
                }, { quoted: msg });

                movieMap.set(downloadMsg.key.id, { selected, downloads });
            }

            // Download quality එකට reply කළහොත් (File එක යැවීමට)
            else if (movieMap.has(repliedId)) {
                const { selected, downloads } = movieMap.get(repliedId);
                const num = parseInt(replyText);
                const chosen = downloads[num - 1];
                if (!chosen) return;

                await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

                // File size එක byte වලින් එන නිසා GB වලට හරවා check කිරීම (2GB limit)
                const sizeInBytes = parseInt(chosen.size);
                const sizeGB = sizeInBytes / (1024 * 1024 * 1024);
                
                if (sizeGB > 2) {
                    return conn.sendMessage(from, { text: `⚠️ This file is too large (${sizeGB.toFixed(2)} GB). Please download it manually:\n\n🔗 ${chosen.downloadUrl}` }, { quoted: msg });
                }

                await conn.sendMessage(from, {
                    document: { url: chosen.downloadUrl },
                    mimetype: "video/mp4",
                    fileName: `${selected.title} [${chosen.quality}p].mp4`,
                    caption: `🎬 *${selected.title}*\n🎥 *Quality:* ${chosen.quality}p\n⚖️ *Size:* ${chosen.size_formatted}\n\n> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`
                }, { quoted: msg });
            }
        };

        conn.ev.on("messages.upsert", listener);

        // විනාඩි 10 කට පසු listener එක ඉවත් කිරීම (Memory leak වැලැක්වීමට)
        setTimeout(() => {
            conn.ev.off("messages.upsert", listener);
        }, 600000);

    } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
    }
});
