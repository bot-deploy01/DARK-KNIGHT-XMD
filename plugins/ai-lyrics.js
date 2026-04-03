const config = require('../config');
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
});
