const axios = require("axios");
const { cmd } = require('../command');

cmd({
  pattern: "facebook",
  alias: ["fb"], 
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid Facebook video URL." }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // ✅ Fetching data from Aswin API
    const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data?.status || !data?.data) {
      return reply("⚠️ Failed to retrieve Facebook media. Please check the link and try again.");
    }

    const { title, thumbnail, low, high } = data.data;

    const caption = `
📺 *Facebook Downloader.* 📥

📑 *Title:* ${title || "No title"}
🔗 *Link:* ${q}

🔢 *Reply Below Number*

1️⃣ *SD Quality*🪫
2️⃣ *HD Quality*🔋
3️⃣ *Audio (MP3)*🎶

> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // 🧠 Interactive Reply System
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
              video: { url: low },
              caption: "📥 *Downloaded in SD Quality*"
            }, { quoted: receivedMsg });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              video: { url: high },
              caption: "📥 *Downloaded in HD Quality*"
            }, { quoted: receivedMsg });
            break;

          case "3": 
            await conn.sendMessage(senderID, { 
              audio: { url: low || high }, 
              mimetype: "audio/mp4", 
              ptt: false 
          }, { quoted: receivedMsg }); 
          break;
            
           default:
            reply("❌ Invalid option! Please reply with 1, 2, or 3.");
        }
      }
    });

  } catch (error) {
    console.error("Facebook Plugin Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});


cmd({
  pattern: "facebook2",
  alias: ["fb2"], 
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid Facebook video URL." }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // ✅ Fetching data from Aswin API
    const apiUrl = `https://apis.davidcyril.name.ng/facebook2?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Modified condition to match the new API structure
    if (!data?.status || !data?.video) {
      return reply("⚠️ Failed to retrieve Facebook media. Please check the link and try again.");
    }

    // Extracting data based on the new JSON response
    const { title, thumbnail, downloads } = data.video;
    
    // Finding SD and HD URLs dynamically from the downloads array
    const sd = downloads.find(d => d.quality === "SD")?.downloadUrl;
    const hd = downloads.find(d => d.quality === "HD")?.downloadUrl;  
    
    const caption = `
📺 *Facebook Downloader.* 📥

📑 *Title:* ${title || "No title"}
🔗 *Link:* ${q}

🔢 *Reply Below Number*

1️⃣ *SD Quality*🪫
2️⃣ *HD Quality*🔋
3️⃣ *Audio (MP3)*🎶

> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // 🧠 Interactive Reply System
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
              video: { url: sd },
              caption: "📥 *Downloaded in SD Quality*"
            }, { quoted: receivedMsg });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              video: { url: hd },
              caption: "📥 *Downloaded in HD Quality*"
            }, { quoted: receivedMsg });
            break;

          case "3": 
            await conn.sendMessage(senderID, { 
              audio: { url: sd || hd}, 
              mimetype: "audio/mp4", 
              ptt: false 
          }, { quoted: receivedMsg }); 
          break;
            
           default:
            reply("❌ Invalid option! Please reply with 1, 2, or 3.");
        }
      }
    });

  } catch (error) {
    console.error("Facebook Plugin Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});
