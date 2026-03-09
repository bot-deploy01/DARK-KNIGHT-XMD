const { cmd } = require("../command");
const axios = require("axios");
const config = require('../config');
const NodeCache = require("node-cache");

const movieCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

cmd({
  pattern: "123mkv",
  alias: ["mkv"],
  desc: "🎥 Search Sinhala subbed movies from Pirate.lk",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .123mkv <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `mkv_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://vajira-official-apis.vercel.app/api/123mkv?apikey=vajira-ukpu7tu897-1770118987096&q=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.status || !data.data.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }

    const movieList = data.data.map((m, i) => ({
      number: i + 1,
      title: m.title,
      link: m.link
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with movie number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 123𝐌𝐊𝐕 𝑪𝑰𝑵𝑬𝑴𝑨 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Cancelled.*" }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) {
          return conn.sendMessage(from, { text: "*Invalid movie number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

      const movieUrl = `https://vajira-official-apis.vercel.app/api/123mkvdetails?apikey=vajira-ukpu7tu897-1770118987096&url=${encodeURIComponent(selected.link)}`;
      const movieRes = await axios.get(movieUrl);
      const movie = movieRes.data;

      const defaultImage = "https://files.catbox.moe/ajfxoo.jpg";
      
      let downloads = [];
      if (Array.isArray(movie.dllink)) {
        downloads = movie.dllink;
      } else if (typeof movie.dllink === "string") {
        downloads = [{
          dllink: movie.dllink,
          size: movie.size || "N/A",
          quality: movie.quality || "N/A"
        }];
      }

      if (!downloads.length) {
        return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
      }

      let info =
        `🎬 *${movie.title}*\n\n` +
        `⭐ *Language:* ${movie.language}\n` +
        `📅 *Released:* ${movie.date}\n` +
        `🌍 ${movie.country}\n` +
        `🎭 ${movie.genres}\n` +
        `👷‍♂️ ${movie.actors}\n\n` +
        `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

      downloads.forEach((d, i) => {
        info += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
      });
      info += "\n🔢 *Reply with number to download.*";

      const downloadMsg = await conn.sendMessage(from, {
        image: { url: defaultImage },
          caption: info
      }, { quoted: msg });

      movieMap.set(downloadMsg.key.id, { selected, downloads });
    }

    else if (movieMap.has(repliedId)) {
      const { selected, downloads } = movieMap.get(repliedId);
      const num = parseInt(replyText);
      const chosen = downloads[num - 1];
      if (!chosen) {
        return conn.sendMessage(from, { text: "*Invalid link number.*" }, { quoted: msg });
      }

      await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

      const size = chosen.size.toLowerCase();
      const sizeGB = size.includes("gb") ? parseFloat(size) : parseFloat(size) / 1024;

      if (sizeGB > 2) {
        return conn.sendMessage(from, { text: `⚠️ *Large File (${chosen.size})*` }, { quoted: msg });
      }

      await conn.sendMessage(from, {
        document: { url: chosen.dllink },
        mimetype: "video/mp4",
        fileName: `${selected.title} - ${chosen.quality}.mp4`,
        caption: `🎬 *${selected.title}*\n🎥 *${chosen.quality}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
      }, { quoted: msg });
    }
  };
   
    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
  }
});
         
cmd({
  pattern: "notunmovie",
  alias: ["mnotun"],
  desc: "🎥 Search Sinhala subbed movies from Pirate.lk",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .notunmovie <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `mnotun_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://vajira-official-apis.vercel.app/api/notuns?apikey=vajira-sqc27t6z24-1772182844500&text=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.status || !data.result.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }

    const movieList = data.result.map((m, i) => ({
      number: i + 1,
      title: m.title,
      link: m.link
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with movie number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐍𝐎𝐓𝐔𝐍𝐌𝐎𝐕𝐈𝐄 𝑪𝑰𝑵𝑬𝑴𝑨 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Cancelled.*" }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) {
          return conn.sendMessage(from, { text: "*Invalid movie number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

      const movieUrl = `https://vajira-official-apis.vercel.app/api/notundl?apikey=vajira-sqc27t6z24-1772182844500&url=${encodeURIComponent(selected.link)}`;
      const movieRes = await axios.get(movieUrl);
      const movie = movieRes.data.result;

      if (!movie || !movie.download_links || !movie.download_links.length) {
      return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
      }

    let info =
      `🎬 *${movie.title}*\n\n` +
      `📅 *Released:* ${movie.release_date}\n` +
      `🎭 *Genre:* ${movie.genre}\n` +
      `👤 *Starring:* ${movie.starring}\n` +
      `🕵️ *Director:* ${movie.director}\n` +
      `📝 *Description:* ${movie.description}\n\n` +
      `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

       movie.download_links.forEach((d, i) => {
        info += `♦️ ${i + 1}. *${d.title}*\n`;
     });
     info += "\n🔢 *Reply with number to download.*";

     const downloadMsg = await conn.sendMessage(from, {
         image: { url: movie.image },
         caption: info
     }, { quoted: msg });

      movieMap.set(downloadMsg.key.id, { title: movie.title, downloads: movie.download_links });
    }

    else if (movieMap.has(repliedId)) {
      const { title, downloads } = movieMap.get(repliedId);
      const num = parseInt(replyText);
      const chosen = downloads[num - 1];

      if (!chosen) {
        return conn.sendMessage(from, { text: "*Invalid link number.*" }, { quoted: msg });
      }

      await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

      const downloadUrl = chosen.link;

      await conn.sendMessage(from, {
        document: { url: downloadUrl },
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        caption: `🎬 *${title}*\n🎥 *${chosen.title}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
      }, { quoted: msg });
    }
  };
   
    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
  }
});


cmd({
  pattern: "movielovers",
  alias: ["mlovers"],
  desc: "🎥 Search Sinhala subbed movies from Pirate.lk",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .movielovers <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `mlovers_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://vajira-official-apis.vercel.app/api/movielovers?apikey=vajira-sqc27t6z24-1772182844500&text=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.status || !data.result.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }

    const movieList = data.result.map((m, i) => ({
      number: i + 1,
      title: m.title,
      link: m.link
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with movie number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐌𝐎𝐕𝐈𝐄𝐋𝐎𝐕𝐄𝐑𝐒 𝑪𝑰𝑵𝑬𝑴𝑨 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Cancelled.*" }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) {
          return conn.sendMessage(from, { text: "*Invalid movie number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

      const movieUrl = `https://vajira-official-apis.vercel.app/api/movieloverdl?apikey=vajira-sqc27t6z24-1772182844500&url=${encodeURIComponent(selected.link)}`;
      const movieRes = await axios.get(movieUrl);
      const movie = movieRes.data.result;

      if (!movie || !movie.downloads || !movie.downloads.length) {
        return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
      }

      let info =
        `🎬 *${movie.title}*\n\n` +
        `💬 *Tagline:* ${movie.tagline}\n` +
        `📅 *Released:* ${movie.date}\n` +
        `⏳ *Duration:* ${movie.duration}\n` +
        `🌍 *Country:* ${movie.country}\n` +
        `🎭 *Genre:* ${movie.genre}\n\n` +
        `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

      movie.downloads.forEach((d, i) => {
        info += `♦️ ${i + 1}. *${d.quality}*\n`;
      });
      info += "\n🔢 *Reply with number to download.*";

      const downloadMsg = await conn.sendMessage(from, {
        image: { url: movie.image },
          caption: info
      }, { quoted: msg });

      movieMap.set(downloadMsg.key.id, { title: movie.title, downloads: movie.downloads });
    }

    else if (movieMap.has(repliedId)) {
      const { title, downloads } = movieMap.get(repliedId);
      const num = parseInt(replyText);
      const chosen = downloads[num - 1];

      if (!chosen) {
        return conn.sendMessage(from, { text: "*Invalid link number.*" }, { quoted: msg });
      }

      await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

      const downloadUrl = chosen.pixeldrain;

      await conn.sendMessage(from, {
        document: { url: downloadUrl },
        mimetype: "video/mp4",
        fileName: `${title} - ${chosen.quality}.mp4`,
        caption: `🎬 *${title}*\n🎥 *${chosen.quality}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
      }, { quoted: msg });
    }
  };
   
    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
  }
});

cmd({
  pattern: "pupilvideo",
  alias: ["pupil"],
  desc: "🎥 Search Sinhala subbed movies from Sub.lk",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .pupilvideo <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `pupilvideo_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://darkyasiya-new-movie-api.vercel.app//api/movie/pupil/search?q=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.success || !data.data?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }
    
    const movieList = data.data.map((m, i) => ({
      number: i + 1,
      title: m.title,
      published: m.published,
      author: m.author,
      tag: m.tag,
      link: m.link
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with movie number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐏𝐔𝐏𝐈𝐋𝐕𝐈𝐃𝐄𝐎 𝑪𝑰𝑵𝑬𝑴𝑨 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Cancelled.*" }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) {
          return conn.sendMessage(from, { text: "*Invalid Movie Number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        const movieUrl = `https://darkyasiya-new-movie-api.vercel.app//api/movie/pupil/movie?url=${encodeURIComponent(selected.link)}`;
        const movieRes = await axios.get(movieUrl);
        const movie = movieRes.data.data;

        const defaultImage = "https://files.catbox.moe/ajfxoo.jpg";
        
        if (!movie.downloadLink?.length) {
          return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *Tag:* ${selected.tag}\n` +
          `📅 *Published:* ${selected.published}\n` +
          `✍️ *Author:* ${selected.author}\n` +
          `👷‍♂️ *Cast:*\n${movie.cast.slice(0, 20).join(", ")}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        movie.downloadLink.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.type}* — ${d.size}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: defaultImage || movie.image },
          caption: info
        }, { quoted: msg });
        
        movieMap.set(downloadMsg.key.id, { selected, downloads: movie.downloadLink });
      }

      else if (movieMap.has(repliedId)) {
        const { selected, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];
        if (!chosen) {
          return conn.sendMessage(from, { text: "*Invalid number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        const size = chosen.size.toLowerCase();
        const sizeGB = size.includes("gb") ? parseFloat(size) : parseFloat(size) / 1024;

        if (sizeGB > 2) {
          return conn.sendMessage(from, { text: `⚠️ *Large File (${chosen.size})*` }, { quoted: msg });
        }

        await conn.sendMessage(from, {
          document: { url: chosen.link },
          mimetype: "video/mp4",
          fileName: `${selected.title} - ${chosen.size}.mp4`,
          caption: `🎬 *${selected.title}*\n🎥 *${chosen.size}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
        }, { quoted: msg });
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
  }
});

cmd({
  pattern: "sinhalasubs",
  alias: ["ssubs"],
  desc: "🎥 Search Sinhala subbed movies from Sub.lk",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .sinhalasubs <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `sinhalasubs_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://visper-md-ap-is.vercel.app/movie/sinhalasub/search?q=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.success || !data.result?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }
    
    const movieList = data.result.map((m, i) => ({
      number: i + 1,
      title: m.Title,
      link: m.Link,
      type: m.Type
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with movie number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐒𝐈𝐍𝐇𝐀𝐋𝐀𝐒𝐔𝐁𝐒 𝑪𝑰𝑵𝑬𝑴𝑨 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Cancelled.*" }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) {
          return conn.sendMessage(from, { text: "*Invalid Movie Number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        const infoUrl = `https://sinhalasubdl.vercel.app/api/download?url=${encodeURIComponent(selected.link)}`;
        const infoRes = await axios.get(infoUrl);
        const movie = infoRes.data;

        if (!movie.status) {
          return conn.sendMessage(from, {
            text: "*❌ Failed to fetch movie details.*"
          }, { quoted: msg });
        }

        const pixeldrain = movie.result.downloads.filter(d =>
          d.provider === "Pixeldrain" && d.direct_link
        );

        if (!pixeldrain.length) {
          return conn.sendMessage(from, {
            text: "*❌ Pixeldrain links not available.*"
          }, { quoted: msg });
        }

        let info =
          `🎬 *${movie.result.title}*\n\n` +
          `📅 *Released* ${movie.result.year}\n` +
          `🕐 *Runtime:* ${movie.result.duration}\n` +
          `✍️ *Type:* ${selected.type}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥 📥\n\n`;

        pixeldrain.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
        });

        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: movie.result.poster },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { title: movie.result.title, downloads: pixeldrain });
      }
       
      else if (movieMap.has(repliedId)) {
        const { title, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];

        if (!chosen) {
          return conn.sendMessage(from, { text: "*❌ Invalid number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        let directLink = chosen.direct_link;

        if (directLink.includes("pixeldrain.com")) {
          const match = directLink.match(/\/([A-Za-z0-9]+)$/);
          if (match) directLink = `https://pixeldrain.com/api/file/${match[1]}`;
        }
        
        const sizeText = chosen.size.toLowerCase();
        const sizeGB = sizeText.includes("gb") ? parseFloat(sizeText) : parseFloat(sizeText) / 1024;

        if (sizeGB > 2) {
          return conn.sendMessage(from, {
            text: `⚠️ *Large File:* ${chosen.size}`
          }, { quoted: msg });
        }

        await conn.sendMessage(from, {
          document: { url: directLink },
          mimetype: "video/mp4",
          fileName: `${title} - ${chosen.quality}.mp4`,
          caption: `🎬 *${title}*\n🎥 *${chosen.quality}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
        }, { quoted: msg });
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    console.error(err);
    conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
  }
});
       
cmd({
  pattern: "baiscope",
  alias: ["bais"],
  desc: "🎥 Search Sinhala subbed movies from Baiscope.lk",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  const axios = require("axios");
  const NodeCache = require("node-cache");
  const movieCache = new NodeCache({ stdTTL: 1800 }); // cache 30 min

  if (!q) {
    return conn.sendMessage(from, {
      text: "*Usage:* .baiscope <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `baiscope_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const searchUrl = `https://movie-apis-omega.vercel.app/movie/baiscope/search?q=${encodeURIComponent(q)}&apikey=dark-key-2008`;
      const res = await axios.get(searchUrl);
      data = res.data;
      if (!data.status || !data.result?.length) throw new Error("No results found.");
      movieCache.set(cacheKey, data);
    }

    const movies = data.result.map((m, i) => ({
      number: i + 1,
      title: m.title,
      link: m.url
    }));

    let textList = `*🔍 𝐁𝐀𝐈𝐒𝐂𝐎𝐏𝐄 𝐒𝐄𝐀𝐑𝐂𝐇 𝐑𝐄𝐒𝐔𝐋𝐓𝐒 🎬*\n\n🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━\n\n`;
    movies.forEach(m => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with a number to get movie details.*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳";

    const sentMsg = await conn.sendMessage(from, { text: textList }, { quoted: mek });
    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;
      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Search cancelled.*" }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movies.find(m => m.number === num);
        if (!selected) return conn.sendMessage(from, { text: "❌ Invalid movie number." }, { quoted: msg });

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        const infoUrl = `https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${encodeURIComponent(selected.link)}&apiKey=vispermdv4`;
        const infoRes = await axios.get(infoUrl);
        const movieData = infoRes.data.data;
        const movie = movieData.movieInfo;
        const downloads = (movieData.downloadLinks || []).filter(d => d.directLinkUrl && d.directLinkUrl.toLowerCase().includes("drive.baiscopeslk.workers")  || d.directLinkUrl.toLowerCase().includes("drive2.baiscopeslk.workers") );

        if (downloads.length === 0) {
          return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
        }
       
        let caption = 
          `🎬 *${movie.title}*\n\n` +
          `⭐ *IMDB:* ${movie.ratingValue}\n` +
          `🕐 *Duration:* ${movie.runtime}\n` +
          `🌍 *Country:* ${movie.country}\n` +
          `📅 *Release:* ${movie.releaseDate}\n` +
          `🎭 *Genres:* ${movie.genres?.join(", ")}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        downloads.forEach((d, i) => {
          caption += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
        });

        caption += "\n🔢 *Reply with number to download.*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳";

        const infoMsg = await conn.sendMessage(from, {
          image: { url: movie.galleryImages?.[0] },
          caption
        }, { quoted: msg });

        movieMap.set(infoMsg.key.id, { selected, downloads });
      }

      else if (movieMap.has(repliedId)) {
        const { selected, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];

        if (!chosen) return conn.sendMessage(from, { text: "❌ Invalid download number." }, { quoted: msg });

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        const size = chosen.size.toLowerCase();
        const sizeGB = size.includes("gb") ? parseFloat(size) : parseFloat(size) / 1024;
        const link = chosen.directLinkUrl;

        if (sizeGB > 2) {
          return conn.sendMessage(from, {
            text: `⚠️ *File too large (${chosen.size})*\n🔗 Use link manually:\n${link}`
          }, { quoted: msg });
        }

        await conn.sendMessage(from, {
          document: { url: link },
          mimetype: "video/mp4",
          fileName: `${selected.title} - ${chosen.quality}.mp4`,
          caption: `🎬 *${selected.title}*\n🎥 *${chosen.quality}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
        }, { quoted: msg });
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, {
      text: `❌ *Error:* ${err.message}`
    }, { quoted: mek });
  }
});

cmd({
  pattern: "cinesubz",
  alias: ["cine"],
  desc: "🎥 Search Sinhala subded movies from CineSubz",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .cinesubz <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `cinesubz_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://darkyasiya-new-movie-api.vercel.app/api/movie/cinesubz/search?q=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.success || !data.data.all?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }

    const movieList = data.data.all.map((m, i) => ({
      number: i + 1,
      title: m.title,
      link: m.link
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with movie number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐂𝐈𝐍𝐄𝐒𝐔𝐁𝐙 𝑪𝑰𝑵𝑬𝑴𝑨 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n\n> > Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
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
          return conn.sendMessage(from, { text: "*Invalid movie number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        const movieUrl = `https://darkyasiya-new-movie-api.vercel.app/api/movie/cinesubz/movie?url=${encodeURIComponent(selected.link)}`;
        const movieRes = await axios.get(movieUrl);
        const movie = movieRes.data.data;

        if (!movie.downloadUrl?.length) {
          return conn.sendMessage(from, { text: "*No download links available.*"}, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *IMDb:* ${movie.imdb.value}\n` +
          `📅 *Released:* ${movie.dateCreate}\n` +
          `🌍 *Country:* ${movie.country}\n` +
          `🕐 *Runtime:* ${movie.runtime}\n` +
          `🎭 *Category:* ${movie.category.join(", ")}\n` +
          `🕵️ *Director:* ${movie.director?.name.join(", ")}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        movie.downloadUrl.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: movie.mainImage },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { selected, downloads: movie.downloadUrl });
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
        
        const apiUrl = `https://cine-download-api.vercel.app/api/download?url=${encodeURIComponent(chosen.link)}`;
        const apiRes = await axios.get(apiUrl);
        const downloadLinks = apiRes.data?.data?.downloadUrls;

        let finalDownloadLink = downloadLinks?.find(link => 
            link.url.includes("pixeldrain.com") && !link.url.includes("t.me")
        )?.url;
        
        if (!finalDownloadLink) {
            const backupLink = downloadLinks?.find(link => 
                !link.url.includes("t.me") && 
                (link.url.startsWith("http"))
            );
            finalDownloadLink = backupLink?.url;
        }
        
        if (!finalDownloadLink) {
            return conn.sendMessage(from, { text: "*download link not found.*" }, { quoted: msg });
        }
        
        await conn.sendMessage(from, {
          document: { url: finalDownloadLink },
          mimetype: "video/mp4",
          fileName: `${selected.title} - ${chosen.quality}.mp4`,
          caption: `🎬 *${selected.title}*\n🎥 *${chosen.quality}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
        }, { quoted: msg });
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek }); 
  }
});

cmd({
  pattern: "sinhalasub",
  alias: ["ssub"],
  desc: "🎥 Search Sinhala subbed movies from Sub.lk",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .sinhalasub <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `sinhalasub_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://darkyasiya-new-movie-api.vercel.app/api/movie/sinhalasub/search?q=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.success || !data.data?.data?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }
    
    const movieList = data.data.data.map((m, i) => ({
      number: i + 1,
      title: m.title,
      link: m.link
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with movie number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐒𝐈𝐍𝐇𝐀𝐋𝐀𝐒𝐔𝐁 𝑪𝑰𝑵𝑬𝑴𝑨 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Cancelled.*" }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) {
          return conn.sendMessage(from, { text: "*Invalid Movie Number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        const movieUrl = `https://darkyasiya-new-movie-api.vercel.app/api/movie/sinhalasub/movie?url=${encodeURIComponent(selected.link)}`;
        const movieRes = await axios.get(movieUrl);
        const movie = movieRes.data.data;

        movie.downloadUrl = movie.downloadUrl.filter(d => d.link.includes("pixeldrain.com") || d.link.includes("ddl.sinhalasub.net") );

        if (!movie.downloadUrl?.length) {
          return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *IMDb:* ${movie.imdb?.value}\n` +
          `📅 *Released:* ${movie.date}\n` +
          `🌍 *Country:* ${movie.country}\n` +
          `🕐 *Runtime:* ${movie.runtime}\n` +
          `🎭 *Category:* ${movie.category?.join(", ")}\n` +
          `✍️ Subtitle Author: ${movie.subtitle_author}\n` +
          `🕵️ *Director:* ${movie.director}\n` +
          `👷‍♂️ *Cast:* ${movie.cast.slice(0, 20).join(", ")}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        movie.downloadUrl.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: movie.mainImage },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { selected, downloads: movie.downloadUrl });
      }

      else if (movieMap.has(repliedId)) {
        const { selected, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];
        if (!chosen) {
          return conn.sendMessage(from, { text: "*Invalid number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        let directLink = chosen.link;

        if (directLink.includes("pixeldrain.com")) {
          const match = directLink.match(/\/([A-Za-z0-9]+)$/);
          if (match) directLink = `https://pixeldrain.com/api/file/${match[1]}`;
        }

        const size = chosen.size.toLowerCase();
        const sizeGB = size.includes("gb") ? parseFloat(size) : parseFloat(size) / 1024;

        if (sizeGB > 2) {
          return conn.sendMessage(from, { text: `⚠️ *Large File (${chosen.size})*` }, { quoted: msg });
        }

        await conn.sendMessage(from, {
          document: { url: directLink },
          mimetype: "video/mp4",
          fileName: `${selected.title} - ${chosen.quality}.mp4`,
          caption: `🎬 *${selected.title}*\n🎥 *${chosen.quality}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
        }, { quoted: msg });
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
  }
});

cmd({
  pattern: "sublk",
  alias: ["sub"],
  desc: "🎥 Search Sinhala subbed movies from Sub.lk",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .sublk <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `sublk_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://movie-apis-omega.vercel.app/movie/sub/search?text=${encodeURIComponent(q)}&apikey=dark-key-2008`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.status || !data.result?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }
    
    const movieList = data.result.map((m, i) => ({
      number: i + 1,
      title: m.title,
      link: m.url
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with movie number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐒𝐔𝐁𝐋𝐊 𝑪𝑰𝑵𝑬𝑴𝑨 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Cancelled.*" }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) {
          return conn.sendMessage(from, { text: "*Invalid Movie Number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        const dlUrl = `https://movie-apis-omega.vercel.app/movie/sub/movie?url=${encodeURIComponent(selected.link)}&apikey=dark-key-2008`;
        const dlRes = await axios.get(dlUrl);
        const movie = dlRes.data.result;
        const dllink = dlRes.data.result;
        const pixeldrainLinks = dllink.dl_links.pixeldrain || [];
        
        if (!pixeldrainLinks.length) {
          return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *IMDb:* ${movie.imdb}\n` +
          `📅 *Released:* ${movie.year}\n` +
          `🌍 *Country:* ${movie.country}\n` +
          `🕐 *Runtime:* ${movie.duration}\n` +
          `🎭 *Category:* ${movie.genres?.join(", ")}\n` +
          `🕵️ *Director:* ${movie.director?.join(", ")}\n` +
          `👷‍♂️ *Cast:* ${movie.cast?.slice(0, 20).join(", ")}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        pixeldrainLinks.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: movie.poster },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { selected, downloads: pixeldrainLinks });
      }

      else if (movieMap.has(repliedId)) {
        const { selected, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];
        if (!chosen) {
          return conn.sendMessage(from, { text: "*Invalid number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        const size = chosen.size.toLowerCase();
        const sizeGB = size.includes("gb") ? parseFloat(size) : parseFloat(size) / 1024;

        if (sizeGB > 2) {
          return conn.sendMessage(from, { text: `⚠️ *Large File (${chosen.size})*` }, { quoted: msg });
        }

        await conn.sendMessage(from, {
          document: { url: chosen.url },
          mimetype: "video/mp4",
          fileName: `${selected.title} - ${chosen.quality}.mp4`,
          caption: `🎬 *${selected.title}*\n🎥 *${chosen.quality}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
        }, { quoted: msg });
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
  }
});

cmd({
  pattern: "pirate",
  alias: ["pira"],
  desc: "🎥 Search Sinhala subbed movies from Pirate.lk",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .pirate <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `pirate_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://darkyasiya-new-movie-api.vercel.app/api/movie/pirate/search?q=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.success || !data.data.all?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }

    const movieList = data.data.all.map((m, i) => ({
      number: i + 1,
      title: m.title,
      link: m.link
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with movie number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐏𝐈𝐑𝐀𝐓𝐄 𝑪𝑰𝑵𝑬𝑴𝑨 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Cancelled.*" }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) {
          return conn.sendMessage(from, { text: "*Invalid movie number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        const movieUrl = `https://darkyasiya-new-movie-api.vercel.app/api/movie/pirate/movie?url=${encodeURIComponent(selected.link)}`;
        const movieRes = await axios.get(movieUrl);
        const movie = movieRes.data.data;

        const dlUrl = `https://movie-apis-omega.vercel.app/movie/pirate/movie?url=${encodeURIComponent(selected.link)}&apikey=dark-key-2008`;
        const dlRes = await axios.get(dlUrl);
        const dllink = dlRes.data.result;
        const pixeldrainLinks = dllink.dl_links.pixeldrain || [];
        
        if (!pixeldrainLinks.length) {
          return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *IMDb:* ${movie.imdb?.value}\n` +
          `📅 *Released:* ${movie.dateCreate}\n` +
          `🌍 *Country:* ${movie.country}\n` +
          `🕐 *Runtime:* ${movie.runtime}\n` +
          `🎭 *Category:* ${movie.category?.join(", ")}\n` +
          `🕵️ *Director:* ${movie.director?.name}\n` +
          `👷‍♂️ *Cast:* ${movie.cast?.map(c => c.actor.name).slice(0, 20).join(", ")}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        pixeldrainLinks.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: movie.mainImage },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { selected, downloads: pixeldrainLinks });
      }

      else if (movieMap.has(repliedId)) {
        const { selected, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];
        if (!chosen) {
          return conn.sendMessage(from, { text: "*Invalid link number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        const size = chosen.size.toLowerCase();
        const sizeGB = size.includes("gb") ? parseFloat(size) : parseFloat(size) / 1024;

        if (sizeGB > 2) {
          return conn.sendMessage(from, { text: `⚠️ *Large File (${chosen.size})*` }, { quoted: msg });
        }

        await conn.sendMessage(from, {
          document: { url: chosen.link },
          mimetype: "video/mp4",
          fileName: `${selected.title} - ${chosen.quality}.mp4`,
          caption: `🎬 *${selected.title}*\n🎥 *${chosen.quality}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
        }, { quoted: msg });
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
  }
});

cmd({
  pattern: "subzlk",
  alias: ["subz"],
  desc: "🎥 Search Sinhala subded movies from CineSubz",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .subzlk <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `subzlk_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://movie-apis-omega.vercel.app/movie/subzlk/search?text=${encodeURIComponent(q)}&apikey=dark-key-2008`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.status || !data.result?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }

    const movieList = data.result.map((m, i) => ({
      number: i + 1,
      title: m.title,
      link: m.link
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with movie number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐒𝐔𝐁𝐙𝐋𝐊 𝑪𝑰𝑵𝑬𝑴𝑨 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n\n> > Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
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
          return conn.sendMessage(from, { text: "*Invalid movie number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        const movieUrl = `https://movie-apis-omega.vercel.app/movie/subzlk/movie?url=${encodeURIComponent(selected.link)}&apikey=dark-key-2008`;
        const movieRes = await axios.get(movieUrl);
        const movie = movieRes.data.result;

        if (!movie.dl_links?.length) {
          return conn.sendMessage(from, { text: "*No download links available.*"}, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *IMDb:* ${movie.imdb}\n` +
          `📅 *Released:* ${movie.year}\n` +
          `🌍 *Country:* ${movie.country}\n` +
          `🕐 *Runtime:* ${movie.duration}\n` +
          `🎭 *Category:* ${movie.genres.join(", ")}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        movie.dl_links.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: movie.poster },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { selected, downloads: movie.dl_links });
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
        
        const apiUrl = `https://movie-apis-omega.vercel.app/movie/gdrive/download?url=${encodeURIComponent(chosen.dllink)}&apikey=dark-key-2008`;
        const apiRes = await axios.get(apiUrl);
        const direct = apiRes.data.result.finalLink;

        if (!direct) {
            return conn.sendMessage(from, { text: "*download link not found.*" }, { quoted: msg });
        }
        
        await conn.sendMessage(from, {
          document: { url: direct },
          mimetype: "video/mp4",
          fileName: `${selected.title} - ${chosen.quality}.mp4`,
          caption: `🎬 *${selected.title}*\n🎥 *${chosen.quality}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
        }, { quoted: msg });
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek }); 
  }
});
