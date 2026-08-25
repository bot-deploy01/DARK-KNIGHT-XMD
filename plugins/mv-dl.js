const { cmd } = require("../command");
const axios = require("axios");
const config = require('../config');
const NodeCache = require("node-cache");

const movieCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
const KEY = "vajira-VajiraOfficial2003";

cmd({
  pattern: "sinhalasubtv",
  desc: "🎥 Search Sinhala subbed TV shows from Sinhalasub",
  category: "media",
  react: "📺",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "*Use:* .sinhalasubtv <tvshow name>"
    }, { quoted: mek });
  }

  try {
    const apiKey = "charukalk_dab24168ab9b4e7daefa13b59b2447cc";
    const cacheKey = `cinesubz_${q.toLowerCase()}`;
    let data = typeof movieCache !== 'undefined' ? movieCache.get(cacheKey) : null;

    if (!data) {
      const url = `https://darkyasiya-new-movie-api.vercel.app/api/movie/sinhalasub/search?q=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.status && !data.success) {
        return await conn.sendMessage(from, { 
          text: "*No TV Shows found for your query.*" 
        }, { quoted: mek });
      }

      // ළඟම එන API format දෙකටම ගැලපෙන ලෙස array එක ලබා ගැනීම
      const tvshows = data.data?.tvshows || data.result || (Array.isArray(data.data) ? data.data : []);
      if (!tvshows.length) {
        return await conn.sendMessage(from, { 
          text: "*No TV Shows found for your query.*" 
        }, { quoted: mek });
      }

      data.tvshows = tvshows;
      if (typeof movieCache !== 'undefined') movieCache.set(cacheKey, data);
    }

    const movieList = data.tvshows.map((item, index) => ({
      number: index + 1,
      title: item.title,
      link: item.link || item.url
    }));

    let textList = "🔢 *Reply Below Number*\n━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((item) => {
      textList += `🔸 *${item.number}. ${item.title}*\n`;
    });
    textList += "\n💬 *Reply with TV show number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐒𝐈𝐍𝐇𝐀𝐋𝐀𝐒𝐔𝐁 𝑻𝑽 𝑺𝑬𝑨𝑹𝑪𝑯 📺*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Process Cancelled*" }, { quoted: msg });
      }

      // Step 1: TV Show එක තේරීම
      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) {
          return conn.sendMessage(from, { text: "*Invalid TV show number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        const tvUrl = `https://mizuki-md-api.vercel.app/api/movie/sinhalasub/tvshow?q=${encodeURIComponent(selected.link)}&apiKey=${apiKey}`;
        const tvRes = await axios.get(tvUrl);
        const tvDataRaw = tvRes.data?.data;

        if (!tvRes.data?.status || !tvDataRaw?.episodes?.length) {
          return conn.sendMessage(from, { text: "*No TV Show episodes found.*" }, { quoted: msg });
        }

        let sNum = 1;
        let curEps = [];
        const reversedEpisodes = [...tvDataRaw.episodes].reverse();

        const seasonsMap = reversedEpisodes.reduce((acc, ep) => {
          curEps.push({
            number: ep.epNum,
            title: ep.epTitle,
            url: ep.epUrl,
            date: ep.epDate
          });

          if (ep.epTitle.includes("Last]")) {
            const match = ep.epTitle.match(/\[S(\d+)\s+Last\]/i);
            acc.push({
              season: match ? parseInt(match[1]) : sNum++,
              episodes: [...curEps]
            });
            curEps = [];
          }

          return acc;
        }, []);

        if (curEps.length) {
          seasonsMap.push({
            season: sNum,
            episodes: curEps
          });
        }

        seasonsMap.sort((a, b) => a.season - b.season);

        const tvData = {
          title: tvDataRaw.title || selected.title,
          imdb: "N/A",
          category: tvDataRaw.genres,
          cast: tvDataRaw.stars,
          mainImage: tvDataRaw.poster,
          episodesDetails: seasonsMap
        };

        let castList = "N/A";
        if (tvData.cast && Array.isArray(tvData.cast) && tvData.cast.length > 0) {
          castList = tvData.cast
            .map(c => typeof c === 'object' ? (c.actor?.name || c.actor || "") : c)
            .filter(Boolean)
            .join(", ");
        }

        let tvInfo = 
          `🎬 *Title:* ${tvData.title}\n` +
          `🎭 *Category:* ${tvData.category ? tvData.category.join(", ") : "N/A"}\n` +
          `👥 *Cast:* ${castList}\n\n` +
          `📁 *Seasons:* 🔻\n\n`;

        seasonsMap.forEach((s, index) => {
          tvInfo += `🔷 ${index + 1}. *Season ${s.season}* (${s.episodes.length} Episodes)\n`;
        });
        tvInfo += "\n🔢 *Reply with season number.*";

        const seasonMsg = await conn.sendMessage(from, {
          image: { url: tvData.mainImage },
          caption: tvInfo
        }, { quoted: msg });

        movieMap.set(seasonMsg.key.id, {
          step: "SEASON",
          selected,
          tvData,
          seasons: seasonsMap
        });
      }

      // Step 2 & 3 & 4: Season, Episode සහ Download Quality තේරීම
      else if (movieMap.has(repliedId)) {
        const sessionData = movieMap.get(repliedId);
        const num = parseInt(replyText);

        if (sessionData.step === "SEASON") {
          const chosenSeason = sessionData.seasons[num - 1];
          if (!chosenSeason) {
            return conn.sendMessage(from, { text: "❌ *Invalid season number.*" }, { quoted: msg });
          }

          const { tvData } = sessionData;

          let castList = "N/A";
          if (tvData?.cast && Array.isArray(tvData.cast) && tvData.cast.length > 0) {
            castList = tvData.cast
              .map(c => typeof c === 'object' ? (c.actor?.name || c.actor || "") : c)
              .filter(Boolean)
              .join(", ");
          }

          let epInfo = 
            `📌 *Title:* ${tvData?.title || "N/A"}\n` +
            `🎭 *Category:* ${tvData?.category ? tvData.category.join(", ") : "N/A"}\n` +
            `👥 *Cast:* ${castList}\n\n` +
            `📺 *Season ${chosenSeason.season} Episodes:* 🔻\n\n`;

          chosenSeason.episodes.forEach((ep) => {
            epInfo += `🔹 *${ep.number}. ${ep.title}*\n`;
          });
          epInfo += "\n🔢 *Reply with episode number.*";

          const epMsg = await conn.sendMessage(from, {
            image: tvData?.mainImage ? { url: tvData.mainImage } : undefined,
            caption: epInfo
          }, { quoted: msg });

          movieMap.set(epMsg.key.id, {
            step: "EPISODE",
            selected: sessionData.selected,
            episodes: chosenSeason.episodes
          });
        }

        else if (sessionData.step === "EPISODE") {
          const chosenEp = sessionData.episodes.find(e => parseInt(e.number) === num);
          if (!chosenEp) {
            return conn.sendMessage(from, { text: "*Invalid episode number.*" }, { quoted: msg });
          }

          await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

          const epUrl = `https://mizuki-md-api.vercel.app/api/movie/sinhalasub/episode?q=${encodeURIComponent(chosenEp.url)}&apiKey=${apiKey}`;
          const epRes = await axios.get(epUrl);
          const epDataRaw = epRes.data?.data;

          if (!epRes.data?.status || !epDataRaw?.dl_links) {
            return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
          }

          const downloadsArr = [];
          Object.values(epDataRaw.dl_links).flat().forEach(item => {
            if (item.url && (item.url.includes("cdn.sinhalasub.net") || item.url.includes("ddl.sinhalasub.net"))) {
              downloadsArr.push({
                quality: item.quality,
                size: item.size,
                language: item.option || "Direct Link",
                link: item.url
              });
            }
          });

          if (!downloadsArr.length) {
            return conn.sendMessage(from, { text: "*No valid download links available.*" }, { quoted: msg });
          }

          const epData = {
            maintitle: epDataRaw.serie || sessionData.selected.title,
            title: epDataRaw.title || sessionData.selected.title,
            episodeTitle: epDataRaw.episodeTitle || chosenEp.title,
            downloadUrl: downloadsArr,
            poster: epDataRaw.poster
          };

          let dlInfo = 
            `🎬 *Main Title:* ${epData.maintitle}\n` +
            `📌 *Title:* ${epData.title}\n` +
            `📺 *Episode Title:* ${epData.episodeTitle}\n\n` +
            `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

          epData.downloadUrl.forEach((d, index) => {
            dlInfo += `♦️ ${index + 1}. *${d.quality}* — ${d.size} (${d.language})\n`;
          });
          dlInfo += "\n🔢 *Reply with quality number to download.*";

          const downloadMsg = await conn.sendMessage(from, {
            image: epData.poster ? { url: epData.poster } : undefined,
            caption: dlInfo
          }, { quoted: msg });

          movieMap.set(downloadMsg.key.id, {
            step: "DOWNLOAD",
            selected: { title: `${epData.title}` },
            downloads: epData.downloadUrl
          });
        }

        else if (sessionData.step === "DOWNLOAD") {
          const chosen = sessionData.downloads[num - 1];
          if (!chosen) {
            return conn.sendMessage(from, { text: "*Invalid quality number.*" }, { quoted: msg });
          }

          await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

          const size = chosen.size.toLowerCase();
          const sizeGB = size.includes("gb") ? parseFloat(size) : parseFloat(size) / 1024;

          if (sizeGB > 2) {
            return conn.sendMessage(from, { text: `⚠️ *File is too large (${chosen.size})*` }, { quoted: msg });
          }

          await conn.sendMessage(from, {
            document: { url: chosen.link },
            mimetype: "video/mp4",
            fileName: `${sessionData.selected.title} - ${chosen.quality}.mp4`,
            caption: `🎬 *${sessionData.selected.title}*\n🎥 *Quality:* ${chosen.quality}\n📦 *Size:* ${chosen.size}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
          }, { quoted: msg });
          
          conn.ev.off("messages.upsert", listener);
        }
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek }); 
  }
});

cmd({
  pattern: "cinesubztv",
  desc: "🎥 Search Sinhala subbed TV shows from CineSubz",
  category: "media",
  react: "📺",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return await conn.sendMessage(from, {
      text: "*Use:* .cinesubztv <tvshow name>"
    }, { quoted: mek });
  }

  try {
    const cacheKey = `cinesubz_${q.toLowerCase()}`;
    let data = movieCache.get(cacheKey);

    if (!data) {
      const url = `https://darkyasiya-new-movie-api.vercel.app/api/movie/cinesubz/search?q=${encodeURIComponent(q)}`;
      const res = await axios.get(url);
      data = res.data;

      if (!data.success || !data.data.tvshows?.length) {
        return await conn.sendMessage(from, { 
          text: "*No TV Shows found for your query.*" 
        }, { quoted: mek });
      }

      movieCache.set(cacheKey, data);
    }

    const movieList = data.data.tvshows.map((item, index) => ({
      number: index + 1,
      title: item.title,
      link: item.link
    }));

    let textList = "🔢 *Reply Below Number*\n━━━━━━━━━━━━━━━\n\n";
    movieList.forEach((item) => {
      textList += `🔸 *${item.number}. ${item.title}*\n`;
    });
    textList += "\n💬 *Reply with TV show number to view details.*";

    const sentMsg = await conn.sendMessage(from, {
      text: `*🔍 𝐂𝐈𝐍𝐄𝐒𝐔𝐁𝐙 𝑻𝑽 𝑺𝑬𝑨𝑹𝑪𝑯 📺*\n\n${textList}\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
    }, { quoted: mek });

    const movieMap = new Map();

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const replyText = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", listener);
        return conn.sendMessage(from, { text: "✅ *Process Cancelled*" }, { quoted: msg });
      }

      if (repliedId === sentMsg.key.id) {
        const num = parseInt(replyText);
        const selected = movieList.find(m => m.number === num);
        if (!selected) {
          return conn.sendMessage(from, { text: "❌ *Invalid TV show number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

        const tvUrl = `https://cine-download-api.vercel.app/api/tvshow?url=${encodeURIComponent(selected.link)}`;
        const tvRes = await axios.get(tvUrl);
        const tvData = tvRes.data?.data;

        if (!tvData || !tvData.episodesDetails?.length) {
          return conn.sendMessage(from, { text: "❌ *No TV Show episodes found.*" }, { quoted: msg });
        }

        let castList = "N/A";
        if (tvData.cast && Array.isArray(tvData.cast) && tvData.cast.length > 0) {
          castList = tvData.cast
            .map(c => typeof c === 'object' ? (c.actor?.name || c.actor || "") : c)
            .filter(Boolean).join(", ");
        }

        let tvInfo = 
          `🎬 *Title:* ${tvData.title || "N/A"}\n` +
          `⭐ *IMDb:* ${tvData.imdb || "N/A"}\n` +
          `🎭 *Category:* ${tvData.category ? tvData.category.join(", ") : "N/A"}\n` +
          `👥 *Cast:* ${castList}\n\n` +
          `📁 *Seasons:* 🔻\n\n`;

        tvData.episodesDetails.forEach((s, index) => {
          tvInfo += `🔷 ${index + 1}. *Season ${s.season}* (${s.episodes.length} Episodes)\n`;
        });
        tvInfo += "\n🔢 *Reply with season number.*";

        const seasonMsg = await conn.sendMessage(from, {
          image: { url: tvData.mainImage },
          caption: tvInfo
        }, { quoted: msg });

        movieMap.set(seasonMsg.key.id, { step: "SEASON", selected, tvData, seasons: tvData.episodesDetails 
        });
      }

      else if (movieMap.has(repliedId)) {
        const sessionData = movieMap.get(repliedId);
        const num = parseInt(replyText);

        if (sessionData.step === "SEASON") {
          const chosenSeason = sessionData.seasons[num - 1];
          if (!chosenSeason) {
            return conn.sendMessage(from, { text: "❌ *Invalid season number.*" }, { quoted: msg });
          }

          const { tvData } = sessionData;

          let castList = "N/A";
          if (tvData?.cast && Array.isArray(tvData.cast) && tvData.cast.length > 0) {
            castList = tvData.cast
              .map(c => typeof c === 'object' ? (c.actor?.name || c.actor || "") : c)
              .filter(Boolean).join(", ");
          }

          let epInfo = 
            `📌 *Title:* ${tvData?.title || "N/A"}\n` +
            `⭐ *IMDb:* ${tvData?.imdb || "N/A"}\n` +
            `🎭 *Category:* ${tvData?.category ? tvData.category.join(", ") : "N/A"}\n` +
            `👥 *Cast:* ${castList}\n\n` +
            `📺 *Season ${chosenSeason.season} Episodes:* 🔻\n\n`;

          chosenSeason.episodes.forEach((ep) => {
            epInfo += `🔹 *${ep.number}. ${ep.title}*\n`;
          });
          epInfo += "\n🔢 *Reply with episode number.*";

          const epMsg = await conn.sendMessage(from, {
            image: tvData?.mainImage ? { url: tvData.mainImage } : undefined,
            caption: epInfo
          }, { quoted: msg });

          movieMap.set(epMsg.key.id, { step: "EPISODE", selected: sessionData.selected, episodes: chosenSeason.episodes 
          });
        }

        else if (sessionData.step === "EPISODE") {
          const chosenEp = sessionData.episodes.find(e => parseInt(e.number) === num);
          if (!chosenEp) {
            return conn.sendMessage(from, { text: "❌ *Invalid episode number.*" }, { quoted: msg });
          }

          await conn.sendMessage(from, { react: { text: "🎯", key: msg.key } });

          const epUrl = `https://cine-download-api.vercel.app/api/episode?url=${encodeURIComponent(chosenEp.url)}`;
          const epRes = await axios.get(epUrl);
          const epData = epRes.data?.data;

          if (!epData || !epData.downloadUrl?.length) {
            return conn.sendMessage(from, { text: "❌ *No download links available.*" }, { quoted: msg });
          }

          let dlInfo = 
            `🎬 *Main Title:* ${epData.maintitle || "N/A"}\n` +
            `📌 *Title:* ${epData.title || "N/A"}\n` +
            `📺 *Episode Title:* ${epData.episodeTitle || chosenEp.title}\n` +
            `📅 *Date Created:* ${epData.dateCreate || "N/A"}\n\n` +
            `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

          epData.downloadUrl.forEach((d, index) => {
            dlInfo += `♦️ ${index + 1}. *${d.quality}* — ${d.size} (${d.language || "N/A"})\n`;
          });
          dlInfo += "\n🔢 *Reply with quality number to download.*";

          const imageUrl = epData.imageUrls && epData.imageUrls.length > 0 ? epData.imageUrls[0] : undefined;

          const downloadMsg = await conn.sendMessage(from, {
            image: imageUrl ? { url: imageUrl } : undefined,
            caption: dlInfo
          }, { quoted: msg });

          movieMap.set(downloadMsg.key.id, { step: "DOWNLOAD", selected: { title: `${epData.title || sessionData.selected.title}` }, downloads: epData.downloadUrl 
          });
        }

        else if (sessionData.step === "DOWNLOAD") {
          const { selected, downloads } = sessionData;
          const chosen = downloads[num - 1];
          if (!chosen) {
            return conn.sendMessage(from, { text: "*Invalid quality number.*" }, { quoted: msg });
          }

          await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

          const size = chosen.size.toLowerCase();
          const sizeGB = size.includes("gb") ? parseFloat(size) : parseFloat(size) / 1024;

          if (sizeGB > 2) {
            return conn.sendMessage(from, { text: `⚠️ *File is too large (${chosen.size}). WhatsApp limit is 2GB.*` }, { quoted: msg });
          }

          const chosenlink = chosen.link.replace(/bot\d+/, 'bot3');

          const apiUrl = `https://cine-download-api.vercel.app/api/download?url=${encodeURIComponent(chosenlink)}`;
          const apiRes = await axios.get(apiUrl);
          const downloadLinks = apiRes.data?.data?.downloadUrls;

          let finalDownloadLink = downloadLinks?.find(link => 
            link.url.includes("pixeldrain.com") && 
            !link.url.includes("t.me") && !link.url.includes("telegram"))?.url;

          if (!finalDownloadLink) {
            const backupLink = downloadLinks?.find(link => 
              !link.url.includes("t.me") && 
              !link.url.includes("telegram") && link.url.startsWith("http")
            );
            finalDownloadLink = backupLink?.url;
          }

          if (!finalDownloadLink) {
            return conn.sendMessage(from, { text: "*Download link not found or expired.*" }, { quoted: msg });
          }

          await conn.sendMessage(from, {
            document: { url: finalDownloadLink },
            mimetype: "video/mp4",
            fileName: `${selected.title} - ${chosen.quality}.mp4`,
            caption: `🎬 *${selected.title}*\n🎥 *${chosen.quality}*\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`
          }, { quoted: msg });
        }
      }
    };

    conn.ev.on("messages.upsert", listener);

  } catch (err) {
    await conn.sendMessage(from, { text: `⚠️ *Error:* ${err.message}` }, { quoted: mek }); 
  }
});

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

    let textList = "🔢 *𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟*\n━━━━━━━━━━━━━━━━━\n\n";
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

        const mizukiRes = await axios.get(`https://mizuki-md-api.vercel.app/api/movie/sinhalasub/movie?q=${encodeURIComponent(selected.link)}&apiKey=charukalk_dab24168ab9b4e7daefa13b59b2447cc`);
        const movie = mizukiRes.data?.data;

        const downloadList = Object.values(movie.downloads || {})
          .flatMap(list => list)
          .filter(d => d?.finalLink && (d.finalLink.includes("pixeldrain.com") || d.finalLink.includes("ddl.sinhalasub.net")))
          .map(d => ({ quality: d.quality, size: d.size, link: d.finalLink }));

        if (!downloadList.length) {
          return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *IMDb:* ${movie.imdb}\n` +
          `📅 *Released:* ${movie.releaseDate}\n` +
          `🕐 *Runtime:* ${movie.duration}\n` +
          `🎭 *Category:* ${movie.genres?.join(", ")}\n` +
          `✍️ *Type:* ${selected.type}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        downloadList.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
        });

        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: movie.poster },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { title: movie.title, downloads: downloadList });
      }
       
      else if (movieMap.has(repliedId)) {
        const { title, downloads } = movieMap.get(repliedId);
        const num = parseInt(replyText);
        const chosen = downloads[num - 1];

        if (!chosen) {
          return conn.sendMessage(from, { text: "* Invalid number.*" }, { quoted: msg });
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        let directLink = chosen.link;

        if (directLink.includes("pixeldrain.com")) {
          const match = directLink.match(/\/([A-Za-z0-9]+)$/);
          if (match) directLink = `https://pixeldrain.com/api/file/${match[1]}`;
        }
        
        const sizeText = chosen.size.toLowerCase();
        const sizeGB = sizeText.includes("gb") ? parseFloat(sizeText) : parseFloat(sizeText) / 1024;

        if (sizeGB > 2) {
          return conn.sendMessage(from, { text: `⚠️ *File is too large (${chosen.size})` }, { quoted: msg });
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

        if (!chosen) return conn.sendMessage(from, { text: "Invalid download number." }, { quoted: msg });

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        const size = chosen.size.toLowerCase();
        const sizeGB = size.includes("gb") ? parseFloat(size) : parseFloat(size) / 1024;
        const link = chosen.direct;

        if (sizeGB > 2) {
          return conn.sendMessage(from, { text: `⚠️ *File too large (${chosen.size})*` }, { quoted: msg });
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
    await conn.sendMessage(from, { text: `*Error:* ${err.message}` }, { quoted: mek });
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

      if (!data.success || !data.data.movies?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }

    const movieList = data.data.movies.map((m, i) => ({
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
            link.url.includes("pixeldrain.com") && 
            !link.url.includes("t.me") && !link.url.includes("telegram"))?.url;

          if (!finalDownloadLink) {
            const backupLink = downloadLinks?.find(link => 
              !link.url.includes("t.me") && 
              !link.url.includes("telegram") && link.url.startsWith("http")
            );
            finalDownloadLink = backupLink?.url;
          }

          if (!finalDownloadLink) {
            return conn.sendMessage(from, { text: "*Download link not found or expired.*" }, { quoted: msg });
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

      if (!data.success || !data.data.movies?.length) {
        throw new Error("No results found for your query.");
      }

      movieCache.set(cacheKey, data);
    }
    
    const movieList = data.data.movies.map((m, i) => ({
      number: i + 1,
      title: m.title,
      link: m.link
    }));

    let textList = "🔢 *𝑅𝑒𝑝𝑙𝑦 𝐵𝑒𝑙𝑜𝑤 𝑁𝑢𝑚𝑏𝑒𝑟*\n━━━━━━━━━━━━━━━━━\n\n";
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

        const mizukiRes = await axios.get(`https://mizuki-md-api.vercel.app/api/movie/sinhalasub/movie?q=${encodeURIComponent(selected.link)}&apiKey=charukalk_dab24168ab9b4e7daefa13b59b2447cc`);
        const movie = mizukiRes.data?.data;

        const downloadList = Object.values(movie.downloads || {})
          .flatMap(list => list)
          .filter(d => d?.finalLink && (d.finalLink.includes("pixeldrain.com") || d.finalLink.includes("ddl.sinhalasub.net")))
          .map(d => ({ quality: d.quality, size: d.size, link: d.finalLink }));

        if (!downloadList.length) {
          return conn.sendMessage(from, { text: "*No download links available.*" }, { quoted: msg });
        }

        let info =
          `🎬 *${movie.title}*\n\n` +
          `⭐ *IMDb:* ${movie.imdb}\n` +
          `📅 *Released:* ${movie.releaseDate}\n` +
          `🌍 *Country:* ${movie.country}\n` +
          `🕐 *Runtime:* ${movie.duration}\n` +
          `🎭 *Category:* ${movie.genres?.join(", ")}\n` +
          `🕵️ *Director:* ${movie.director}\n` +
          `👷‍♂️ *Cast:* ${movie.cast?.slice(0, 10).join(", ")}\n\n` +
          `🎥 *𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑳𝒊𝒏𝒌𝒔:* 📥\n\n`;

        downloadList.forEach((d, i) => {
          info += `♦️ ${i + 1}. *${d.quality}* — ${d.size}\n`;
        });
        info += "\n🔢 *Reply with number to download.*";

        const downloadMsg = await conn.sendMessage(from, {
          image: { url: movie.poster },
          caption: info
        }, { quoted: msg });

        movieMap.set(downloadMsg.key.id, { title: movie.title, downloads: downloadList });
      }

      else if (movieMap.has(repliedId)) {
        const { title, downloads } = movieMap.get(repliedId);
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
          return conn.sendMessage(from, { text: `⚠️ *File is too large* (${chosen.size})` }, { quoted: msg });
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
        
        const apiUrl = `https://dark-knight-reset-apis.vercel.app/api/gdrive?url=${encodeURIComponent(chosen.dllink)}`;
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
