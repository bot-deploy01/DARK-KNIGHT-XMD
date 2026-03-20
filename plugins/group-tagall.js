const config = require('../config')
const { cmd } = require('../command')

// Function to check admin status with LID support (kept for future use if needed)
async function checkAdminStatus(conn, chatId, senderId) {
    try {
        const metadata = await conn.groupMetadata(chatId);
        const participants = metadata.participants || [];
        
        const botId = conn.user?.id || '';
        const botLid = conn.user?.lid || '';
        
        // Extract bot information
        const botNumber = botId.includes(':') ? botId.split(':')[0] : (botId.includes('@') ? botId.split('@')[0] : botId);
        const botIdWithoutSuffix = botId.includes('@') ? botId.split('@')[0] : botId;
        const botLidNumeric = botLid.includes(':') ? botLid.split(':')[0] : (botLid.includes('@') ? botLid.split('@')[0] : botLid);
        const botLidWithoutSuffix = botLid.includes('@') ? botLid.split('@')[0] : botLid;
        
        // Extract sender information
        const senderNumber = senderId.includes(':') ? senderId.split(':')[0] : (senderId.includes('@') ? senderId.split('@')[0] : senderId);
        const senderIdWithoutSuffix = senderId.includes('@') ? senderId.split('@')[0] : senderId;
        
        let isBotAdmin = false;
        let isSenderAdmin = false;
        
        for (let p of participants) {
            if (p.admin === "admin" || p.admin === "superadmin") {
                // Check participant IDs
                const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
                const pId = p.id ? p.id.split('@')[0] : '';
                const pLid = p.lid ? p.lid.split('@')[0] : '';
                const pFullId = p.id || '';
                const pFullLid = p.lid || '';
                
                // Extract numeric part from participant LID
                const pLidNumeric = pLid.includes(':') ? pLid.split(':')[0] : pLid;
                
                // Check if this participant is the bot
                const botMatches = (
                    botId === pFullId ||
                    botId === pFullLid ||
                    botLid === pFullLid ||
                    botLidNumeric === pLidNumeric ||
                    botLidWithoutSuffix === pLid ||
                    botNumber === pPhoneNumber ||
                    botNumber === pId ||
                    botIdWithoutSuffix === pPhoneNumber ||
                    botIdWithoutSuffix === pId ||
                    (botLid && botLid.split('@')[0].split(':')[0] === pLid)
                );
                
                if (botMatches) {
                    isBotAdmin = true;
                }
                
                // Check if this participant is the sender
                const senderMatches = (
                    senderId === pFullId ||
                    senderId === pFullLid ||
                    senderNumber === pPhoneNumber ||
                    senderNumber === pId ||
                    senderIdWithoutSuffix === pPhoneNumber ||
                    senderIdWithoutSuffix === pId ||
                    (pLid && senderIdWithoutSuffix === pLid)
                );
                
                if (senderMatches) {
                    isSenderAdmin = true;
                }
            }
        }
        
        return { isBotAdmin, isSenderAdmin, participants };
        
    } catch (err) {
        console.error('❌ Error checking admin status:', err);
        return { isBotAdmin: false, isSenderAdmin: false, participants: [] };
    }
}

// Function to extract display number from any ID format (LID compatible)
function extractDisplayNumber(id) {
    if (!id) return 'Unknown';
    // Handle LID format like "123456789:0@lid"
    if (id.includes(':')) {
        return id.split(':')[0];
    }
    // Handle regular format like "923001234567@s.whatsapp.net"
    if (id.includes('@')) {
        return id.split('@')[0];
    }
    return id;
}

// Function to get all participant IDs for mentions (LID compatible)
function getAllParticipantIds(participants) {
    return participants.map(p => p.id).filter(Boolean);
}

cmd({
    pattern: "tagall",
    react: "🔊",
    alias: ["gc_tagall", "mentionall", "all"],
    desc: "Tag all group members with a message",
    category: "group",
    use: '.tagall [message]',
    filename: __filename
},
async (conn, mek, m, { from, body, command, isGroup, reply }) => {
    try {
        // Check if in group
        if (!isGroup) return reply("❌ This command can only be used in groups!");

        // Get sender ID with LID support
        const senderId = mek.key.participant || mek.key.remoteJid || (mek.key.fromMe ? conn.user?.id : null);
        if (!senderId) return reply("❌ Could not identify sender.");

        // Show processing reaction
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // Get group metadata
        let groupInfo = await conn.groupMetadata(from).catch(() => null);
        if (!groupInfo) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ Failed to fetch group information.");
        }

        let groupName = groupInfo.subject || "Unknown Group";
        let participants = groupInfo.participants || [];
        let totalMembers = participants.length;
        
        if (totalMembers === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ No members found in this group.");
        }

        // Get all participant IDs for mentions (LID compatible)
        const allParticipantIds = getAllParticipantIds(participants);

        // Random emoji selection
        let emojis = ['📢', '🔊', '🌐', '🔰', '❤‍🩹', '🤍', '🖤', '🩵', '📝', '💗', '🔖', '🪩', '📦', '🎉', '🛡️', '💸', '⏳', '🗿', '🚀', '🎧', '🪀', '⚡', '🚩', '🍁', '🗣️', '👻', '⚠️', '🔥'];
        let randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // Extract message from command
        let message = body.slice(body.indexOf(command) + command.length).trim();
        if (!message) message = "Attention Everyone!";

        // Build the tag message
        let teks = `▢ *Group:* ${groupName}\n`;
        teks += `▢ *Members:* ${totalMembers}\n`;
        teks += `▢ *Message:* ${message}\n\n`;
        teks += `┌───⊷ *MENTIONS*\n`;

        // Add all members with LID-compatible display
        for (let mem of participants) {
            if (!mem.id) continue;
            const displayNumber = extractDisplayNumber(mem.id);
            teks += `${randomEmoji} @${displayNumber}\n`;
        }

        teks += `└───────────────`;

        // Success reaction
        await conn.sendMessage(from, { react: { text: '🔊', key: mek.key } });

        // Send the message with all mentions
        await conn.sendMessage(from, { 
            text: teks, 
            mentions: allParticipantIds 
        }, { quoted: mek });

    } catch (e) {
        console.error("TagAll Error:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`❌ Error occurred: ${e.message || e}`);
    }
});
/*
const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

cmd({
    pattern: "tagall",
    react: "🔊",
    alias: ["gc_tagall"],
    desc: "To Tag all Members",
    category: "group",
    use: '.tagall [message]',
    filename: __filename
},
async (conn, mek, m, { from, participants, reply, isGroup, senderNumber, groupAdmins, prefix, command, args, body }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        const botOwner = conn.user.id.split(":")[0]; // Extract bot owner's number
        const senderJid = senderNumber + "@s.whatsapp.net";

        if (!groupAdmins.includes(senderJid) && senderNumber !== botOwner) {
            return reply("❌ Only group admins or the bot owner can use this command.");
        }

        // Ensure group metadata is fetched properly
        let groupInfo = await conn.groupMetadata(from).catch(() => null);
        if (!groupInfo) return reply("❌ Failed to fetch group information.");

        let groupName = groupInfo.subject || "Unknown Group";
        let totalMembers = participants ? participants.length : 0;
        if (totalMembers === 0) return reply("❌ No members found in this group.");

        let emojis = ['📢', '🔊', '🌐', '🔰', '❤‍🩹', '🤍', '🖤', '🩵', '📝', '💗', '🔖', '🪩', '📦', '🎉', '🛡️', '💸', '⏳', '🗿', '🚀', '🎧', '🪀', '⚡', '🚩', '🍁', '🗣️', '👻', '⚠️', '🔥'];
        let randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // Proper message extraction
        let message = body.slice(body.indexOf(command) + command.length).trim();
        if (!message) message = "Attention Everyone"; // Default message

        let teks = `▢ Group : *${groupName}*\n▢ Members : *${totalMembers}*\n▢ Message: *${message}*\n\n┌───⊷ *MENTIONS*\n`;

        for (let mem of participants) {
            if (!mem.id) continue; // Prevent undefined errors
            teks += `${randomEmoji} @${mem.id.split('@')[0]}\n`;
        }

        teks += "└──✪ 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳 ✪──";

        conn.sendMessage(from, { text: teks, mentions: participants.map(a => a.id) }, { quoted: mek });

    } catch (e) {
        console.error("TagAll Error:", e);
        reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);
    }
});
*/
