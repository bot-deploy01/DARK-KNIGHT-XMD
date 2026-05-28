const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "app",
    react: '📲',
    desc: "Search for apps on the Play Store",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide an app name to search.");

        // React while processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // New API endpoint
        const apiUrl = `https://api.deline.web.id/search/playstore?q=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);

        if (!response.data || !response.data.result || response.data.result.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ No results found for that app name.");
        }

        const apps = response.data.result.slice(0, 5); // Limit to top 5 apps

        let finalMessage = `📲 *PLAY STORE SEARCH RESULTS*\n\n`;

        apps.forEach((app, index) => {
            finalMessage += `*${index + 1}. ${app.nama}*\n`;
            finalMessage += `│• 👨‍💻 *Dev:* ${app.developer}\n`;
            finalMessage += `│• ⭐ *Rating:* ${app.rate2 || 'N/A'}\n`;
            finalMessage += `│• 🔗 *Link:* ${app.link}\n`;
            finalMessage += `╰─────────────────\n\n`;
        });

        finalMessage += `*Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳*`;

        await conn.sendMessage(
            from,
            { text: finalMessage },
            { quoted: mek }
        );

        // React: Done ✅
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("Play Store Error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Error fetching Play Store results. Please try again later.");
    }
});
