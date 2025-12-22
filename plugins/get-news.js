const { cmd } = require("../command");
const axios = require("axios");


cmd({
    pattern: "news",
    desc: "Get the latest Ada Derana Sinhala news headlines (all in one message).",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const response = await axios.get("https://tharuzz-news-api.vercel.app/api/news/derana");
        const articles = response.data.datas;

        if (!articles || !articles.length) return reply("❌ No news articles found.");

        // Fixed banner image
        const headerImage = "https://files.catbox.moe/hspst7.jpg";

        // Build the message text
        let newsMessage = `📰 *Ada Derana – Latest Headlines*\n\n`;

        for (let i = 0; i < Math.min(articles.length, 20); i++) {
            const a = articles[i];
            newsMessage += `
━━━━━━━━━━━━━━━━━
🗞️ *${i + 1}. ${a.title || "No Title"}*

📝 _${a.description || "No Description"}_

🔗 _${a.link || "No URL"}_
━━━━━━━━━━━━━━━━━\n`;
        }

        newsMessage += `
© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳  
🌐 Source: Ada Derana`;

        // Send all news with the fixed image
        await conn.sendMessage(from, {
            image: { url: headerImage },
            caption: newsMessage
        });

    } catch (e) {
        console.error("Error fetching news:", e);
        reply("⚠️ Could not fetch Derana news. Please try again later.");
    }
});


cmd({
    pattern: "news1",
    desc: "Get the latest Sri Lankan news headlines from multiple sources.",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // All news sources
        const sources = [
            { name: "Lankadeepalk News", url: "https://saviya-kolla-api.koyeb.app/news/lankadeepa" },
            { name: "Ada News", url: "https://saviya-kolla-api.koyeb.app/news/ada" },
            { name: "Sirasa News", url: "https://saviya-kolla-api.koyeb.app/news/sirasa" },
            { name: "Gagana News", url: "https://saviya-kolla-api.koyeb.app/news/gagana" },
            { name: "Lankadeepa News", url: "https://vajira-api.vercel.app/news/lankadeepa" },
            { name: "Lanka News", url: "https://vajira-api.vercel.app/news/lnw" },
            { name: "Siyatha News", url: "https://vajira-api.vercel.app/news/siyatha" },
            { name: "Gossip Lanka News", url: "https://vajira-api.vercel.app/news/gossiplankanews" }
        ];

        const defaultImage = "https://files.catbox.moe/hspst7.jpg";
        
        reply("📡 *Fetching latest news from all sources...*\n\n1. Lankadeepalk News\n2. Ada News\n3. Sirasa News\n4. Gagana News\n5. Lankadeepa News\n6. Lanka News\n7. Siyatha News\n8. Gossip Lanka News");

        for (const src of sources) {
            try {
                const res = await axios.get(src.url);
                const data = res.data;

                let result = data.result;
                
                if (!result) {
                    await conn.sendMessage(from, { text: `❌ No news found for *${src.name}*.` });
                    continue;
                }

                // Build message
                let msg = `
📰 *${src.name} - Latest*

━━━━━━━━━━━━━━━

🗞️ *${result.title || "No Title"}*

📆 _${result.date || "No Date"}_

📝 _${result.desc || "No Description"}_

🔗 _${result.url || result.link || "No Link"}_

━━━━━━━━━━━━━━━
© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳
                `;

                // If image available, send image + caption
                const image = result.image || result.thumbnail || defaultImage;
                if (image) {
                    await conn.sendMessage(from, { image: { url: image }, caption: msg });
                } else {
                    await conn.sendMessage(from, { text: msg });
                }

                // Small delay between messages to avoid spam blocking
                await new Promise(res => setTimeout(res, 1500));

            } catch (err) {
                console.error(`Error fetching from ${src.name}:`, err.message);
                await conn.sendMessage(from, { text: `⚠️ Error loading news from *${src.name}*.` });
            }
        }

        reply("✅ *All news sources updated successfully!*");
        
    } catch (e) {
        console.error("Global Error:", e);
        reply("⚠️ Could not fetch news. Please try again later.");
    }
});


cmd({
    pattern: "news2",
    desc: "Get the latest news headlines.",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const apiKey="0f2c43ab11324578a7b1709651736382";
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
        const articles = response.data.articles;

        if (!articles.length) return reply("No news articles found.");

        // Send each article as a separate message with image and title
        for (let i = 0; i < Math.min(articles.length, 5); i++) {
            const article = articles[i];
            let message = `
📰 *${article.title}*

⚠️ _${article.description}_

🔗 _${article.url}_

  ©ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳
            `;

            console.log('Article URL:', article.urlToImage); // Log image URL for debugging

            if (article.urlToImage) {
                // Send image with caption
                await conn.sendMessage(from, { image: { url: article.urlToImage }, caption: message });
            } else {
                // Send text message if no image is available
                await conn.sendMessage(from, { text: message });
            }
        };
    } catch (e) {
        console.error("Error fetching news:", e);
        reply("Could not fetch news. Please try again later.");
    }
});
