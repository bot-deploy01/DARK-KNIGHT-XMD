const { cmd } = require('../command');
const { File } = require('megajs');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const os = require('os');


cmd({
  pattern: "mega",
  alias: ["meganz"],
  desc: "Download Mega.nz files",
  react: "🌐",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) 
      return reply("❌ Please provide a Mega.nz link.\n\nExample: `.mega https://mega.nz/file/xxxx#key`");

    const encodedUrl = encodeURIComponent(q);
    
    await conn.sendMessage(from, { react: { text: "⬇️", key: m.key } });

    const apiUrl = `https://api-dark-shan-yt.koyeb.app/download/meganz?url=${encodedUrl}&apikey=65d6c884d8624c71`;
    const { data } = await axios.get(apiUrl);

    console.log("API Response:", JSON.stringify(data, null, 2));

    if (!data.status || !data.data?.result?.length) {
      return reply("⚠️ Invalid Mega link or API error.");
    }

    const file = data.data.result[0];

    if (!file.download) {
      return reply("⚠️ No download link returned by API. The file may be removed or unavailable.");
    }

    await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

    await conn.sendMessage(from, {
      document: { url: file.download },
      fileName: file.name || "mega_file.zip",
      mimetype: "application/octet-stream",
      caption:
        `📁 *File:* ${file.name}\n` +
        `📦 *Size:* ${(file.size / 1024 / 1024).toFixed(2)} MB\n\n` +
        `*© Powered By 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳*`
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error("Mega Plugin Error:", err);
    reply("❌ Failed to download Mega file. Make sure the link is correct and API is working.");
  }
});


cmd({
    pattern: "mega2",
    alias: ["meganz2"],
    react: "📦",
    desc: "Download ZIP or any file from Mega.nz",
    category: "downloader",
    use: '.megadl <mega file link>',
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("📦 Please provide a Mega.nz file link.\n\nExample: `.megadl https://mega.nz/file/xxxx#key`");

        // React: Processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Initialize MEGA File from link
        const file = File.fromURL(q);

        // Download into buffer
        const data = await new Promise((resolve, reject) => {
            file.download((err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        // Create temp file path
        const savePath = path.join(os.tmpdir(), file.name || "mega_file.octet-stream");

        // Save file locally
        fs.writeFileSync(savePath, data);

        // Send file
        await conn.sendMessage(from, {
            document: fs.readFileSync(savePath),
            fileName: file.name || "DARK-KNIGHT-XMD",
            mimetype: "application/octet-stream",
            caption: "📦 Downloaded from Mega NZ\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳"
        }, { quoted: mek });

        // Delete temp file
        fs.unlinkSync(savePath);

        // React: Done
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("❌ MEGA Downloader Error:", error);
        reply("❌ Failed to download file from Mega.nz. Make sure the link is valid and file is accessible.");
    }
});
