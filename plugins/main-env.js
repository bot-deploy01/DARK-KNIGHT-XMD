const config = require('../config')
const { cmd, commands } = require('../command')
const os = require("os")

cmd({
    pattern: "settings",
    alias: ["setting"],
    desc: "Detailed settings panel for Dark-Knight-XMD",
    category: "owner",
    react: "⚙️",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");

    try {
        let desc = `*「 🛡️ DARK-KNIGHT-XMD SETTINGS 🛡️ 」*

*🔢 Reply with the number to change settings*

*` + "`[01] MODE`" + `*
*🔸 1.1* ❯❯◦ *PUBLIC* 🧬
*🔸 1.2* ❯❯◦ *PRIVATE* 🧬
*🔸 1.3* ❯❯◦ *GROUPS* 🧬
*🔸 1.4* ❯❯◦ *INBOX* 🧬

*` + "`[02] AUTO STATUS SEEN`" + `*
*🔸 2.1* ❯❯◦ *TRUE* 🔑
*🔸 2.2* ❯❯◦ *FALSE* 🔒

*` + "`[03] AUTO STATUS REPLY`" + `*
*🔸 3.1* ❯❯◦ *TRUE* 🔑
*🔸 3.2* ❯❯◦ *FALSE* 🔒

*` + "`[04] AUTO STATUS REACT`" + `*
*🔸 4.1* ❯❯◦ *TRUE* 🔑
*🔸 4.2* ❯❯◦ *FALSE* 🔒

*` + "`[05] WELCOME & GOODBYE`" + `*
*🔸 5.1* ❯❯◦ *TRUE* 🔑
*🔸 5.2* ❯❯◦ *FALSE* 🔒

*` + "`[06] ADMIN EVENTS`" + `*
*🔸 6.1* ❯❯◦ *TRUE* 🔑
*🔸 6.2* ❯❯◦ *FALSE* 🔒

*` + "`[07] ANTI LINK`" + `*
*🔸 7.1* ❯❯◦ *TRUE* 🔑
*🔸 7.2* ❯❯◦ *FALSE* 🔒

*` + "`[08] ANTI LINK KICK`" + `*
*🔸 8.1* ❯❯◦ *TRUE* 🔑
*🔸 8.2* ❯❯◦ *FALSE* 🔒

*` + "`[09] DELETE LINKS`" + `*
*🔸 9.1* ❯❯◦ *TRUE* 🔑
*🔸 9.2* ❯❯◦ *FALSE* 🔒

*` + "`[10] MENTION REPLY`" + `*
*🔸 10.1* ❯❯◦ *TRUE* 🔑
*🔸 10.2* ❯❯◦ *FALSE* 🔒

*` + "`[11] CUSTOM REACT`" + `*
*🔸 11.1* ❯❯◦ *TRUE* 🔑
*🔸 11.2* ❯❯◦ *FALSE* 🔒

*` + "`[12] READ MESSAGE`" + `*
*🔸 12.1* ❯❯◦ *TRUE* 🔑
*🔸 12.2* ❯❯◦ *FALSE* 🔒

*` + "`[13] AUTO REACT`" + `*
*🔸 13.1* ❯❯◦ *TRUE* 🔑
*🔸 13.2* ❯❯◦ *FALSE* 🔒

*` + "`[14] HEART REACT`" + `*
*🔸 14.1* ❯❯◦ *TRUE* 🔑
*🔸 14.2* ❯❯◦ *FALSE* 🔒

*` + "`[15] ANTI BAD`" + `*
*🔸 15.1* ❯❯◦ *TRUE* 🔑
*🔸 15.2* ❯❯◦ *FALSE* 🔒

*` + "`[16] AUTO VOICE`" + `*
*🔸 16.1* ❯❯◦ *TRUE* 🔑
*🔸 16.2* ❯❯◦ *FALSE* 🔒

*` + "`[17] AUTO STICKER`" + `*
*🔸 17.1* ❯❯◦ *TRUE* 🔑
*🔸 17.2* ❯❯◦ *FALSE* 🔒

*` + "`[18] AUTO REPLY`" + `*
*🔸 18.1* ❯❯◦ *TRUE* 🔑
*🔸 18.2* ❯❯◦ *FALSE* 🔒

*` + "`[19] ALWAYS ONLINE`" + `*
*🔸 19.1* ❯❯◦ *TRUE* 🔑
*🔸 19.2* ❯❯◦ *FALSE* 🔒

*` + "`[20] AUTO TYPING`" + `*
*🔸 20.1* ❯❯◦ *TRUE* 🔑
*🔸 20.2* ❯❯◦ *FALSE* 🔒

*` + "`[21] READ COMMAND`" + `*
*🔸 21.1* ❯❯◦ *TRUE* 🔑
*🔸 21.2* ❯❯◦ *FALSE* 🔒

*` + "`[22] ANTI ONCE VIEW`" + `*
*🔸 22.1* ❯❯◦ *TRUE* 🔑
*🔸 22.2* ❯❯◦ *FALSE* 🔒

*` + "`[23] AUTO RECORDING`" + `*
*🔸 23.1* ❯❯◦ *TRUE* 🔑
*🔸 23.2* ❯❯◦ *FALSE* 🔒

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳*`;

        const vv = await conn.sendMessage(from, { image: { url: config.MENU_IMAGE_URL }, caption: desc }, { quoted: mek });

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const selectedOption = msg.message.extendedTextMessage.text.trim();
            const isReplyToBot = msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.stanzaId === vv.key.id;

            if (isReplyToBot) {
                // මෙතනදීත් ඔයාගේ isOwner logic එක check කරනවා
                if (!isOwner) return reply("❌ You are not the owner!");

                let successMsg = "";
                switch (selectedOption) {
                    case '1.1': config.MODE = "public"; successMsg = "Mode: PUBLIC"; break;
                    case '1.2': config.MODE = "private"; successMsg = "Mode: PRIVATE"; break;
                    case '1.3': config.MODE = "group"; successMsg = "Mode: GROUPS"; break;
                    case '1.4': config.MODE = "inbox"; successMsg = "Mode: INBOX"; break;
                    case '2.1': config.AUTO_STATUS_SEEN = "true"; successMsg = "Auto Status Seen: ON"; break;
                    case '2.2': config.AUTO_STATUS_SEEN = "false"; successMsg = "Auto Status Seen: OFF"; break;
                    case '3.1': config.AUTO_STATUS_REPLY = "true"; successMsg = "Auto Status Reply: ON"; break;
                    case '3.2': config.AUTO_STATUS_REPLY = "false"; successMsg = "Auto Status Reply: OFF"; break;
                    case '4.1': config.AUTO_STATUS_REACT = "true"; successMsg = "Auto Status React: ON"; break;
                    case '4.2': config.AUTO_STATUS_REACT = "false"; successMsg = "Auto Status React: OFF"; break;
                    case '5.1': config.WELCOME = "true"; successMsg = "Welcome: ON"; break;
                    case '5.2': config.WELCOME = "false"; successMsg = "Welcome: OFF"; break;
                    case '6.1': config.ADMIN_EVENTS = "true"; successMsg = "Admin Events: ON"; break;
                    case '6.2': config.ADMIN_EVENTS = "false"; successMsg = "Admin Events: OFF"; break;
                    case '7.1': config.ANTI_LINK = "true"; successMsg = "Anti Link: ON"; break;
                    case '7.2': config.ANTI_LINK = "false"; successMsg = "Anti Link: OFF"; break;
                    case '8.1': config.ANTI_LINK_KICK = "true"; successMsg = "Anti Link Kick: ON"; break;
                    case '8.2': config.ANTI_LINK_KICK = "false"; successMsg = "Anti Link Kick: OFF"; break;
                    case '9.1': config.DELETE_LINKS = "true"; successMsg = "Delete Links: ON"; break;
                    case '9.2': config.DELETE_LINKS = "false"; successMsg = "Delete Links: OFF"; break;
                    case '10.1': config.MENTION_REPLY = "true"; successMsg = "Mention Reply: ON"; break;
                    case '10.2': config.MENTION_REPLY = "false"; successMsg = "Mention Reply: OFF"; break;
                    case '11.1': config.CUSTOM_REACT = "true"; successMsg = "Custom React: ON"; break;
                    case '11.2': config.CUSTOM_REACT = "false"; successMsg = "Custom React: OFF"; break;
                    case '12.1': config.READ_MESSAGE = "true"; successMsg = "Read Message: ON"; break;
                    case '12.2': config.READ_MESSAGE = "false"; successMsg = "Read Message: OFF"; break;
                    case '13.1': config.AUTO_REACT = "true"; successMsg = "Auto React: ON"; break;
                    case '13.2': config.AUTO_REACT = "false"; successMsg = "Auto React: OFF"; break;
                    case '14.1': config.HEART_REACT = "true"; successMsg = "Heart React: ON"; break;
                    case '14.2': config.HEART_REACT = "false"; successMsg = "Heart React: OFF"; break;
                    case '15.1': config.ANTI_BAD = "true"; successMsg = "Anti Bad: ON"; break;
                    case '15.2': config.ANTI_BAD = "false"; successMsg = "Anti Bad: OFF"; break;
                    case '16.1': config.AUTO_VOICE = "true"; successMsg = "Auto Voice: ON"; break;
                    case '16.2': config.AUTO_VOICE = "false"; successMsg = "Auto Voice: OFF"; break;
                    case '17.1': config.AUTO_STICKER = "true"; successMsg = "Auto Sticker: ON"; break;
                    case '17.2': config.AUTO_STICKER = "false"; successMsg = "Auto Sticker: OFF"; break;
                    case '18.1': config.AUTO_REPLY = "true"; successMsg = "Auto Reply: ON"; break;
                    case '18.2': config.AUTO_REPLY = "false"; successMsg = "Auto Reply: OFF"; break;
                    case '19.1': config.ALWAYS_ONLINE = "true"; successMsg = "Always Online: ON"; break;
                    case '19.2': config.ALWAYS_ONLINE = "false"; successMsg = "Always Online: OFF"; break;
                    case '20.1': config.AUTO_TYPING = "true"; successMsg = "Auto Typing: ON"; break;
                    case '20.2': config.AUTO_TYPING = "false"; successMsg = "Auto Typing: OFF"; break;
                    case '21.1': config.READ_CMD = "true"; successMsg = "Read Command: ON"; break;
                    case '21.2': config.READ_CMD = "false"; successMsg = "Read Command: OFF"; break;
                    case '22.1': config.ANTI_VV = "true"; successMsg = "Anti Once View: ON"; break;
                    case '22.2': config.ANTI_VV = "false"; successMsg = "Anti Once View: OFF"; break;
                    case '23.1': config.AUTO_RECORDING = "true"; successMsg = "Auto Recording: ON"; break;
                    case '23.2': config.AUTO_RECORDING = "false"; successMsg = "Auto Recording: OFF"; break;
                    default: return;
                }

                if (successMsg) {
                    await conn.sendMessage(from, { react: { text: '✅', key: msg.key } });
                    return reply(`✅ *DARK-KNIGHT-XMD UPDATE*\n\n${successMsg}`);
                }
            }
        });

    } catch (e) {
        console.error(e);
        reply('An error occurred.');
    }
});


/*const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');

function isEnabled(value) {
    // Function to check if a value represents a "true" boolean state
    return value && value.toString().toLowerCase() === "true";
}

cmd({
    pattern: "setting",
    alias: ["setting"],
    desc: "Show all bot configuration variables (Owner Only)",
    category: "system",
    react: "⚙️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, reply, isCreator }) => {
    try {
        // Owner check
        if (!isCreator) {
            return reply("🚫 *Owner Only Command!* You're not authorized to view bot configurations.");
        }

        const isEnabled = (value) => value && value.toString().toLowerCase() === "true";

        let envSettings = `
╭──『 *${config.BOT_NAME}* 』──❏
│
│𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳 SETTINGS 
│-------------------------
│
├─❏ *🤖 BOT INFO*
│  ├─∘ *Name:* ${config.BOT_NAME}
│  ├─∘ *Prefix:* ${config.PREFIX}
│  ├─∘ *Owner:* ${config.OWNER_NAME}
│  ├─∘ *Number:* ${config.OWNER_NUMBER}
│  └─∘ *Mode:* ${config.MODE.toUpperCase()}
│
├─❏ *⚙️ CORE SETTINGS*
│  ├─∘ *Public Mode:* ${isEnabled(config.PUBLIC_MODE) ? "✅" : "❌"}
│  ├─∘ *Always Online:* ${isEnabled(config.ALWAYS_ONLINE) ? "✅" : "❌"}
│  ├─∘ *Read Msgs:* ${isEnabled(config.READ_MESSAGE) ? "✅" : "❌"}
│  └─∘ *Read Cmds:* ${isEnabled(config.READ_CMD) ? "✅" : "❌"}
│
├─❏ *🔌 AUTOMATION*
│  ├─∘ *Auto Reply:* ${isEnabled(config.AUTO_REPLY) ? "✅" : "❌"}
│  ├─∘ *Auto React:* ${isEnabled(config.AUTO_REACT) ? "✅" : "❌"}
│  ├─∘ *Custom React:* ${isEnabled(config.CUSTOM_REACT) ? "✅" : "❌"}
│  ├─∘ *React Emojis:* ${config.CUSTOM_REACT_EMOJIS}
│  ├─∘ *Auto Sticker:* ${isEnabled(config.AUTO_STICKER) ? "✅" : "❌"}
│  └─∘ *Auto Voice:* ${isEnabled(config.AUTO_VOICE) ? "✅" : "❌"}
│
├─❏ *📢 STATUS SETTINGS*
│  ├─∘ *Status Seen:* ${isEnabled(config.AUTO_STATUS_SEEN) ? "✅" : "❌"}
│  ├─∘ *Status Reply:* ${isEnabled(config.AUTO_STATUS_REPLY) ? "✅" : "❌"}
│  ├─∘ *Status React:* ${isEnabled(config.AUTO_STATUS_REACT) ? "✅" : "❌"}
│  └─∘ *Status Msg:* ${config.AUTO_STATUS_MSG}
│
├─❏ *🛡️ SECURITY*
│  ├─∘ *Anti-Link:* ${isEnabled(config.ANTI_LINK) ? "✅" : "❌"}
│  ├─∘ *Anti-Bad:* ${isEnabled(config.ANTI_BAD) ? "✅" : "❌"}
│  ├─∘ *Anti-VV:* ${isEnabled(config.ANTI_VV) ? "✅" : "❌"}
│  └─∘ *Del Links:* ${isEnabled(config.DELETE_LINKS) ? "✅" : "❌"}
│
├─❏ *⏳ MISC*
│  ├─∘ *Auto Typing:* ${isEnabled(config.AUTO_TYPING) ? "✅" : "❌"}
│  ├─∘ *Auto Record:* ${isEnabled(config.AUTO_RECORDING) ? "✅" : "❌"}
│  ├─∘ *Anti-Del Path:* ${config.ANTI_DEL_PATH}
│  └─∘ *Dev Number:* ${config.DEV}
│
│-----------------------
│
├─❏ *⚙️ CHANGE SETTINGS*
│
├─❏ 🔧 *1. Mode*
│       - Current Status: ${config.MODE || "public"}
│       - Usage: ${config.PREFIX}mode private/public
│
├─❏ 🎯 *2. Auto Typing*
│       - Current Status: ${config.AUTO_TYPING || "off"}
│       - Usage: ${config.PREFIX}autotyping on/off
│
├─❏ 🌐 *3. Always Online*
│       - Current Status: ${config.ALWAYS_ONLINE || "off"}
│       - Usage: ${config.PREFIX}alwaysonline on/off
│
├─❏ 🎙️ *4. Auto Recording*
│       - Current Status: ${config.AUTO_RECORDING || "off"}
│       - Usage: ${config.PREFIX}autorecording on/off
│
├─❏ 📖 *5. Auto Read Status*
│       - Current Status: ${config.AUTO_STATUS_REACT || "off"}
│       - Usage: ${config.PREFIX}autoreadstatus on/off
│
├─❏ 🚫 *6. Anti Bad Word*
│       - Current Status: ${config.ANTI_BAD_WORD || "off"}
│       - Usage: ${config.PREFIX}antibad on/off
│
├─❏ 🗑️ *7. Anti Delete*
│       - Current Status: ${config.ANTI_BAD_WORD || "off"}
│       - Usage: ${config.PREFIX}antidelete on/off
│
├─❏ 🖼️ *8. Auto Sticker*
│       - Current Status: ${config.AUTO_STICKER || "off"}
│       - Usage: ${config.PREFIX}autosticker on/off
│
├─❏ 💬 *9. Auto Reply*
│       - Current Status: ${config.AUTO_REPLY || "off"}
│       - Usage: ${config.PREFIX}autoreply on/off
│
├─❏ ❤️ *10. Auto React*
│       - Current Status: ${config.AUTO_REACT || "off"}
│       - Usage: ${config.PREFIX}autoreact on/off
│
├─❏ 📢 *11. Status Reply*
│       - Current Status: ${config.AUTO_STATUS_REPLY || "off"}
│       - Usage: ${config.PREFIX}autostatusreply on/off
│
├─❏ 🔗 *12. Anti Link*
│       - Current Status: ${config.ANTI_LINK || "off"}
│       - Usage: ${config.PREFIX}antilink on/off
│
├─❏ 💖 *13. Heart React*
│       - Current Status: ${config.HEART_REACT || "off"}
│       - Usage: ${config.PREFIX}heartreact on/off
│
├─❏ 🔧 *14. Set Prefix*
│       - Current Prefix: ${config.PREFIX || "."}
│       - Usage: ${config.PREFIX}setprefix <new_prefix>
│
├─∘ 📌 *Note*: Replace "on/off" with the desired state to enable or disable a feature.
│
╰──『 ${config.DESCRIPTION} 』──❏
`;

        // Fake VCard
        const FakeVCard = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "© 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃",
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Meta\nORG:META AI;\nTEL;type=CELL;type=VOICE;waid=13135550002:+13135550002\nEND:VCARD`
        }
      }
    }; 
        
        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL },
                caption: envSettings,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            },
            { quoted: FakeVCard });

    } catch (error) {
        console.error('Env command error:', error);
        reply(`❌ Error displaying config: ${error.message}`);
    }
});*/
