const { cmd } = require('../command')

/* =========================
   FULL ADMIN CHECK (LID FIX)
========================= */
async function checkAdminStatus(conn, chatId, senderId) {
    try {
        const metadata = await conn.groupMetadata(chatId)
        const participants = metadata.participants || []

        const botId = conn.user?.id || ''
        const botLid = conn.user?.lid || ''

        const extract = id =>
            id?.includes(':') ? id.split(':')[0] :
            id?.includes('@') ? id.split('@')[0] : id

        const botNumber = extract(botId)
        const botLidNum = extract(botLid)
        const senderNum = extract(senderId)

        let isBotAdmin = false
        let isSenderAdmin = false

        for (let p of participants) {
            if (p.admin === "admin" || p.admin === "superadmin") {

                const pId = extract(p.id)
                const pLid = extract(p.lid)
                const pPhone = extract(p.phoneNumber)
                const pFullId = p.id || ''
                const pFullLid = p.lid || ''

                // BOT ADMIN CHECK
                if (
                    botId === pFullId ||
                    botId === pFullLid ||
                    botLid === pFullLid ||
                    botLidNum === pLid ||
                    botNumber === pPhone ||
                    botNumber === pId
                ) {
                    isBotAdmin = true
                }

                // SENDER ADMIN CHECK
                if (
                    senderId === pFullId ||
                    senderNum === pPhone ||
                    senderNum === pId ||
                    (pLid && senderNum === pLid)
                ) {
                    isSenderAdmin = true
                }
            }
        }

        return { isBotAdmin, isSenderAdmin }
    } catch (err) {
        console.error('Admin check error:', err)
        return { isBotAdmin: false, isSenderAdmin: false }
    }
}

/* =========================
   ➕ ADD MEMBER
========================= */
cmd({
    pattern: "add",
    alias: ["invite"],
    desc: "Add a member to the group using their number",
    category: "group",
    react: "➕",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, reply }) => {

    if (!isGroup)
        return reply("❌ This command can only be used in groups.")

    const senderId = mek.key.participant || mek.key.remoteJid
    const { isBotAdmin, isSenderAdmin } =
        await checkAdminStatus(conn, from, senderId)

    if (!isSenderAdmin)
        return reply("❌ Only group admins can use this command.")

    if (!isBotAdmin)
        return reply("❌ I need to be an admin to add members.")

    if (!q || !/^\d+$/.test(q))
        return reply("📱 Please provide a valid phone number.\nExample: `.add 947718xxxxx`")

    const userJid = `${q}@s.whatsapp.net`

    try {
        await conn.groupParticipantsUpdate(from, [userJid], "add")

        reply(`✅ Successfully added @${q}`, {
            mentions: [userJid]
        })

    } catch (error) {
        console.error("Add command error:", error)

        if (error?.data?.error?.includes("not-authorized")) {
            reply("⚠️ This user’s privacy settings prevent being added to groups.")
        } else {
            reply("❌ Failed to add the member. Please try again later.")
        }
    }
})

/*
const { cmd } = require('../command');

cmd({
    pattern: "add",
    alias: ["a", "invite"],
    desc: "Adds a member to the group",
    category: "admin",
    react: "➕",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, quoted, senderNumber
}) => {
    // Check if the command is used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Get the bot owner's number dynamically from conn.user.id
    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner) {
        return reply("❌ Only the bot owner can use this command.");
    }

    // Check if the bot is an admin
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0]; // If replying to a message, get the sender's number
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, ''); // If manually typing a number with '@'
    } else if (q && /^\d+$/.test(q)) {
        number = q; // If directly typing a number
    } else {
        return reply("❌ Please reply to a message, mention a user, or provide a number to add.");
    }

    const jid = number + "@s.whatsapp.net";

    try {
        await conn.groupParticipantsUpdate(from, [jid], "add");
        reply(`✅ Successfully added @${number}`, { mentions: [jid] });
    } catch (error) {
        console.error("Add command error:", error);
        reply("❌ Failed to add the member.");
    }
});
*/
