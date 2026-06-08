const { cmd } = require("../command");
const axios = require("axios");
const config = require('../config');
const NodeCache = require("node-cache");

const movieCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
const KEY = "vajira-VajiraOfficial2003";

cmd({
  pattern: "moviepro",
  alias: ["mpro"],
  desc: "🎥 Search movies from GiftedTech MovieAPI",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) return await conn.sendMessage(from, { text: "Use: .moviepro <movie name>" }, { quoted: mek });

  try {
    const cacheKey = `moviepro_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://gzmovieboxapi.septorch.tech/api/search?apikey=Godszeal&query=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      
      data = res.data;

      if (!data.data?.items?.length) throw new Error("No results found.");

      movieCache.set(cacheKey, data);
    }

    const movieList = data.data.items.map((m, i) => ({
      number: i + 1,
      id: m.subjectId,
      detailPath: m.detailPath,
      title: m.title,
      year: m.releaseDate,
      time: m.duration,
      genre: m.genre,
      thumbnail: m.cover?.url,
      country: m.countryName,
      imdb: m.imdbRatingValue,
      post: m.postTitle
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━━━\n\n";
    movieList.forEach(m => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐌𝐎𝐕𝐈𝐄𝐏𝐑𝐎 𝑪𝑰𝑵𝑬𝑴𝑨 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n💬 Reply with movie number to view details.\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`,
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ Cancelled." }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) return conn.sendMessage(from, { text: "*Invalid movie number.*" }, { quoted: msg });

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        const movieUrl = `https://gzmovieboxapi.septorch.tech/api/media?apikey=Godszeal&detailPath=${selected.detailPath}&subjectId=${selected.id}`;
        const movieRes = await axios.get(movieUrl);
    
        const downloads = movieRes.data?.data?.downloads?.data?.downloads;

        if (!downloads?.length) return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });

        let info = 
          `🎬 *${selected.title}*\n\n` +
          `⭐ *IMDb:* ${selected.imdb}\n` +
          `📅 *Released:* ${selected.year}\n` +
          `🌍 *Country:* ${selected.country}\n` +
          `🕐 *Runtime:* ${selected.time} min\n` +
          `🎭 *Category:* ${selected.genre}\n` +
          `📝 *Posttitle:*\n${selected.post}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;
        
        downloads.forEach((d, i) => {  
          const sizeInBytes = parseInt(d.size);
          const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(1);
          const formattedSize = sizeMB >= 1024 ? `${(sizeMB / 1024).toFixed(2)} GB` : `${sizeMB} MB`;
          
          info += `♦️ ${i + 1}. *${d.resolution}p* — ${formattedSize}\n`;
        });
        info += "\n🔢 Reply with number to download.";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: selected.thumbnail },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { selected, downloads });
      }

      else if (movieMap.has(repliedId)) {
        const { selected, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];
        if (!chosen) return conn.sendMessage(from, { text: "*Invalid number.*" }, { quoted: msg });

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        const sizeInBytes = parseInt(chosen.size);
        const sizeGB = sizeInBytes / (1024 * 1024 * 1024);
        
        const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(1);
        const formattedSize = sizeMB >= 1024 ? `${(sizeMB / 1024).toFixed(2)} GB` : `${sizeMB} MB`;
        
        if (sizeGB > 2) return conn.sendMessage(from, { text: `⚠️ Large file (${formattedSize})` }, { quoted: msg });

        await conn.sendMessage(from, {
          document: { url: chosen.downloadUrl },
          mimetype: "video/mp4",
          fileName: `${selected.title} - ${chosen.resolution}p.mp4`,
          caption: `🎬 *${selected.title}*\n🎥 *${chosen.resolution}p*\n\n> © Powerd by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
        }, { quoted: msg });
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
  }
});

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
      const url = `https://vajira-official-apis.vercel.app/api/123mkv?apikey=${KEY}&q=${encodeURIComponent(q)}`;
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

      const movieUrl = `https://vajira-official-apis.vercel.app/api/123mkvdetails?apikey=${KEY}&url=${encodeURIComponent(selected.link)}`;
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
  pattern: "mlfbd",
  alias: ["ml"],
  desc: "🎥 Search movies from MLFBD",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .mlfbd <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `mlfbd_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://vajira-official-apis.vercel.app/api/mlfbds?apikey=${KEY}&text=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (data.status !== 200 || !data.result?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }
    
    const movieList = data.result.map((m, i) => ({
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
      text: `*🔍 𝐌𝐋𝐅𝐁𝐃 𝐂𝐈𝐍𝐄𝐌𝐀 𝐒𝐄𝐀𝐑𝐂𝐇 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
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

        const dlUrl = `https://vajira-official-apis.vercel.app/api/mlfbddl?apikey=${KEY}&url=${encodeURIComponent(selected.link)}`;
        const dlRes = await axios.get(dlUrl);
        const movie = dlRes.data.result; 

        if (!movie.downloads || !movie.downloads.length) {
          return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *Rating:* ${movie.rating}\n` +
          `📅 *Released:* ${movie.release}\n` +
          `🕐 *Runtime:* ${movie.duration}\n` +
          `🎭 *Genres:* ${movie.genres}\n` +
          `📝 *Description:* ${movie.description.substring(0, 200)}...\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        movie.downloads.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
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
          return conn.sendMessage(from, { text: "*Invalid number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        const size = chosen.size.toLowerCase();
        const sizeGB = size.includes("gb") ? parseFloat(size) : parseFloat(size) / 1024;

        if (sizeGB > 2) { 
          return conn.sendMessage(from, { text: `⚠️ *Large File* (${chosen.size})` }, { quoted: msg });
        }

        await conn.sendMessage(from, {
          document: { url: chosen.direct },
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
  pattern: "movibd",
  alias: ["movi"],
  desc: "🎥 Search movies from MoviBD",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .movibd <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `movibd_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://vajira-official-apis.vercel.app/api/movibd?apikey=${KEY}&search=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (data.status !== 200 || !data.data?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }
    
    const movieList = data.data.map((m, i) => ({
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
      text: `*🔍 𝐌𝐎𝐕𝐈𝐁𝐃 𝐂𝐈𝐍𝐄𝐌𝐀 𝐒𝐄𝐀𝐑𝐂𝐇 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
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

        const dlUrl = `https://vajira-official-apis.vercel.app/api/movibddl?apikey=${KEY}&url=${encodeURIComponent(selected.link)}`;
        const dlRes = await axios.get(dlUrl);
        const movie = dlRes.data.data; 

        if (!movie.downloads || !movie.downloads.length) {
          return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *Rating:* ${movie.rate || "N/A"}\n` +
          `📅 *Released:* ${movie.date || "N/A"}\n` +
          `🌍 *Country:* ${movie.country || "N/A"}\n` +
          `🕐 *Runtime:* ${movie.duration || "N/A"}\n` +
          `🎭 *Genres:* ${movie.genres || "N/A"}\n` +
          `📝 *Description:* ${movie.description ? movie.description.substring(0, 200) + "..." : "N/A"}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝓼:* 📥\n\n`;

        movie.downloads.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* (${d.lang}) — ${d.size}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: movie.poster },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { title: movie.title, downloads: movie.downloads });
      }

      else if (movieMap.has(repliedId)) {
        const { title, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];
        if (!chosen) {
          return conn.sendMessage(from, { text: "*Invalid number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        const size = chosen.size.toLowerCase();
        const sizeGB = size.includes("gb") ? parseFloat(size) : parseFloat(size) / 1024;

        if (sizeGB > 2) { 
          return conn.sendMessage(from, { text: `⚠️ *Large File* (${chosen.size})` }, { quoted: msg });
        }

        await conn.sendMessage(from, {
          document: { url: chosen.final_download_url },
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
  pattern: "moviect",
  alias: ["mct"],
  desc: "🎥 Search movies from Moviect",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .moviect <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `moviect_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://vajira-official-apis.vercel.app/api/moviect?apikey=${KEY}&search=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (data.status !== 200 || !data.data?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }
    
    const movieList = data.data.map((m, i) => ({
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
      text: `*🔍 𝐌𝐎𝐕𝐈𝐄𝐂𝐓 𝐂𝐈𝐍𝐄𝐌𝐀 𝐒𝐄𝐀𝐑𝐂𝐇 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
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

        const dlUrl = `https://vajira-official-apis.vercel.app/api/moviectdl?apikey=${KEY}&url=${encodeURIComponent(selected.link)}`;
        const dlRes = await axios.get(dlUrl);
        const movie = dlRes.data.data; 

        if (!movie.links || !movie.links.length) {
          return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *Rating Count:* ${movie.ratingCount || "N/A"}\n` +
          `🎭 *Genres:* ${movie.genres || "N/A"}\n` +
          `📝 *Description:* ${movie.description ? movie.description.substring(0, 200) + "..." : "N/A"}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        movie.links.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.country || ""}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: movie.poster },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { title: movie.title, downloads: movie.links });
      }

      else if (movieMap.has(repliedId)) {
        const { title, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];
        if (!chosen) {
          return conn.sendMessage(from, { text: "*Invalid number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        await conn.sendMessage(from, {
          document: { url: chosen.url },
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
      const url = `https://vajira-official-apis.vercel.app/api/notuns?apikey=${KEY}&text=${encodeURIComponent(q)}`;
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

      const movieUrl = `https://vajira-official-apis.vercel.app/api/notundl?apikey=${KEY}&url=${encodeURIComponent(selected.link)}`;
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
      const url = `https://vajira-official-apis.vercel.app/api/movielovers?apikey=${KEY}&text=${encodeURIComponent(q)}`;
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

      const movieUrl = `https://vajira-official-apis.vercel.app/api/movieloverdl?apikey=${KEY}&url=${encodeURIComponent(selected.link)}`;
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
  pattern: "moviedrivebd",
  alias: ["moviedrive", "mdbd"],
  desc: "🎥 Search movies from MovieDriveBD",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .moviedrivebd <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `moviedrivebd_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      // Search API
      const url = `https://vajira-official-apis.vercel.app/api/moviebdsearch?apikey=${KEY}&q=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (data.status !== 200 || !data.result?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }
    
    const movieList = data.result.map((m, i) => ({
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
      text: `*🔍 𝐌𝐎𝐕𝐈𝐄𝐃𝐑𝐈𝐕𝐄 𝐂𝐈𝐍𝐄𝐌𝐀 𝐒𝐄𝐀𝐑𝐂𝐇 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
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

        const dlUrl = `https://vajira-official-apis.vercel.app/api/moviebddl?apikey=${KEY}&url=${encodeURIComponent(selected.link)}`;
        const dlRes = await axios.get(dlUrl);
        const movie = dlRes.data.result; 

        if (!movie || !movie.downloads || !movie.downloads.length) {
          return conn.sendMessage(from, { text: "*No download links available for this movie.*" }, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *IMDb:* ${movie.imdbrate}\n` +
          `📅 *Released:* ${movie.date}\n` +
          `🌍 *Country:* ${movie.country}\n` +
          `🕐 *Runtime:* ${movie.duration}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        movie.downloads.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.type}\n`;
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
          return conn.sendMessage(from, { text: "*Invalid number selected.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        await conn.sendMessage(from, {
          document: { url: chosen.download_url },
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
  pattern: "okjatt",
  alias: ["okj"],
  desc: "🎥 Search movies from OkJatt",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .okjatt <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `okjatt_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://okjact-mv.vercel.app/api/search?q=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.results || !data.results.length) {
        return await conn.sendMessage(from, { text: "❌ No results found for your query." }, { quoted: mek });
      }

      movieCache.set(cacheKey, data);
    }

    const movieList = data.results.map((m, i) => ({
      number: i + 1,
      title: m.title,
      link: m.link,
      img: m.img
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with movie number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐎𝐊𝐉𝐀𝐓𝐓 𝐌𝐎𝐕𝐈𝐄 𝐒𝐄𝐀𝐑𝐂𝐇 🎥*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝑇-𝚇𝙼𝙳`
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Session Closed*" }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) {
          return conn.sendMessage(from, { text: "*Invalid movie number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        const movieUrl = `https://okjact-mv.vercel.app/api/info?url=${encodeURIComponent(selected.link)}`;
        const movieRes = await axios.get(movieUrl);
        const movie = movieRes.data;
        
        let downloads = [];
        if (Array.isArray(movie.downloadLink)) {
            downloads = movie.downloadLink;
        } else if (movie.downloadLink) {
            downloads = [{
                quality: movie.quality || "HD",
                size: movie.size || "N/A",
                link: movie.downloadLink
            }];
        }

        if (downloads.length === 0) {
          return conn.sendMessage(from, { text: "*No download links available.*"}, { quoted: msg });
        }

        let info = 
            `🎬 *${movie.title}*\n\n` +
            `📅 *Released:* ${movie.releaseDate || 'N/A'}\n` +
            `🌍 *Country:* ${movie.languages || 'N/A'}\n` +
            `🕐 *Runtime:* ${movie.duration || 'N/A'}\n` +
            `🎭 *Category:* ${movie.genres || 'N/A'}\n\n` +
            `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;
        
        downloads.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";
          
        const downloadMsg = await conn.sendMessage(from, {
            image: { url: selected.img },
            caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { title: movie.title, downloads: downloads });
      }

      else if (movieMap.has(repliedId)) {
        const { title, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];
        if (!chosen) {
          return conn.sendMessage(from, { text: "*Invalid quality number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        const apiUrl = `https://okjact-mv.vercel.app/api/download?url=${encodeURIComponent(chosen.link)}`;
        const apiRes = await axios.get(apiUrl);
        const direct = apiRes.data.downloadLink;

        if (!direct) {
            return conn.sendMessage(from, { text: "*Download link not found.*" }, { quoted: msg });
        }
        
        await conn.sendMessage(from, {
          document: { url: direct },
          mimetype: "video/mp4",
          fileName: `${title} - ${chosen.quality}.mp4`,
          caption: `🎬 *${title}*\n🎥 *${chosen.quality}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝑇-𝚇𝙼𝙳`
        }, { quoted: msg });
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    console.error(err);
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek }); 
  }
});

cmd({
  pattern: "thenkiri",
  alias: ["thenk"],
  desc: "🎥 Search movies from Thenkiri",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .thenkiri <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `thenkiri_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      
      const url = `https://thenkiri-api.vercel.app/api/search?q=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.results || !data.results.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }

    const movieList = data.results.map((m, i) => ({
      number: i + 1,
      title: m.title,
      link: m.url
    }));

    let textList = "🔢 𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟\n━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((m) => {
      textList += `🔸 *${m.number}. ${m.title}*\n`;
    });
    textList += "\n💬 *Reply with movie number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐓𝐇𝐄𝐍𝐊𝐈𝐑𝐈 𝐌𝐎𝐕𝐈𝐄 𝐒𝐄𝐀𝐑𝐂𝐇 🎥*\n\n${textList}\n\n> > Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
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

        const movieUrl = `https://thenkiri-api.vercel.app/api/info?url=${encodeURIComponent(selected.link)}`;
        const movieRes = await axios.get(movieUrl);
        const movie = movieRes.data;

        if (!movie.download_links?.length) {
          return conn.sendMessage(from, { text: "*No download links available.*"}, { quoted: msg });
        }

        let info =
          `🎬 *${selected.title}*\n\n` +
          `📝 *Description:* ${movie.description ? movie.description.slice(0, 200) + '...' : 'N/A'}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        movie.download_links.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.text}* — ${d.size}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: movie.image },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { selected, downloads: movie.download_links });
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
        
        const apiUrl = `https://thenkiri-api.vercel.app/api/download?url=${encodeURIComponent(chosen.url)}`;
        const apiRes = await axios.get(apiUrl);
        const direct = apiRes.data.final_url;

        if (!direct) {
            return conn.sendMessage(from, { text: "*download link not found.*" }, { quoted: msg });
        }
        
        await conn.sendMessage(from, {
          document: { url: direct },
          mimetype: "video/mp4",
          fileName: `${selected.title}.mp4`,
          caption: `🎬 *${selected.title}*\n🎥 *Size:* ${chosen.size}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
        }, { quoted: msg });
        
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek }); 
  }
});

cmd({
  pattern: "moviesublk",
  alias: ["moviesub"],
  desc: "🎥 Search Sinhala subbed movies from MoviesSub.lk",
  category: "media",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "Use: .moviesublk <movie name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `moviesublk_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      // නව Search API එක
      const url = `https://moviessub-nadeen.vercel.app/api/search?q=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.status || !data.results?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }

    const movieList = data.results.map((m, i) => ({
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
      text: `*🔍 𝐌𝐎𝐕𝐈𝐄𝐒𝐔𝐁𝐋𝐊 𝑪𝑰𝑵𝑬𝑴𝑨 𝑺𝑬𝑨𝑹𝑪𝑯 🎥*\n\n${textList}\n\n> > Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
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

        const movieUrl = `https://moviessub-nadeen.vercel.app/api/info?url=${encodeURIComponent(selected.link)}`;
        const movieRes = await axios.get(movieUrl);
        const movie = movieRes.data;

        if (!movie.downloads?.length) {
          return conn.sendMessage(from, { text: "*No download links available.*"}, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *IMDb:* ${movie.details.imdb}\n` +
          `📅 *Released:* ${movie.details.year}\n` +
          `🎭 *Category:* ${movie.details.genre}\n` +
          `👤 *Director:* ${movie.details.director}\n` +
          `👥 *Cast:* ${movie.details.cast}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        movie.downloads.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.name}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: movie.image },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { selected, downloads: movie.downloads });
      }

      else if (movieMap.has(repliedId)) {
        const { selected, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];
        if (!chosen) {
          return conn.sendMessage(from, { text: "*Invalid quality number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        const apiUrl = `https://dark-knight-xmd-reset-apis.vercel.app/api/gdrive?url=${encodeURIComponent(chosen.link)}`;
        const apiRes = await axios.get(apiUrl);
        const direct = apiRes.data.result.downloadUrl;

        if (!direct) {
            return conn.sendMessage(from, { text: "*Download link not found.*" }, { quoted: msg });
        }
        
        await conn.sendMessage(from, {
          document: { url: direct },
          mimetype: "video/mp4",
          fileName: `${selected.title}.mp4`,
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
      const url = `https://apis.sadas.dev/api/v1/movie/sinhalasub/search?q=${encodeURIComponent(q)}&apiKey=c120328cb33f021754c1ae0b1ecf47c6`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.status || !data.data?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }
    
    const movieList = data.data.map((m, i) => ({
      number: i + 1,
      title: m.Title,
      link: m.Link,
      type: m.Type,
      quality: m.Quality
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
          `🎭 *Quality:* ${selected.quality}\n` +
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

        const infoUrl = `https://movie-apis-omega.vercel.app/movie/baiscope/movie?url=${encodeURIComponent(selected.link)}&apikey=dark-key-2008`;
        const infoRes = await axios.get(infoUrl);
        const movie = infoRes.data.result;
        
        const downloads = (movie.dl_links || []).filter(d => 
          d.direct && (d.direct.includes("drive.baiscopeslk.workers.dev") || d.direct.includes("drive2.baiscopeslk.workers.dev"))
        );

        if (downloads.length === 0) {
          return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
        }
       
        let caption = 
          `🎬 *${movie.title}*\n\n` +
          `⭐ *IMDB:* ${movie.tmdb_rating}\n` +
          `🕐 *Duration:* ${movie.duration}\n` +
          `🌍 *Country:* ${movie.country}\n` +
          `📅 *Release:* ${movie.release_date}\n` +
          `🎭 *Genres:* ${movie.genres?.join(", ")}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        downloads.forEach((d, i) => {
          caption += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
        });

        caption += "\n🔢 *Reply with number to download.*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳";

        const infoMsg = await conn.sendMessage(from, {
          image: { url: movie.images?.[0] },
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
        const link = chosen.direct;

        if (sizeGB > 2) {
          return conn.sendMessage(from, {
            text: `⚠️ *File too large (${chosen.size})*`
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
    await conn.sendMessage(from, { text: `❌ *Error:* ${err.message}` }, { quoted: mek });
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
        
        const chosenlink = chosen.link.replace(/bot\d+/, 'bot3');
        
        const apiUrl = `https://cine-download-api.vercel.app/api/download?url=${encodeURIComponent(chosenlink)}`;
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
        
        const apiUrl = `https://dark-knight-xmd-reset-apis.vercel.app/api/gdrive?url=${encodeURIComponent(chosen.dllink)}`;
        const apiRes = await axios.get(apiUrl);
        const direct = apiRes.data.result.downloadUrl;

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
