const {cmd , commands} = require('../command');
const axios = require("axios");
const path = require("path");

cmd({
    pattern: "download",
    alias: ["downurl" ,"down"],
    use: ".download <link>",
    react: "📁",
    desc: "Download file from direct link",
    category: "search",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    reply
}) => {
    try {
        if (!q) {
            return reply("❗ කරුණාකර download link එකක් ලබා දෙන්න.");
        }

        const link = q.trim();
        const urlPattern = /^(https?:\/\/[^\s]+)/i;
        if (!urlPattern.test(link)) {
            return reply("❗ දීලා තියෙන URL එක වැරදි.\nකරුණාකර හරි link එකක් දෙන්න.");
        }

        // URL එකේ Headers ලබාගෙන File info සොයා ගැනීම
        const response = await axios.head(link);
        const headers = response.headers;

        // Mimetype එක ලබා ගැනීම (නැතිනම් default එකක් දැමීම)
        const mimeType = headers['content-type'] || 'application/octet-stream';

        // Filename එක සොයා ගැනීම (Content-Disposition හරහා හෝ URL එක අගින්)
        let fileName = "Downloaded_File";
        const contentDisposition = headers['content-disposition'];
        
        if (contentDisposition && contentDisposition.includes('filename=')) {
            fileName = contentDisposition.split('filename=')[1].replaceAll('"', '').trim();
        } else {
            // URL එකෙන් file name එක වෙන් කර ගැනීම
            fileName = path.basename(new URL(link).pathname) || "file";
        }

        const caption = `*Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳*`;

        // File එක යැවීම
        await conn.sendMessage(from, {
            document: { url: link },
            mimetype: mimeType,
            fileName: fileName,
            caption: caption
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Download failed!\n\n" + (err.message || err));
    }
});
