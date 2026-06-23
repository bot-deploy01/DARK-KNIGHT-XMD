const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')


cmd({
    pattern: "ginfo",
    react: "🥏",
    alias: ["groupinfo"],
    desc: "Get group information.",
    category: "group",
    use: '.ginfo',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isDev, isBotAdmins, participants, reply }) => {
    try {
        const msr = (await fetchJson('https://raw.githubusercontent.com/bot-deploy-main/DARK-KNIGHT-XMD/refs/heads/main/MSG/mreply.json')).replyMsg;

        if (!isGroup) return reply(msr.only_gp);
        if (!isAdmins && !isDev) return reply(msr.you_adm, { quoted: mek });
        if (!isBotAdmins) return reply(msr.give_adm);

        const ppUrls = [
            'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
            'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'
        ];

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(from, 'image');
        } catch {
            ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
        }

        const metadata = await conn.groupMetadata(from);
        const adminList = participants.filter(p => p.admin);
        const listAdmin = adminList.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
        const owner = metadata.owner ? metadata.owner.split('@')[0] : 'Unknown';

        const gdata = `*「 GROUP INFORMATION 」*

📝 *Group Name:* ${metadata.subject}

🆔 *Group JID:* ${metadata.id}

👥 *Participants:* ${metadata.participants.length}

👤 *Group Owner:* @${owner}

📃 *Description:* 
${metadata.desc?.toString() || 'No description'}

🫂 *Admins:* 
${listAdmin}

> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: gdata,
            mentions: adminList.map(v => v.id).concat(metadata.owner ? [metadata.owner] : [])
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`❌ *An error occurred!*\n\n${e.message}`);
    }
});
