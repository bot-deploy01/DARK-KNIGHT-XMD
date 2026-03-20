const { cmd, commands } = require("../command"); // ඔබේ ලිපිගොනු පිහිටීම අනුව මෙය වෙනස් කරගන්න
const { phoneNumberToJid } = require('@whiskeysockets/baileys');

cmd({
    pattern: "groupadd",
    alias: ["add", "gadd"],
    desc: "Add user to group by mention, reply, or phone number",
    category: "group",
    react: "➕",
    use: ".groupadd @user OR .groupadd 9471XXXXXXX OR reply to user's message",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply, isAdmin, isBotAdmin }) => {
    try {
        // සමූහයක් ඇතුළත දැයි පරීක්ෂා කිරීම
        if (!isGroup) return reply('❌ This command can only be used in groups!');
        
        // Bot ඇඩ්මින් කෙනෙක් දැයි පරීක්ෂා කිරීම
        if (!isBotAdmin) return reply('❌ Error: Please make the bot an admin first to use this command.');

        // භාවිතා කරන්නා ඇඩ්මින් කෙනෙක් දැයි පරීක්ෂා කිරීම
        if (!isAdmin) return reply('❌ Error: Only group admins can use this command.');

        let usersToAdd = [];
        
        // Method 1: Mention කර ඇති අය ඇතුළත් කිරීම
        if (m.mentionedJid[0]) {
            usersToAdd = m.mentionedJid.filter(jid => !jid.includes('status@broadcast'));
        } 
        // Method 2: Reply කර ඇති අය ඇතුළත් කිරීම
        else if (m.quoted) {
            usersToAdd = [m.quoted.sender];
        } 
        // Method 3: දුරකථන අංකයක් ලබා දී තිබේදැයි පරීක්ෂා කිරීම
        else if (q) {
            const numbers = q.match(/\d+/g);
            if (numbers && numbers.length > 0) {
                for (let number of numbers) {
                    number = number.replace(/\D/g, ''); // ඉලක්කම් පමණක් ඉතිරි කිරීම
                    if (number.length >= 9) { 
                        const jid = `${number}@s.whatsapp.net`;
                        usersToAdd.push(jid);
                    }
                }
            }
        }
        
        if (usersToAdd.length === 0) {
            return reply('❌ Please mention the user, reply to their message, or provide a phone number!\n\n*Usage:*\n• .groupadd @user\n• .groupadd 947XXXXXXXX\n• Reply to user\'s message with .groupadd');
        }

        const successUsers = [];
        const failedUsers = [];

        // එකින් එක සාමාජිකයන් එකතු කිරීම
        for (const userJid of usersToAdd) {
            try {
                // WhatsApp API හරහා ඇඩ් කිරීම
                const response = await conn.groupParticipantsUpdate(from, [userJid], "add");
                
                // සමහර විට add නොවී invite link එකක් යාමට ඉඩ ඇත (Privacy settings නිසා)
                if (response[0].status === "200") {
                    successUsers.push(userJid);
                } else {
                    failedUsers.push(userJid);
                }
                
                // Rate limiting වැළැක්වීමට තත්පරයක විරාමයක්
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                failedUsers.push(userJid);
            }
        }

        // ප්‍රතිඵල පණිවිඩය සකස් කිරීම
        let resultMessage = '';
        
        if (successUsers.length > 0) {
            const successNames = successUsers.map(jid => `@${jid.split('@')[0]}`);
            resultMessage += `✅ *Successfully Added:*\n${successNames.map(name => `• ${name}`).join('\n')}\n\n`;
        }
        
        if (failedUsers.length > 0) {
            const failedNames = failedUsers.map(jid => `@${jid.split('@')[0]}`);
            resultMessage += `❌ *Failed to Add:*\n${failedNames.map(name => `• ${name}`).join('\n')}\n\n`;
            resultMessage += `*Possible reasons:*\n• User privacy settings (Invite only)\n• User blocked the bot\n• Invalid phone number\n• User already in group`;
        }

        resultMessage += `\n👑 *Added By:* @${sender.split('@')[0]}`;

        const allMentions = [...successUsers, ...failedUsers, sender];
        
        await conn.sendMessage(from, { 
            text: resultMessage,
            mentions: allMentions
        }, {
            quoted: m
        });
        
    } catch (error) {
        console.error('Error in groupadd command:', error);
        await reply('❌ Failed to add user(s). Check logs for more details.');
    }
});
