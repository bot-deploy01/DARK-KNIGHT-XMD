const axios = require("axios");
const { cmd } = require('../command');


cmd({
  pattern: "instagram",
  alias: ["insta"],
  desc: "Download Instagram videos and audio",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid Instagram URL." }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.status || !data.data || data.data.length === 0) {
      return reply("⚠️ Failed to retrieve Instagram media. Please check the link and try again.");
    }

    const media = data.data[0];
    const caption = `
📺 Instagram Downloader. 📥

🗂️ *Type:* ${media.type.toUpperCase()}
🔗 *Link:* ${q}

🔢 *Reply Below Number*

1️⃣  *HD Quality*🔋
2️⃣  *Audio (MP3)*🎶

> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: media.thumbnail },
      caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // 🧠 Listen for user reply
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
            if (media.type === "video") {
              await conn.sendMessage(senderID, {
                video: { url: media.url },
                caption: "📥 *Video Downloaded Successfully!*"
              }, { quoted: receivedMsg });
            } else {
              reply("⚠️ No video found for this post.");
            }
            break;

          case "2":
              await conn.sendMessage(senderID, {
                audio: { url: media.url },
                mimetype: "audio/mp4",
                ptt: false
              }, { quoted: receivedMsg });
            break;

          default:
            reply("❌ Invalid option! Please reply with 1 or 2.");
        }
      }
    });

  } catch (error) {
    console.error("Instagram Plugin Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});

cmd({
  pattern: "igvid",
  alias: ["ig"],
  desc: "Download Instagram video",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return reply("❌ Please provide a valid Instagram URL.");
    }

    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    const api = `https://www.movanest.xyz/v2/instagram?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(api);

    if (!data.status || !data.results) {
      return reply("⚠️ Failed to retrieve Instagram media.");
    }

    const videoUrl = data.results.downloadUrl;
    const thumbUrl = data.results.posterUrl;

    const caption = `
📺 Instagram Downloader. 📥

🔗 *Link:* ${q}

🔢 *Reply Below Number*

1️⃣  *HD Quality*🔋
2️⃣  *Audio (MP3)*🎶

> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumbUrl },
      caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // 🧠 Listen for user reply
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
                video: { url: videoUrl },
                caption: "📥 *Video Downloaded Successfully!*"
              }, { quoted: receivedMsg });
            break;

          case "2":
              await conn.sendMessage(senderID, {
                audio: { url: videoUrl },
                mimetype: "audio/mp4",
                ptt: false
              }, { quoted: receivedMsg });
            break;

          default:
            reply("❌ Invalid option! Please reply with 1 or 2.");
        }
      }
    });

  } catch (error) {
    console.error("Instagram Plugin Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});

cmd({
  pattern: "igdl",
  alias: ["ig2"],
  desc: "Download Instagram Reels, Videos & Photos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid Instagram URL." }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // ✅ Fetching data from API
    const response = await axios.get(`https://apis.davidcyril.name.ng/instagram?url=${q}`);
    const data = response.data;

    if (!data || !data.success || !data.downloadUrl) {
      return reply("⚠️ Failed to retrieve Instagram media. Please check the link and try again.");
    }

    const { creator, thumbnail, downloadUrl } = data;

    const caption = `
📺 Instagram Downloader. 📥

🔗 *Link:* ${q}

🔢 *Reply Below Number*

1️⃣  *HD Quality*🔋
2️⃣  *Audio (MP3)*🎶

> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // 🧠 Handle user reply to select option
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
              video: { url: downloadUrl[0] },
              caption: "📥 *Video Downloaded Successfully!*"
            }, { quoted: receivedMsg });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              audio: { url: downloadUrl[0] },
              mimetype: "audio/mp4",
              ptt: false
            }, { quoted: receivedMsg });
            break;

          default:
            reply("❌ Invalid option! Please reply with 1 or 2.");
        }
      }
    });

  } catch (error) {
    console.error("Instagram Plugin Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});
