const { cmd } = require("../command");
const axios = require("axios");
const config = require('../config');
const NodeCache = require("node-cache");

const movieCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

cmd({
  pattern: "aptoide",
  alias: ["apk"],
  desc: "📥 Search apps from Aptoide with full info",
  category: "media",
  react: "📲",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .apk <app name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `aptoide_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      
      const url = `https://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.datalist || !data.datalist.list || !data.datalist.list.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }

    const movieList = data.datalist.list.map((m, i) => ({
      number: i + 1,
      title: m.name,
      link: m.file ? m.file.path : null,
      package: m.package,
      icon: m.icon,
      size: (m.size / (1024 * 1024)).toFixed(2) + " MB",
      developer: m.developer ? m.developer.name : 'N/A',
      added: m.added || 'N/A',
      modified: m.modified || 'N/A',
      updated: m.updated || 'N/A',
      description: m.store && m.store.appearance ? m.store.appearance.description : 'N/A',
      vername: m.file ? m.file.vername : 'N/A',
      downloads: m.stats ? m.stats.downloads.toLocaleString() : '0',
      rating: m.stats && m.stats.prating ? m.stats.prating.avg : 'N/A'
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with app number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐀𝐏𝐓𝐎𝐈𝐃𝐄 𝐀𝐏𝐏 𝐒𝐄𝐀𝐑𝐂𝐇 📥*\n\n${textList}\n\n> > Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Cancelled*" }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) {
          return conn.sendMessage(from, { text: "*Invalid app number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        if (!selected.link) {
          return conn.sendMessage(from, { text: "*No download links available.*"}, { quoted: msg });
        }

        const download_links = [
          {
            text: "Direct APK",
            size: selected.size,
            url: selected.link
          }
        ];

        let info =
          `📦 *App Name:* ${selected.title}\n` +
          `🆔 *Package:* ${selected.package}\n` +
          `👨‍💻 *Developer:* ${selected.developer}\n` +
          `ℹ️ *Version:* ${selected.vername}\n` +
          `📥 *Downloads:* ${selected.downloads}\n` +
          `⭐ *Rating:* ${selected.rating}\n` +
          `📅 *Added:* ${selected.added}\n` +
          `🔄 *Modified:* ${selected.modified}\n` +
          `🆙 *Updated:* ${selected.updated}\n` +
          `📝 *Description:* ${selected.description}\n\n` +
          `📥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝓼:* 🚀\n\n`;

        download_links.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.text}* — ${d.size}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: selected.icon },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { selected, downloads: download_links });
      }

      else if (movieMap.has(repliedId)) {
        const { selected, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];
        if (!chosen) {
          return conn.sendMessage(from, { text: "*Invalid quality number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        const size = chosen.size.toLowerCase();
        const sizeGB = size.includes("gb") ? parseFloat(size) : parseFloat(size) / 1024;

        if (sizeGB > 2) {
          return conn.sendMessage(from, { text: `⚠️ *Large File (${chosen.size})*` }, { quoted: msg });
        }
        
        const direct = chosen.url;

        if (!direct) {
            return conn.sendMessage(from, { text: "*download link not found.*" }, { quoted: msg });
        }
        
        await conn.sendMessage(from, {
          document: { url: direct },
          mimetype: "application/vnd.android.package-archive",
          fileName: `${selected.title}.apk`,
          caption: `📦 *${selected.title}*\n📥 *Size:* ${chosen.size}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
        }, { quoted: msg });
        
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek }); 
  }
});


cmd({
  pattern: "apk2",
  react: '📦',
  desc: "Download APK files using NexOracle API.",
  category: "download",
  use: ".apk <app name>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    // Check if the user provided an app name
    const appName = args.join(" ");
    if (!appName) {
      return reply('Please provide an app name. Example: `.apk whatsapp `');
    }

    // Add a reaction to indicate processing
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // Prepare the NexOracle API URL
    const apiUrl = `https://api.nexoracle.com/downloader/apk`;
    const params = {
      apikey: 'free_key@maher_apis', // Replace with your API key if needed
      q: appName, // App name to search for
    };

    // Call the NexOracle API using GET
    const response = await axios.get(apiUrl, { params });

    // Check if the API response is valid
    if (!response.data || response.data.status !== 200 || !response.data.result) {
      return reply('❌ Unable to find the APK. Please try again later.');
    }

    // Extract the APK details
    const { name, lastup, package, size, icon, dllink } = response.data.result;

    // Send a message with the app thumbnail and "Downloading..." text
    await conn.sendMessage(from, {
      image: { url: icon }, // App icon as thumbnail
      caption: `📦 *Downloading ${name}... Please wait.*`,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363400240662312@newsletter',
          newsletterName: '『『 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳 』』',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

    // Download the APK file
    const apkResponse = await axios.get(dllink, { responseType: 'arraybuffer' });
    if (!apkResponse.data) {
      return reply('❌ Failed to download the APK. Please try again later.');
    }

    // Prepare the APK file buffer
    const apkBuffer = Buffer.from(apkResponse.data, 'binary');

    // Prepare the message with APK details
    const message = `📦 *ᴀᴘᴋ ᴅᴇᴛᴀɪʟs*📦:\n\n` +
      `🔖 *Nᴀᴍᴇ*: ${name}\n` +
      `📅 *Lᴀsᴛ ᴜᴘᴅᴀᴛᴇ*: ${lastup}\n` +
      `📦 *Pᴀᴄᴋᴀɢᴇ*: ${package}\n` +
      `📏 *Sɪᴢᴇ*: ${size}\n\n` +
      `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳 `;

    // Send the APK file as a document
    await conn.sendMessage(from, {
      document: apkBuffer,
      mimetype: 'application/vnd.android.package-archive',
      fileName: `${name}.apk`,
      caption: message,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363400240662312@newsletter',
          newsletterName: '『 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳 』 ',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

    // Add a reaction to indicate success
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error fetching APK details:', error);
    reply('❌ Unable to fetch APK details. Please try again later.');

    // Add a reaction to indicate failure
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});


/*cmd({
  pattern: "apk2",
  desc: "Download APK from Aptoide.",
  category: "download",
  filename: __filename
}, async (conn, m, store, {
  from,
  quoted,
  q,
  reply
}) => {
  try {
    if (!q) {
      return reply("❌ Please provide an app name to search.");
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.datalist || !data.datalist.list.length) {
      return reply("⚠️ No results found for the given app name.");
    }

    const app = data.datalist.list[0];
    const appSize = (app.size / 1048576).toFixed(2); // Convert bytes to MB

    const caption = `╭━━━〔 *APK Downloader* 〕━━━┈⊷
┃ 📦 *Name:* ${app.name}
┃ 🏋 *Size:* ${appSize} MB
┃ 📦 *Package:* ${app.package}
┃ 📅 *Updated On:* ${app.updated}
┃ 👨‍💻 *Developer:* ${app.developer.name}
╰━━━━━━━━━━━━━━━┈⊷
🔗 *Powered By 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳*`;

    await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

    await conn.sendMessage(from, {
      document: { url: app.file.path_alt },
      fileName: `${app.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: caption
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while fetching the APK. Please try again.");
  }
});*/
