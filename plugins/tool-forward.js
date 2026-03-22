
const { cmd } = require("../command");

// Safety Configuration
const SAFETY = {
  MAX_JIDS: 50, 
  BASE_DELAY: 2000, 
  EXTRA_DELAY: 4000,
};

cmd({
  pattern: "forward",
  alias: ["fwd"],
  desc: "Forward large files (up to 2GB) to groups or inbox with live progress (5 msg updates)",
  category: "owner",
  filename: __filename
}, async (client, message, match, { isOwner }) => {
  try {
    if (!isOwner) return await message.reply("*📛 Owner Only Command*");
    if (!message.quoted) return await message.reply("*🍁 Please reply to a message or file to forward*");

    let jidInput = "";
    if (typeof match === "string") jidInput = match.trim();
    else if (Array.isArray(match)) jidInput = match.join(" ").trim();
    else if (match && typeof match === "object") jidInput = match.text || "";
    
    if (!jidInput) return await message.reply("❌ *Please provide target JIDs or Numbers!*");

    const rawJids = jidInput.split(/[\s,]+/).filter(jid => jid.trim().length > 0);
    
    const validJids = rawJids
      .map(jid => {
        let clean = jid.trim();
        if (clean.endsWith('@g.us') || clean.endsWith('@s.whatsapp.net')) return clean;
        let numbersOnly = clean.replace(/[^0-9]/g, '');
        if (numbersOnly.length > 15) return `${numbersOnly}@g.us`;
        if (numbersOnly.length >= 9) return `${numbersOnly}@s.whatsapp.net`;
        return null;
      })
      .filter(jid => jid !== null)
      .slice(0, SAFETY.MAX_JIDS);

    if (validJids.length === 0) return await message.reply("❌ *Invalid JID format!*");

    // ආරම්භක පණිවිඩය
    let statusMsg = await message.reply(`🚀 *Forwarding started to ${validJids.length} chats...*`);

    let successCount = 0;
    let failedCount = 0;
    
    for (const [index, jid] of validJids.entries()) {
      try {
        // 2GB Support Native Forwarding
        await client.sendMessage(jid, { forward: msgToForward }, { quoted: null });
        successCount++;
        
        if ((index + 1) % 5 === 0 || (index + 1) === validJids.length) {
          await client.sendMessage(message.chat, { 
            text: `🔄 *Forwarding Progress:*\n\n✅ Sent: ${index + 1}/${validJids.length} Chats`, 
            edit: statusMsg.key 
          });
        }
        
        const delayTime = (index + 1) % 10 === 0 ? SAFETY.EXTRA_DELAY : SAFETY.BASE_DELAY;
        await new Promise(resolve => setTimeout(resolve, delayTime));
        
      } catch (error) {
        failedCount++;
        console.error(`Forward failed for ${jid}:`, error);
      }
    }

    let finalReport = 
      `✅ *Forward Process Completed!*\n\n` +
      `📤 *Success:* ${successCount}\n` +
      `❌ *Failed:* ${failedCount}\n`;

    await client.sendMessage(message.chat, { text: finalReport, edit: statusMsg.key });

  } catch (error) {
    console.error("Forward Error:", error);
    await message.reply(`💢 Error: ${error.message}`);
  }
});

cmd({
  pattern: "forward2",
  alias: ["fwd2"],
  desc: "Bulk forward media to groups",
  category: "owner",
  filename: __filename
}, async (client, message, match, { isOwner }) => {
  try {
    // Owner check
    if (!isOwner) return await message.reply("*📛 Owner Only Command*");
    
    // Quoted message check
    if (!message.quoted) return await message.reply("*🍁 Please reply to a message*");

    // ===== [BULLETPROOF JID PROCESSING] ===== //
    let jidInput = "";
    
    // Handle all possible match formats
    if (typeof match === "string") {
      jidInput = match.trim();
    } else if (Array.isArray(match)) {
      jidInput = match.join(" ").trim();
    } else if (match && typeof match === "object") {
      jidInput = match.text || "";
    }
    
    // Extract JIDs (supports comma or space separated)
    const rawJids = jidInput.split(/[\s,]+/).filter(jid => jid.trim().length > 0);
    
    // Process JIDs (accepts with or without @g.us)
    const validJids = rawJids
      .map(jid => {
        // Remove existing @g.us if present
        const cleanJid = jid.replace(/@g\.us$/i, "");
        // Only keep if it's all numbers
        return /^\d+$/.test(cleanJid) ? `${cleanJid}@g.us` : null;
      })
      .filter(jid => jid !== null)
      .slice(0, SAFETY.MAX_JIDS);

    if (validJids.length === 0) {
      return await message.reply(
        "❌ No valid group JIDs found\n" +
        "Examples:\n" +
        ".fwd 120363411055156472@g.us,120363333939099948@g.us\n" +
        ".fwd 120363411055156472 120363333939099948"
      );
    }

    // ===== [ENHANCED MEDIA HANDLING - ALL TYPES] ===== //
    let messageContent = {};
    const mtype = message.quoted.mtype;
    
    // For media messages (image, video, audio, sticker, document)
    if (["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"].includes(mtype)) {
      const buffer = await message.quoted.download();
      
      switch (mtype) {
        case "imageMessage":
          messageContent = {
            image: buffer,
            caption: message.quoted.text || '',
            mimetype: message.quoted.mimetype || "image/jpeg"
          };
          break;
        case "videoMessage":
          messageContent = {
            video: buffer,
            caption: message.quoted.text || '',
            mimetype: message.quoted.mimetype || "video/mp4"
          };
          break;
        case "audioMessage":
          messageContent = {
            audio: buffer,
            mimetype: message.quoted.mimetype || "audio/mp4",
            ptt: message.quoted.ptt || false
          };
          break;
        case "stickerMessage":
          messageContent = {
            sticker: buffer,
            mimetype: message.quoted.mimetype || "image/webp"
          };
          break;
        case "documentMessage":
          messageContent = {
            document: buffer,
            mimetype: message.quoted.mimetype || "application/octet-stream",
            fileName: message.quoted.fileName || "document"
          };
          break;
      }
    } 
    // For text messages
    else if (mtype === "extendedTextMessage" || mtype === "conversation") {
      messageContent = {
        text: message.quoted.text
      };
    } 
    // For other message types (forwarding as-is)
    else {
      try {
        // Try to forward the message directly
        messageContent = message.quoted;
      } catch (e) {
        return await message.reply("❌ Unsupported message type");
      }
    }

    // ===== [OPTIMIZED SENDING WITH PROGRESS] ===== //
    let successCount = 0;
    const failedJids = [];
    
    for (const [index, jid] of validJids.entries()) {
      try {
        await client.sendMessage(jid, messageContent);
        successCount++;
        
        // Progress update (every 10 groups instead of 5)
        if ((index + 1) % 10 === 0) {
          await message.reply(`🔄 Sent to ${index + 1}/${validJids.length} groups...`);
        }
        
        // Apply reduced delay
        const delayTime = (index + 1) % 10 === 0 ? SAFETY.EXTRA_DELAY : SAFETY.BASE_DELAY;
        await new Promise(resolve => setTimeout(resolve, delayTime));
        
      } catch (error) {
        failedJids.push(jid.replace('@g.us', ''));
        await new Promise(resolve => setTimeout(resolve, SAFETY.BASE_DELAY));
      }
    }

    // ===== [COMPREHENSIVE REPORT] ===== //
    let report = `✅ *Forward Complete*\n\n` +
                 `📤 Success: ${successCount}/${validJids.length}\n` +
                 `📦 Content Type: ${mtype.replace('Message', '') || 'text'}\n`;
    
    if (failedJids.length > 0) {
      report += `\n❌ Failed (${failedJids.length}): ${failedJids.slice(0, 5).join(', ')}`;
      if (failedJids.length > 5) report += ` +${failedJids.length - 5} more`;
    }
    
    if (rawJids.length > SAFETY.MAX_JIDS) {
      report += `\n⚠️ Note: Limited to first ${SAFETY.MAX_JIDS} JIDs`;
    }

    await message.reply(report);

  } catch (error) {
    console.error("Forward Error:", error);
    await message.reply(
      `💢 Error: ${error.message.substring(0, 100)}\n\n` +
      `Please try again or check:\n` +
      `1. JID formatting\n` +
      `2. Media type support\n` +
      `3. Bot permissions`
    );
  }
});
