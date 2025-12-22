const axios = require("axios");
const { cmd } = require("../command");
const { proto, generateWAMessageFromContent } = require("@whiskeysockets/baileys");

/* ───── Fake Meta Quote ───── */
const fakeMeta = (from) => ({
  key: {
    participant: "13135550002@s.whatsapp.net",
    remoteJid: from,
    fromMe: false,
    id: "FAKE_META_NEWS"
  },
  message: {
    contactMessage: {
      displayName: "©WHITESHADOW-X",
      vcard: `BEGIN:VCARD
VERSION:3.0
N:Meta AI;;;;
FN:Meta AI
TEL;waid=13135550002:+1 313 555 0002
END:VCARD`,
      sendEphemeral: true
    }
  },
  pushName: "Meta AI",
  messageTimestamp: Math.floor(Date.now() / 1000)
});

/* ───── Command ───── */
cmd({
  pattern: "newss1",
  desc: "Latest Sri Lankan News (Carousel)",
  category: "news",
  react: "📰",
  filename: __filename
}, async (conn, m, store, { from }) => {

  const sources = [
    { name: "Lankadeepa", url: "https://saviya-kolla-api.koyeb.app/news/lankadeepa" },
    { name: "Ada", url: "https://saviya-kolla-api.koyeb.app/news/ada" },
    { name: "Sirasa", url: "https://saviya-kolla-api.koyeb.app/news/sirasa" },
    { name: "Gagana", url: "https://saviya-kolla-api.koyeb.app/news/gagana" },
    { name: "LNW", url: "https://vajira-api.vercel.app/news/lnw" },
    { name: "Siyatha", url: "https://vajira-api.vercel.app/news/siyatha" },
    { name: "Gossip Lanka", url: "https://vajira-api.vercel.app/news/gossiplankanews" }
  ];

  await store.react("⌛");

  const cards = [];

  for (const src of sources) {
    try {
      const { data } = await axios.get(src.url, { timeout: 10000 });
      const r = data?.result;
      if (!r) continue;

      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: r.desc || "No description available"
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: src.name
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: r.title || "No Title",
          subtitle: r.date || "",
          hasMediaAttachment: false
        }),
        nativeFlowMessage:
          proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: r.url || r.link ? [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Read More",
                  url: r.url || r.link
                })
              }
            ] : []
          })
      });

    } catch (e) {
      console.error(`News error (${src.name}):`, e.message);
    }
  }

  if (!cards.length) {
    await store.react("❌");
    return;
  }

  const msg = generateWAMessageFromContent(
    from,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage:
            proto.Message.InteractiveMessage.fromObject({
              body: {
                text: "📰 *Latest Sri Lankan News*\n\nSwipe cards to read headlines ➡️"
              },
              footer: {
                text: "> 𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 pakaya"
              },
              header: { hasMediaAttachment: false },
              carouselMessage: { cards }
            })
        }
      }
    },
    { quoted: fakeMeta(from) }
  );

  await conn.relayMessage(from, msg.message, {
    messageId: msg.key.id
  });

  await store.react("✅");
});


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
