const {cmd , commands} = require('../command');
const axios = require("axios");

cmd({
    pattern: "download",
    alias: ["downurl"],
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
        // Check link
        if (!q) {
            return reply("❗ කරුණාකර download link එකක් ලබා දෙන්න.");
        }

        const link = q.trim();

        const urlPattern = /^(https?:\/\/[^\s]+)/i;
        if (!urlPattern.test(link)) {
            return reply("❗ දීලා තියෙන URL එක වැරදි.\nකරුණාකර හරි link එකක් දෙන්න.");
        }

        // Optional: Check link availability
        await axios.head(link).catch(() => {
            throw "❌ Link එක open කරන්න බැහැ.";
        });

        const caption = `*Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳*`;

        // Send file as document
        await conn.sendMessage(from, {
            document: { url: link },
            mimetype: "video/mp4",
            fileName: `DARK-KNIGHT-XMD-VIDEO.mp4`,
            caption: caption
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Download failed!\n\n" + err);
    }
});
