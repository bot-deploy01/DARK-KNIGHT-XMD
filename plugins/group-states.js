const { cmd } = require('../command');
/*const { downloadMediaMessage } = require('./lib');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const os = require('os');

cmd({
  pattern: "togroupstatus",
  alias: ["groupstatus", "statusgroup", "togcstatus"],
  react: "📢",
  category: "group",
  description: "Send text or quoted media to group status. Owner only.",
  },
async (conn, mek, m, { from, isGroup, isOwner, q, reply }) => {

    // 1. Group සහ Owner පරීක්ෂා කිරීම
    if (!isGroup) return reply("❌ Group only command!")
    if (!isOwner) return reply("❌ Owner Only Command!")

    const quoted = m.quoted ? m.quoted : mek.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const hasQuoted = !!quoted

    // 2. භාවිතය පිළිබඳ උපදෙස්
    if (!q && !hasQuoted) {
      return reply(
        `📌 *Usage:*\n` +
        `• .groupstatus <text>\n` +
        `• Reply to image/video/audio with .groupstatus <caption>\n` +
        `• Or just .groupstatus to forward quoted media`
      )
    }

    // 3. Text Status සඳහා Random Colors සහ Fonts
    const colors = ['#128C7E', '#075E54', '#34B7F1', '#25D366', '#FF2E63', '#607D8B', '#000000', '#7E57C2', '#FF9800', '#F44336']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    const randomFont = Math.floor(Math.random() * 5) + 1

    // Helper: Video conversion (ffmpeg)
    const formatVideo = (buffer) => new Promise((resolve, reject) => {
      const tmpIn = path.join(os.tmpdir(), `vin_${Date.now()}.mp4`)
      const tmpOut = path.join(os.tmpdir(), `vout_${Date.now()}.mp4`)
      fs.writeFileSync(tmpIn, buffer)
      ffmpeg(tmpIn)
        .outputOptions(['-c:v libx264', '-c:a aac', '-movflags +faststart', '-pix_fmt yuv420p'])
        .save(tmpOut)
        .on('end', () => { 
            const data = fs.readFileSync(tmpOut)
            fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut)
            resolve(data) 
        })
        .on('error', reject)
    })

    // Helper: Audio conversion (ffmpeg)
    const formatAudio = (buffer) => new Promise((resolve, reject) => {
      const tmpIn = path.join(os.tmpdir(), `ain_${Date.now()}.ogg`)
      const tmpOut = path.join(os.tmpdir(), `aout_${Date.now()}.mp4`)
      fs.writeFileSync(tmpIn, buffer)
      ffmpeg(tmpIn)
        .outputOptions(['-c:a aac', '-vn'])
        .save(tmpOut)
        .on('end', () => { 
            const data = fs.readFileSync(tmpOut)
            fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut)
            resolve(data) 
        })
        .on('error', reject)
    })

    try {
      let statusPayload = {}

      if (hasQuoted) {
        const quotedMsg = { message: quoted }
        const mime = (m.quoted?.msg || m.quoted)?.mimetype || ''

        // 🖼️ රූප සටහන් (Images)
        if (/image/.test(mime)) {
          const buffer = await downloadMediaMessage(quotedMsg, "buffer", {})
          statusPayload = { image: buffer, caption: q || m.quoted.text || "" }

        // 🎥 වීඩියෝ (Videos)
        } else if (/video/.test(mime)) {
          let buffer = await downloadMediaMessage(quotedMsg, "buffer", {})
          buffer = await formatVideo(buffer)
          statusPayload = { video: buffer, mimetype: "video/mp4", caption: q || m.quoted.text || "" }

        // 🎵 ශ්‍රව්‍ය (Audio/Voice)
        } else if (/audio/.test(mime)) {
          let buffer = await downloadMediaMessage(quotedMsg, "buffer", {})
          buffer = await formatAudio(buffer)
          statusPayload = { audio: buffer, mimetype: "audio/mp4" }

        // ✍️ Quoted Text
        } else if (m.quoted.text || m.quoted.conversation) {
          statusPayload = {
            text: q || m.quoted.text || m.quoted.conversation,
            backgroundColor: randomColor,
            font: randomFont
          }
        } else {
          return reply("❌ Unsupported media type for status.")
        }
      } else {
        // ✍️ Direct Text
        statusPayload = {
            text: q,
            backgroundColor: randomColor,
            font: randomFont
        }
      }

      // 4. Status Broadcast වෙත පණිවිඩය යැවීම
      await conn.sendMessage('status@broadcast', statusPayload, {
        statusJidList: [from]
      })

      // 5. අවසන් ප්‍රතිචාරය
      await m.react("✅")
      return reply("✅ Status uploaded successfully!")

    } catch (error) {
      console.error("togroupstatus error:", error)
      await m.react("❌")
      return reply(`❌ Error: ${error.message}`)
    }
  }
})*/


cmd({
    pattern: "groupstates",
    alias: ["gstates"],
    desc: "Safe group analytics",
    category: "group",
    react: "📊",
    filename: __filename
}, async (conn, mek, m, { groupMetadata, reply }) => {
    try {
        if (!m.isGroup) return reply("❌ Group only command");
        if (!groupMetadata || !groupMetadata.participants)
            return reply("⚠️ Could not fetch group metadata. Try again later.");

        const members = groupMetadata.participants;
        const stats = {
            total: members.length,
            admins: members.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length,
        };
        stats.users = stats.total - stats.admins;

        const activeMembers = members.filter(
            p => p.lastSeen && (Date.now() - p.lastSeen) < 7 * 86400 * 1000
        ).length || 0;

        const analysis = [
            `👥 *Total Members:* ${stats.total}`,
            `👑 *Admins:* ${stats.admins}`,
            `👤 *Regular Users:* ${stats.users}`,
            `💬 *Recently Active:* ${activeMembers}`
        ];

        await reply(`📊 *Group States*\n\n${analysis.join('\n')}`);

    } catch (error) {
        console.error('GroupStats Error:', error);
        reply("❌ Error generating stats. Try again later.");
    }
});
