const config = require('../config')
const { cmd } = require('../command')

// Function to check admin status with LID support
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
        
        return { isBotAdmin, isSenderAdmin };
        
    } catch (err) {
        console.error('❌ Error checking admin status:', err);
        return { isBotAdmin: false, isSenderAdmin: false };
    }
}

// Function to check if user is owner with LID support
function isOwnerUser(senderId) {
    const senderNumber = senderId.includes(':') 
        ? senderId.split(':')[0] 
        : (senderId.includes('@') ? senderId.split('@')[0] : senderId);
    
    const ownerNumbers = [];
    
    if (config.OWNER_NUMBER) {
        const ownerNum = config.OWNER_NUMBER.includes('@') 
            ? config.OWNER_NUMBER.split('@')[0] 
            : config.OWNER_NUMBER;
        ownerNumbers.push(ownerNum.includes(':') ? ownerNum.split(':')[0] : ownerNum);
    }
    
    const validOwnerNumbers = ownerNumbers.filter(Boolean);
    
    return validOwnerNumbers.some(ownerNum => {
        return senderNumber === ownerNum || 
               senderNumber === ownerNum.replace(/[^0-9]/g, '');
    });
}

cmd({
    pattern: "unmute",
    alias: ["groupunmute", "gcunmute", "opengc"],
    react: "🔊",
    desc: "Unmute the group (Everyone can send messages)",
    category: "group",
    use: '.unmute',
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        // Check if in group
        if (!isGroup) return reply("❌ This command can only be used in groups!");

        // Get sender ID with LID support
        const senderId = mek.key.participant || mek.key.remoteJid || (mek.key.fromMe ? conn.user?.id : null);
        if (!senderId) return reply("❌ Could not identify sender.");

        // Check admin status using the LID-supported function
        const { isBotAdmin, isSenderAdmin } = await checkAdminStatus(conn, from, senderId);

        // Check if sender is admin or owner
        const isOwner = isOwnerUser(senderId);
        
        if (!isSenderAdmin && !isOwner) {
            return reply("❌ Only group admins can use this command!");
        }

        // Check if bot is admin
        if (!isBotAdmin) {
            return reply("❌ I need to be an admin to unmute the group!");
        }

        // Show processing reaction
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // Unmute the group (allow everyone to send messages)
        await conn.groupSettingUpdate(from, "not_announcement");

        // Success reaction
        await conn.sendMessage(from, { react: { text: '🔊', key: mek.key } });

        // Success message
        await conn.sendMessage(from, {
            text: `✅ *Group Unmuted Successfully!*\n\n🔊 Everyone can now send messages.`
        }, { quoted: mek });

    } catch (e) {
        console.error("Error unmuting group:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("❌ Failed to unmute the group. Please try again.");
    }
});
/*
const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

cmd({
    pattern: "unmute",
    alias: ["groupunmute"],
    react: "🔊",
    desc: "Unmute the group (Everyone can send messages).",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, senderNumber, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need to be an admin to unmute the group.");

        await conn.groupSettingUpdate(from, "not_announcement");
        reply("✅ Group has been unmuted. Everyone can send messages.");
    } catch (e) {
        console.error("Error unmuting group:", e);
        reply("❌ Failed to unmute the group. Please try again.");
    }
});
*/
