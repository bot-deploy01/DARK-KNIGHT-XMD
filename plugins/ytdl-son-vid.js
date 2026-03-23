const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "song",
    react: "🎵",
    desc: "Download YouTube MP3",
    category: "download",
    use: ".song <query>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("❓ What song do you want to download?");

        const search = await yts(q);
        if (!search.videos.length) return reply("❌ No results found for your query.");

        const data = search.videos[0];
        const ytUrl = data.url;

        // Use Zenzxz API
        const api = `https://sadas-ytmp3-5.vercel.app/convert?link=${encodeURIComponent(ytUrl)}`;
        const { data: apiRes } = await axios.get(api);

        if (!apiRes?.status || !apiRes.result?.url) {
            return reply("❌ Unable to download the song. Please try another one!");
        }

        const results = apiRes.result;

        const caption = `
🎵 *Song Downloader.* 📥

📑 *Title:* ${data.title}
⏱️ *Duration:* ${data.timestamp}
📆 *Uploaded:* ${data.ago}
📊 *Views:* ${data.views}
🔗 *Link:* ${data.url}

🔢 *Reply Below Number*

1️⃣ *Audio Type*
2️⃣ *Document Type*
3️⃣ *Voice Note*
 
> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
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
                        audio: { url: results.url },
                        mimetype: "audio/mpeg",
                        ptt: false,
                    }, { quoted: receivedMsg });
                    break;

                case "2":
                    await conn.sendMessage(senderID, {
                        document: { url: results.url },
                        mimetype: "audio/mpeg",
                        fileName: `${data.title}.mp3`
                    }, { quoted: receivedMsg });
                    break;

                case "3":
                    await conn.sendMessage(senderID, {
                        audio: { url: results.url },
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
    console.error("Song Command Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});

cmd({
    pattern: "video",
    react: "🎬",
    desc: "Download YouTube MP4",
    category: "download",
    use: ".video <query>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("❓ What video do you want to download?");

        const search = await yts(q);
        if (!search.videos.length) return reply("❌ No results found for your query.");

        const data = search.videos[0];
        const ytUrl = data.url;

        // Define API links for multiple qualities
        const formats = {
            "144p": `https://sadas-ytmp4-5.vercel.app/convert?link=${encodeURIComponent(ytUrl)}&format=mp4&audioBitrate=128&videoQuality=144&filenameStyle=pretty&vCodec=h264`,
            "240p": `https://sadas-ytmp4-5.vercel.app/convert?link=${encodeURIComponent(ytUrl)}&format=mp4&audioBitrate=128&videoQuality=240&filenameStyle=pretty&vCodec=h264`,
            "360p": `https://sadas-ytmp4-5.vercel.app/convert?link=${encodeURIComponent(ytUrl)}&format=mp4&audioBitrate=128&videoQuality=360&filenameStyle=pretty&vCodec=h264`,
            "480p": `https://sadas-ytmp4-5.vercel.app/convert?link=${encodeURIComponent(ytUrl)}&format=mp4&audioBitrate=128&videoQuality=480&filenameStyle=pretty&vCodec=h264`,
            "720p": `https://sadas-ytmp4-5.vercel.app/convert?link=${encodeURIComponent(ytUrl)}&format=mp4&audioBitrate=128&videoQuality=720&filenameStyle=pretty&vCodec=h264`
        };

        // Prepare caption
        const caption = `
🎥 *Video Downloader.* 📥

📑 *Title:* ${data.title}
⏱️ *Duration:* ${data.timestamp}
📆 *Uploaded:* ${data.ago}
📊 *Views:* ${data.views}
🔗 *Link:* ${data.url}

🔢 *Reply Below Number*

🎥 *Video Types*
🔹 1.1 144p (Video)
🔹 1.2 240p (Video)
🔹 1.3 360p (Video)
🔹 1.4 480p (Video)
🔹 1.5 720p (Video)

📁 *Document Types:*
🔹 2.1 144p (Document)
🔹 2.2 240p (Document)
🔹 2.3 360p (Document)
🔹 2.4 480p (Document)
🔹 2.5 720p (Document)

> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳
        `;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption
        }, { quoted: m });

        const messageID = sentMsg.key.id;

        // Listen for user replies
        conn.ev.on("messages.upsert", async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;

            const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToBot) {
                await conn.sendMessage(senderID, { react: { text: '⏳', key: receivedMsg.key } });

                let selectedFormat, isDocument = false;

                switch (receivedText.trim().toUpperCase()) {
                    case "1.1": selectedFormat = "144p"; break;
                    case "1.2": selectedFormat = "240p"; break;
                    case "1.3": selectedFormat = "360p"; break;
                    case "1.4": selectedFormat = "480p"; break;
                    case "1.5": selectedFormat = "720p"; break;
                    
                    case "2.1": selectedFormat = "144p"; isDocument = true; break;
                    case "2.2": selectedFormat = "240p"; isDocument = true; break;
                    case "2.3": selectedFormat = "360p"; isDocument = true; break;
                    case "2.4": selectedFormat = "480p"; isDocument = true; break;
                    case "2.5": selectedFormat = "720p"; isDocument = true; break;

                    default:
                        return reply("❌ Invalid option! Please reply with 1.1-1.5 or 2.1-2.5.");
                }

                const { data: apiRes } = await axios.get(formats[selectedFormat]);

                if (!apiRes?.status || !apiRes.result?.url) {
                    return reply(`❌ Unable to download the ${selectedFormat} version. Try another one!`);
                }

                const results = apiRes.result;

                if (isDocument) {
                    await conn.sendMessage(senderID, {
                        document: { url: results.url },
                        mimetype: "video/mp4",
                        fileName: `${data.title}.mp4`
                    }, { quoted: receivedMsg });
                } else {
                    await conn.sendMessage(senderID, {
                        video: { url: results.url },
                        mimetype: "video/mp4",
                        ptt:false,
                    }, { quoted: receivedMsg });
                }
            }
        });

    } catch (error) {
        console.error("Video Command Error:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
});


cmd({
    pattern: "song1",
    react: "🎵",
    desc: "Download YouTube MP3",
    category: "download",
    use: ".song <query>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("❓ What song do you want to download?");

        const search = await yts(q);
        if (!search.videos.length) return reply("❌ No results found for your query.");

        const data = search.videos[0];
        const ytUrl = data.url;

        // Use Zenzxz API
        const api = `https://sai-green.vercel.app/manump3?url=${encodeURIComponent(ytUrl)}`;
        const { data: apiRes } = await axios.get(api);

        if (!apiRes?.status || !apiRes.download?.url) {
            return reply("❌ Unable to download the song. Please try another one!");
        }

        const result = apiRes.download;

        const caption = `
🎵 *Song Downloader.* 📥

📑 *Title:* ${data.title}
⏱️ *Duration:* ${data.timestamp}
📆 *Uploaded:* ${data.ago}
📊 *Views:* ${data.views}
🔗 *Link:* ${data.url}

🔢 *Reply Below Number*

1️⃣ *Audio Type*
2️⃣ *Document Type*
3️⃣ *Voice Note*
 
> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
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
                        audio: { url: result.url },
                        mimetype: "audio/mpeg",
                        ptt: false,
                    }, { quoted: receivedMsg });
                    break;

                case "2":
                    await conn.sendMessage(senderID, {
                        document: { url: result.url },
                        mimetype: "audio/mpeg",
                        fileName: `${data.title}.mp3`
                    }, { quoted: receivedMsg });
                    break;

                case "3":
                    await conn.sendMessage(senderID, {
                        audio: { url: result.url },
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
    console.error("Song Command Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});
              

cmd({
    pattern: "video1",
    react: "🎬",
    desc: "Download YouTube MP4",
    category: "download",
    use: ".video <query>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("❓ What video do you want to download?");

        const search = await yts(q);
        if (!search.videos.length) return reply("❌ No results found for your query.");

        const data = search.videos[0];
        const ytUrl = data.url;

        // Define API links for multiple qualities
        const formats = {
            "144p": `https://sai-green.vercel.app/manump4?url=${encodeURIComponent(ytUrl)}&quality=144`,
            "240p": `https://sai-green.vercel.app/manump4?url=${encodeURIComponent(ytUrl)}&quality=240`,
            "360p": `https://sai-green.vercel.app/manump4?url=${encodeURIComponent(ytUrl)}&quality=360`,
            "480p": `https://sai-green.vercel.app/manump4?url=${encodeURIComponent(ytUrl)}&quality=480`,
            "720p": `https://sai-green.vercel.app/manump4?url=${encodeURIComponent(ytUrl)}&quality=720`
        };

        // Prepare caption
        const caption = `
🎥 *Video Downloader.* 📥

📑 *Title:* ${data.title}
⏱️ *Duration:* ${data.timestamp}
📆 *Uploaded:* ${data.ago}
📊 *Views:* ${data.views}
🔗 *Link:* ${data.url}

🔢 *Reply Below Number*

🎥 *Video Types*
🔹 1.1 144p (Video)
🔹 1.2 240p (Video)
🔹 1.3 360p (Video)
🔹 1.4 480p (Video)
🔹 1.5 720p (Video)

📁 *Document Types:*
🔹 2.1 144p (Document)
🔹 2.2 240p (Document)
🔹 2.3 360p (Document)
🔹 2.4 480p (Document)
🔹 2.5 720p (Document)

> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳
        `;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption
        }, { quoted: m });

        const messageID = sentMsg.key.id;

        // Listen for user replies
        conn.ev.on("messages.upsert", async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;

            const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToBot) {
                await conn.sendMessage(senderID, { react: { text: '⏳', key: receivedMsg.key } });

                let selectedFormat, isDocument = false;

                switch (receivedText.trim().toUpperCase()) {
                    case "1.1": selectedFormat = "144p"; break;
                    case "1.2": selectedFormat = "240p"; break;
                    case "1.3": selectedFormat = "360p"; break;
                    case "1.4": selectedFormat = "480p"; break;
                    case "1.5": selectedFormat = "720p"; break;
                    
                    case "2.1": selectedFormat = "144p"; isDocument = true; break;
                    case "2.2": selectedFormat = "240p"; isDocument = true; break;
                    case "2.3": selectedFormat = "360p"; isDocument = true; break;
                    case "2.4": selectedFormat = "480p"; isDocument = true; break;
                    case "2.5": selectedFormat = "720p"; isDocument = true; break;

                    default:
                        return reply("❌ Invalid option! Please reply with 1.1-1.5 or 2.1-2.5.");
                }

                const { data: apiRes } = await axios.get(formats[selectedFormat]);

                if (!apiRes?.status || !apiRes.download?.url) {
                    return reply(`❌ Unable to download the ${selectedFormat} version. Try another one!`);
                }

                const result = apiRes.download;

                if (isDocument) {
                    await conn.sendMessage(senderID, {
                        document: { url: result.url },
                        mimetype: "video/mp4",
                        fileName: `${data.title}.mp4`
                    }, { quoted: receivedMsg });
                } else {
                    await conn.sendMessage(senderID, {
                        video: { url: result.url },
                        mimetype: "video/mp4",
                        ptt:false,
                    }, { quoted: receivedMsg });
                }
            }
        });

    } catch (error) {
        console.error("Video Command Error:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
});


cmd({
    pattern: "song2",
    react: "🎵",
    desc: "Download YouTube MP3",
    category: "download",
    use: ".song <query>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("❓ What song do you want to download?");

        const search = await yts(q);
        if (!search.videos.length) return reply("❌ No results found for your query.");

        const data = search.videos[0];
        const ytUrl = data.url;

        const api = `https://www.movanest.xyz/v2/ytmp3?url=${encodeURIComponent(ytUrl)}`;
        const { data: apiRes } = await axios.get(api);

        if (!apiRes?.status || !apiRes.result?.downloadUrl) {
            return reply("❌ Unable to download the song. Please try another one!");
        }

        const result = apiRes.result;

        const caption = `
🎵 *Song Downloader.* 📥

📑 *Title:* ${data.title}
⏱️ *Duration:* ${data.timestamp}
📆 *Uploaded:* ${data.ago}
📊 *Views:* ${data.views}
🔗 *Link:* ${data.url}

🔢 *Reply Below Number*

1️⃣ *Audio Type*
2️⃣ *Document Type*
3️⃣ *Voice Note*
 
> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
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
                        audio: { url: result.downloadUrl },
                        mimetype: "audio/mpeg",
                        ptt: false,
                    }, { quoted: receivedMsg });
                    break;

                case "2":
                    await conn.sendMessage(senderID, {
                        document: { url: result.downloadUrl },
                        mimetype: "audio/mpeg",
                        fileName: `${data.title}.mp3`
                    }, { quoted: receivedMsg });
                    break;

                case "3":
                    await conn.sendMessage(senderID, {
                        audio: { url: result.downloadUrl },
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
    console.error("Song Command Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});


cmd({
    pattern: "video2",
    react: "🎬",
    desc: "Download YouTube MP4",
    category: "download",
    use: ".video <query>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("❓ What video do you want to download?");

        const search = await yts(q);
        if (!search.videos.length) return reply("❌ No results found for your query.");

        const data = search.videos[0];
        const ytUrl = data.url;

        // Define API links for multiple qualities
        const formats = {
            "144p": `https://www.movanest.xyz/v2/ytdl2?input=${encodeURIComponent(ytUrl)}&format=video&quality=144p`,
            "240p": `https://www.movanest.xyz/v2/ytdl2?input=${encodeURIComponent(ytUrl)}&format=video&quality=240p`,
            "360p": `https://www.movanest.xyz/v2/ytdl2?input=${encodeURIComponent(ytUrl)}&format=video&quality=360p`,
            "480p": `https://www.movanest.xyz/v2/ytdl2?input=${encodeURIComponent(ytUrl)}&format=video&quality=480p`,
            "720p": `https://www.movanest.xyz/v2/ytdl2?input=${encodeURIComponent(ytUrl)}&format=video&quality=720p`
        };

        // Prepare caption
        const caption = `
🎥 *Video Downloader.* 📥

📑 *Title:* ${data.title}
⏱️ *Duration:* ${data.timestamp}
📆 *Uploaded:* ${data.ago}
📊 *Views:* ${data.views}
🔗 *Link:* ${data.url}

🔢 *Reply Below Number*

🎥 *Video Types*
🔹 1.1 144p (Video)
🔹 1.2 240p (Video)
🔹 1.3 360p (Video)
🔹 1.4 480p (Video)
🔹 1.5 720p (Video)

📁 *Document Types:*
🔹 2.1 144p (Document)
🔹 2.2 240p (Document)
🔹 2.3 360p (Document)
🔹 2.4 480p (Document)
🔹 2.5 720p (Document)

> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳
        `;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption
        }, { quoted: m });

        const messageID = sentMsg.key.id;

        // Listen for user replies
        conn.ev.on("messages.upsert", async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;

            const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToBot) {
                await conn.sendMessage(senderID, { react: { text: '⏳', key: receivedMsg.key } });

                let selectedFormat, isDocument = false;

                switch (receivedText.trim().toUpperCase()) {
                    case "1.1": selectedFormat = "144p"; break;
                    case "1.2": selectedFormat = "240p"; break;
                    case "1.3": selectedFormat = "360p"; break;
                    case "1.4": selectedFormat = "480p"; break;
                    case "1.5": selectedFormat = "720p"; break;

                    case "2.1": selectedFormat = "144p"; isDocument = true; break;
                    case "2.2": selectedFormat = "240p"; isDocument = true; break;
                    case "2.3": selectedFormat = "360p"; isDocument = true; break;
                    case "2.4": selectedFormat = "480p"; isDocument = true; break;
                    case "2.5": selectedFormat = "720p"; isDocument = true; break;

                    default:
                        return reply("❌ Invalid option! Please reply with 1.1-1.4 or 2.1-2.4.");
                }

                const { data: apiRes } = await axios.get(formats[selectedFormat]);

                if (!apiRes?.status || !apiRes.results) {
                    return reply(`❌ Unable to download the ${selectedFormat} version. Try another one!`);
                }

                const download = apiRes.results.recommended;

                if (isDocument) {
                    await conn.sendMessage(senderID, {
                        document: { url: download.dlurl },
                        mimetype: "video/mp4",
                        fileName: `${data.title}.mp4`
                    }, { quoted: receivedMsg });
                } else {
                    await conn.sendMessage(senderID, {
                        video: { url: download.dlurl },
                        mimetype: "video/mp4",
                        ptt:false,
                    }, { quoted: receivedMsg });
                }
            }
        });

    } catch (error) {
        console.error("Video Command Error:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
});

cmd({
    pattern: "song3",
    react: "🎵",
    desc: "Download YouTube MP3",
    category: "download",
    use: ".song <query>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("❓ What song do you want to download?");

        const search = await yts(q);
        if (!search.videos.length) return reply("❌ No results found for your query.");

        const data = search.videos[0];
        const ytUrl = data.url;

        const api = `https://api-aswin-sparky.koyeb.app/api/downloader/song?search=${encodeURIComponent(ytUrl)}`;
        const { data: apiRes } = await axios.get(api);

        if (!apiRes?.status || !apiRes.data?.url) {
            return reply("❌ Unable to download the song. Please try another one!");
        }

        const result = apiRes.data;

        const caption = `
🎵 *Song Downloader.* 📥

📑 *Title:* ${data.title}
⏱️ *Duration:* ${data.timestamp}
📆 *Uploaded:* ${data.ago}
📊 *Views:* ${data.views}
🔗 *Link:* ${data.url}

🔢 *Reply Below Number*

1️⃣ *Audio Type*
2️⃣ *Document Type*
3️⃣ *Voice Note*
 
> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
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
                        audio: { url: result.url },
                        mimetype: "audio/mpeg",
                        ptt: false,
                    }, { quoted: receivedMsg });
                    break;

                case "2":
                    await conn.sendMessage(senderID, {
                        document: { url: result.url },
                        mimetype: "audio/mpeg",
                        fileName: `${data.title}.mp3`
                    }, { quoted: receivedMsg });
                    break;

                case "3":
                    await conn.sendMessage(senderID, {
                        audio: { url: result.url },
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
    console.error("Song Command Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});
