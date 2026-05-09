const { cmd } = require('../command');
const { File } = require('megajs');
const axios = require('axios');
const config = require('../config');
const mime = require('mime-types');


cmd({
    pattern: "mega",
    alias: ["meganz"],
    desc: "Download Mega.nz files via API",
    react: "🌐",
    category: "download",
    filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a Mega.nz link.");

        await conn.sendMessage(from, { react: { text: "⬇️", key: m.key } });

        const apiUrl = `https://api-dark-shan-yt.koyeb.app/download/meganz?url=${encodeURIComponent(q)}&apikey=65d6c884d8624c71`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data?.result?.length) {
            return reply("⚠️ Invalid Mega link or API error.");
        }

        const file = data.data.result[0];
        if (!file.download) return reply("⚠️ Download link not found.");

        // Mimetype එක extension එකෙන් හෝ link එකේ headers වලින් ලබා ගැනීම
        let determinedMime = mime.lookup(file.name);
        if (!determinedMime) {
            try {
                const headRes = await axios.head(file.download);
                determinedMime = headRes.headers['content-type'];
            } catch (e) {
                determinedMime = "application/octet-stream";
            }
        }

        await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

        await conn.sendMessage(from, {
            document: { url: file.download },
            fileName: file.name,
            mimetype: determinedMime|| "application/octet-stream",
            caption: `📁 *File:* ${file.name}\n📦 *Size:* ${(file.size / 1024 / 1024).toFixed(2)} MB\n\n*© Powered By 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳*`
        }, { quoted: m });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error(err);
        reply("❌ Mega API download failed.");
    }
});



cmd({
    pattern: "megadl",
    alias: ["mega2", "meganz2"],
    desc: "Download files from mega.nz",
    category: "download",
    react: "🍟",
    use: "megadl <mega.nz link>",
    filename: __filename
}, async (conn, mek, m, { q, reply,from }) => {
    try {
            
        if (!q || !q.includes("mega.nz")) return await reply(megaMg);
        await conn.sendMessage(from, { react: { text: "📥", key: mek.key } });

        const file = File.fromURL(q, { maxWorkers: 16 }); // 8 parallel chunks
        const fileName = (await file.loadAttributes()).name;
        const mimeType = mime.lookup(fileName) || 'application/octet-stream';

        const chunks = [];
        const stream = file.download();

        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', async () => {
            const buffer = Buffer.concat(chunks);

            await conn.sendMessage(from, {
                contextInfo: getContextInfo(config.BOT_NAME !== 'default' ? config.BOT_NAME : null), document: buffer,
                fileName,
                caption: config.DESCRIPTION,
                mimetype: mimeType
            }, { quoted: mek });

            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        });

        stream.on('error', async (err) => {
            console.error(err);
            await reply(errorMgMega);
        });

    } catch (e) {
        console.error(e);
        await reply(errorMgMega);
    }
});
