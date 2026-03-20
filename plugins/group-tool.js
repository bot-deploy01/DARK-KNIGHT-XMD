const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { cmd } = require('../command');

// Function to check if sender is the Bot Owner (who deployed the bot)
function isBotOwner(conn, senderId) {
    const botId = conn.user?.id || '';
    const botLid = conn.user?.lid || '';
    
    const botNumber = botId.includes(':') 
        ? botId.split(':')[0] 
        : (botId.includes('@') ? botId.split('@')[0] : botId);
    
    const botLidNumeric = botLid.includes(':') 
        ? botLid.split(':')[0] 
        : (botLid.includes('@') ? botLid.split('@')[0] : botLid);
    
    let senderNumber = senderId;
    if (senderId.includes(':')) {
        senderNumber = senderId.split(':')[0];
    } else if (senderId.includes('@')) {
        senderNumber = senderId.split('@')[0];
    }
    
    return (
        senderNumber === botNumber ||
        senderNumber === botLidNumeric ||
        senderId === botId ||
        senderId === botLid
    );
}

// Function to check if bot is admin
async function checkBotAdmin(conn, chatId) {
    try {
        const metadata = await conn.groupMetadata(chatId);
        const participants = metadata.participants || [];
        
        const botId = conn.user?.id || '';
        const botLid = conn.user?.lid || '';
        
        const botNumber = botId.includes(':') 
            ? botId.split(':')[0] 
            : (botId.includes('@') ? botId.split('@')[0] : botId);
        
        const botLidNumeric = botLid.includes(':') 
            ? botLid.split(':')[0] 
            : (botLid.includes('@') ? botLid.split('@')[0] : botLid);
        
        for (let p of participants) {
            if (p.admin === "admin" || p.admin === "superadmin") {
                const pId = p.id ? p.id.split('@')[0] : '';
                const pLid = p.lid ? p.lid.split('@')[0] : '';
                const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
                const pLidNumeric = pLid.includes(':') ? pLid.split(':')[0] : pLid;
                const pFullId = p.id || '';
                const pFullLid = p.lid || '';
                
                const botMatches = (
                    botId === pFullId ||
                    botId === pFullLid ||
                    botLid === pFullLid ||
                    botLidNumeric === pLidNumeric ||
                    botNumber === pPhoneNumber ||
                    botNumber === pId
                );
                
                if (botMatches) return true;
            }
        }
        return false;
    } catch (err) {
        return false;
    }
}

// Function to get all kickable members
async function getKickableMembers(conn, chatId) {
    try {
        const metadata = await conn.groupMetadata(chatId);
        const participants = metadata.participants || [];
        
        const botId = conn.user?.id || '';
        const botLid = conn.user?.lid || '';
        
        const botNumber = botId.includes(':') 
            ? botId.split(':')[0] 
            : (botId.includes('@') ? botId.split('@')[0] : botId);
        
        const botLidNumeric = botLid.includes(':') 
            ? botLid.split(':')[0] 
            : (botLid.includes('@') ? botLid.split('@')[0] : botLid);
        
        const kickable = [];
        
        for (let p of participants) {
            if (p.admin === "admin" || p.admin === "superadmin") {
                continue;
            }
            
            const pId = p.id ? p.id.split('@')[0] : '';
            const pLid = p.lid ? p.lid.split('@')[0] : '';
            const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
            const pLidNumeric = pLid.includes(':') ? pLid.split(':')[0] : pLid;
            const pFullId = p.id || '';
            const pFullLid = p.lid || '';
            
            const isBot = (
                botId === pFullId ||
                botId === pFullLid ||
                botLid === pFullLid ||
                botLidNumeric === pLidNumeric ||
                botNumber === pPhoneNumber ||
                botNumber === pId
            );
            
            if (!isBot && p.id) {
                kickable.push(p.id);
            }
        }
        
        return kickable;
    } catch (err) {
        return [];
    }
}

cmd({
    pattern: "kickall",
    alias: ["removeall", "cleargroup"],
    desc: "Remove all members at once (Bot Owner Only)",
    category: "owner",
    react: "⚠️",
    filename: __filename
},
async (Void, citel, text) => {
    try {
        if (!citel.isGroup) {
            return citel.reply("❌ This command works only in groups!");
        }
        
        const senderId = citel.key?.participant || citel.sender || citel.key?.remoteJid;
        if (!senderId) {
            return citel.reply("❌ Could not identify sender.");
        }
        
        // Only Bot Owner can use
        if (!isBotOwner(Void, senderId)) {
            return citel.reply(`❌ *ACCESS DENIED!*\n\n⚠️ Only *Bot Owner* can use this command!`);
        }
        
        const botIsAdmin = await checkBotAdmin(Void, citel.chat);
        if (!botIsAdmin) {
            return citel.reply("❌ I need to be an *admin* to kick members!");
        }
        
        const members = await getKickableMembers(Void, citel.chat);
        
        if (members.length === 0) {
            return citel.reply("❌ No members found to kick!");
        }
        
        // 🚀 KICK ALL MEMBERS AT ONCE - Single Action!
        await Void.groupParticipantsUpdate(citel.chat, members, "remove");
        
        // Success message
        await citel.reply(`✅ *DONE!*\n\n🗑️ Kicked *${members.length}* members at once!`);
        
    } catch (error) {
        console.error("[KICKALL ERROR]", error);
        citel.reply("❌ *Error!* " + error.message);
    }
});

// remove only member

cmd({
    pattern: "removemembers",
    alias: ["kickall"],
    desc: "Remove all non-admin members from the group.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, {
    from, groupMetadata, groupAdmins, isBotAdmins, senderNumber, reply, isGroup
}) => {
    try {
        // Check if the command is used in a group
        if (!isGroup) {
            return reply("This command can only be used in groups.");
        }

        // Get the bot owner's number dynamically
        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            return reply("Only the bot owner can use this command.");
        }

        if (!isBotAdmins) {
            return reply("I need to be an admin to execute this command.");
        }

        const allParticipants = groupMetadata.participants;
        const nonAdminParticipants = allParticipants.filter(member => !groupAdmins.includes(member.id));

        if (nonAdminParticipants.length === 0) {
            return reply("There are no non-admin members to remove.");
        }

        reply(`Starting to remove ${nonAdminParticipants.length} non-admin members...`);

        for (let participant of nonAdminParticipants) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000); // 2-second delay between removals
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        reply("Successfully removed all non-admin members from the group.");
    } catch (e) {
        console.error("Error removing non-admin users:", e);
        reply("An error occurred while trying to remove non-admin members. Please try again.");
    }
});

// remove only admins
 
cmd({
    pattern: "removeadmins",
    alias: ["kickall1"],
    desc: "Remove all admin members from the group, excluding the bot and bot owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, {
    from, isGroup, senderNumber, groupMetadata, groupAdmins, isBotAdmins, reply
}) => {
    try {
        // Check if the command is used in a group
        if (!isGroup) {
            return reply("This command can only be used in groups.");
        }

        // Get the bot owner's number dynamically
        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            return reply("Only the bot owner can use this command.");
        }

        if (!isBotAdmins) {
            return reply("I need to be an admin to execute this command.");
        }

        const allParticipants = groupMetadata.participants;
        const adminParticipants = allParticipants.filter(member => groupAdmins.includes(member.id) && member.id !== conn.user.id && member.id !== `${botOwner}@s.whatsapp.net`);

        if (adminParticipants.length === 0) {
            return reply("There are no admin members to remove.");
        }

        reply(`Starting to remove ${adminParticipants.length} admin members, excluding the bot and bot owner...`);

        for (let participant of adminParticipants) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000); // 2-second delay between removals
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        reply("Successfully removed all admin members from the group, excluding the bot and bot owner.");
    } catch (e) {
        console.error("Error removing admins:", e);
        reply("An error occurred while trying to remove admins. Please try again.");
    }
});

// remove admins and memeber both

cmd({
    pattern: "removeall2",
    alias: ["kickall2"],
    desc: "Remove all members and admins from the group, excluding the bot and bot owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, {
    from, isGroup, senderNumber, groupMetadata, isBotAdmins, reply
}) => {
    try {
        // Check if the command is used in a group
        if (!isGroup) {
            return reply("This command can only be used in groups.");
        }

        // Get the bot owner's number dynamically
        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            return reply("Only the bot owner can use this command.");
        }

        if (!isBotAdmins) {
            return reply("I need to be an admin to execute this command.");
        }

        const allParticipants = groupMetadata.participants;

        if (allParticipants.length === 0) {
            return reply("The group has no members to remove.");
        }

        // Filter out the bot and bot owner from the list
        const participantsToRemove = allParticipants.filter(
            participant => participant.id !== conn.user.id && participant.id !== `${botOwner}@s.whatsapp.net`
        );

        if (participantsToRemove.length === 0) {
            return reply("No members to remove after excluding the bot and bot owner.");
        }

        reply(`Starting to remove ${participantsToRemove.length} members, excluding the bot and bot owner...`);

        for (let participant of participantsToRemove) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000); // 2-second delay between removals
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        reply("Successfully removed all members, excluding the bot and bot owner, from the group.");
    } catch (e) {
        console.error("Error removing members:", e);
        reply("An error occurred while trying to remove members. Please try again.");
    }
});
