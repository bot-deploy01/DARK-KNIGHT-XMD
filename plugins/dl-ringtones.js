const axios = require("axios");
const { cmd, commands } = require("../command");

cmd({
    pattern: "ringtone",
    desc: "Get a random ringtone from the API.",
    react: "🎵",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return reply("Please provide a search query! Example: .ringtone Suna");
        }

        const { data } = await axios.get(`https://www.movanest.xyz/v2/ringtone?title=${encodeURIComponent(query)}`);

        if (!data.status || !data.results || data.results.length === 0) {
            return reply("No ringtones found for your query. Please try a different keyword.");
        }

        const randomRingtone = data.results[Math.floor(Math.random() * data.results.length)];

        await conn.sendMessage(
            from,
            {
                audio: { url: randomRingtone.audio },
                mimetype: "audio/mpeg",
                fileName: `${randomRingtone.title}.mp3`,
            },
            { quoted: m }
        );
    } catch (error) {
        console.error("Error in ringtone command:", error);
        reply("Sorry, something went wrong while fetching the ringtone. Please try again later.");
    }
});


cmd({
    pattern: "ring2",
    desc: "🎵 Download ringtones by search query.",
    react: "🎧",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return reply("Please provide a search term!\nExample: *.ringtone Boy*");
        }

        // Fetch ringtone data
        const { data } = await axios.get(`https://lance-frank-asta.onrender.com/api/ringtone?title=${encodeURIComponent(query)}`);

        if (!data.status || !data.results || data.results.length === 0) {
            return reply("❌ No ringtones found. Try a different keyword!");
        }

        // Pick a random ringtone
        const randomTone = data.results[Math.floor(Math.random() * data.results.length)];

        // Send ringtone as audio file
        await conn.sendMessage(
            from,
            {
                audio: { url: randomTone.audio },
                mimetype: "audio/mpeg",
                fileName: `${randomTone.title || "ringtone"}.mp3`,
                caption: `🎶 *Title:* ${randomTone.title}\n🔗 [Source](${randomTone.source})`
            },
            { quoted: m }
        );

    } catch (error) {
        console.error("Error in ringtone command:", error);
        reply("⚠️ Oops! Something went wrong while fetching the ringtone. Try again later.");
    }
});
