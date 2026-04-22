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
        let desc = `*` + "`「 🛡️ DARK-KNIGHT-XMD SETTINGS 🛡️ 」`" + `*

*🔢 Reply with the number to change settings*

*` + "`[01] MODE SETTINGS`" + `*
*🔸 1.1* »◦ *PUBLIC* 🧬
*🔸 1.2* »◦ *PRIVATE* 🧬
*🔸 1.3* »◦ *GROUPS* 🧬
*🔸 1.4* »◦ *INBOX* 🧬

*` + "`[02] STATUS SETTINGS`" + `*
*🔸 2.1* »◦ *AUTO STATUS SEEN: TRUE* ✅
*🔸 2.2* »◦ *AUTO STATUS SEEN: FALSE* ❌
*🔸 2.3* »◦ *AUTO STATUS REPLY: TRUE* ✅
*🔸 2.4* »◦ *AUTO STATUS REPLY: FALSE* ❌
*🔸 2.5* »◦ *AUTO STATUS REACT: TRUE* ✅
*🔸 2.6* »◦ *AUTO STATUS REACT: FALSE* ❌

*` + "`[03] PROTECTION (ANTI)`" + `*
*🔸 3.1* »◦ *ANTI LINK: TRUE* ✅
*🔸 3.2* »◦ *ANTI LINK: FALSE* ❌
*🔸 3.3* »◦ *ANTI LINK KICK: TRUE* ✅
*🔸 3.4* »◦ *ANTI LINK KICK: FALSE* ❌
*🔸 3.5* »◦ *DELETE LINKS: TRUE* ✅
*🔸 3.6* »◦ *DELETE LINKS: FALSE* ❌
*🔸 3.7* »◦ *ANTI BAD: TRUE* ✅
*🔸 3.8* »◦ *ANTI BAD: FALSE* ❌
*🔸 3.9* »◦ *ANTI VV: TRUE* ✅
*🔸 3.10* »◦ *ANTI VV: FALSE* ❌
*🔸 3.11* »◦ *ANTI DELETE: TRUE* ✅
*🔸 3.12* »◦ *ANTI DELETE: FALSE* ❌

*` + "`[04] AUTO ACTIONS`" + `*
*🔸 4.1* »◦ *AUTO REACT: TRUE* ✅
*🔸 4.2* »◦ *AUTO REACT: FALSE* ❌
*🔸 4.3* »◦ *CUSTOM REACT: TRUE* ✅
*🔸 4.4* »◦ *CUSTOM REACT: FALSE* ❌
*🔸 4.5* »◦ *HEART REACT: TRUE* ✅
*🔸 4.6* »◦ *HEART REACT: FALSE* ❌

*` + "`[05] AUTO MEDIA & REPLY`" + `*
*🔸 5.1* »◦ *AUTO VOICE: TRUE* ✅
*🔸 5.2* »◦ *AUTO VOICE: FALSE* ❌
*🔸 5.3* »◦ *AUTO STICKER: TRUE* ✅
*🔸 5.4* »◦ *AUTO STICKER: FALSE* ❌
*🔸 5.5* »◦ *AUTO REPLY: TRUE* ✅
*🔸 5.6* »◦ *AUTO REPLY: FALSE* ❌
*🔸 5.7* »◦ *MENTION REPLY: TRUE* ✅
*🔸 5.8* »◦ *MENTION REPLY: FALSE* ❌

*` + "`[06] PRESENCE SETTINGS`" + `*
*🔸 6.1* »◦ *ALWAYS ONLINE: TRUE* ✅
*🔸 6.2* »◦ *ALWAYS ONLINE: FALSE* ❌
*🔸 6.3* »◦ *AUTO TYPING: TRUE* ✅
*🔸 6.4* »◦ *AUTO TYPING: FALSE* ❌
*🔸 6.5* »◦ *AUTO RECORDING: TRUE* ✅
*🔸 6.6* »◦ *AUTO RECORDING: FALSE* ❌

*` + "`[07] SYSTEM SETTINGS`" + `*
*🔸 7.1* »◦ *WELCOME: TRUE* ✅
*🔸 7.2* »◦ *WELCOME: FALSE* ❌
*🔸 7.3* »◦ *ADMIN EVENTS: TRUE* ✅
*🔸 7.4* »◦ *ADMIN EVENTS: FALSE* ❌
*🔸 7.5* »◦ *READ MESSAGE: TRUE* ✅
*🔸 7.6* »◦ *READ MESSAGE: FALSE* ❌
*🔸 7.7* »◦ *READ CMD: TRUE* ✅
*🔸 7.8* »◦ *READ CMD: FALSE* ❌

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳*`;

        const vv = await conn.sendMessage(from, { image: { url: config.MENU_IMAGE_URL }, caption: desc }, { quoted: mek });

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const selectedOption = msg.message.extendedTextMessage.text.trim();
            const isReplyToBot = msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.stanzaId === vv.key.id;

            if (isReplyToBot) {
                if (!isOwner) return reply("❌ You are not the owner!");

                let successMsg = "";
                switch (selectedOption) {
                    case '1.1': config.MODE = "public"; successMsg = "Mode: PUBLIC"; break;
                    case '1.2': config.MODE = "private"; successMsg = "Mode: PRIVATE"; break;
                    case '1.3': config.MODE = "group"; successMsg = "Mode: GROUPS"; break;
                    case '1.4': config.MODE = "inbox"; successMsg = "Mode: INBOX"; break;

                    case '2.1': config.AUTO_STATUS_SEEN = "true"; successMsg = "Auto Status Seen: ON"; break;
                    case '2.2': config.AUTO_STATUS_SEEN = "false"; successMsg = "Auto Status Seen: OFF"; break;
                    case '2.3': config.AUTO_STATUS_REPLY = "true"; successMsg = "Auto Status Reply: ON"; break;
                    case '2.4': config.AUTO_STATUS_REPLY = "false"; successMsg = "Auto Status Reply: OFF"; break;
                    case '2.5': config.AUTO_STATUS_REACT = "true"; successMsg = "Auto Status React: ON"; break;
                    case '2.6': config.AUTO_STATUS_REACT = "false"; successMsg = "Auto Status React: OFF"; break;

                    case '3.1': config.ANTI_LINK = "true"; successMsg = "Anti Link: ON"; break;
                    case '3.2': config.ANTI_LINK = "false"; successMsg = "Anti Link: OFF"; break;
                    case '3.3': config.ANTI_LINK_KICK = "true"; successMsg = "Anti Link Kick: ON"; break;
                    case '3.4': config.ANTI_LINK_KICK = "false"; successMsg = "Anti Link Kick: OFF"; break;
                    case '3.5': config.DELETE_LINKS = "true"; successMsg = "Delete Links: ON"; break;
                    case '3.6': config.DELETE_LINKS = "false"; successMsg = "Delete Links: OFF"; break;
                    case '3.7': config.ANTI_BAD = "true"; successMsg = "Anti Bad: ON"; break;
                    case '3.8': config.ANTI_BAD = "false"; successMsg = "Anti Bad: OFF"; break;
                    case '3.9': config.ANTI_VV = "true"; successMsg = "Anti Once View: ON"; break;
                    case '3.10': config.ANTI_VV = "false"; successMsg = "Anti Once View: OFF"; break;
                    case '3.11': config.ANTI_DELETE = "true"; successMsg = "Anti Delete: ON"; break;
                    case '3.12': config.ANTI_DELETE = "false"; successMsg = "Anti Delete: OFF"; break;

                    case '4.1': config.AUTO_REACT = "true"; successMsg = "Auto React: ON"; break;
                    case '4.2': config.AUTO_REACT = "false"; successMsg = "Auto React: OFF"; break;
                    case '4.3': config.CUSTOM_REACT = "true"; successMsg = "Custom React: ON"; break;
                    case '4.4': config.CUSTOM_REACT = "false"; successMsg = "Custom React: OFF"; break;
                    case '4.5': config.HEART_REACT = "true"; successMsg = "Heart React: ON"; break;
                    case '4.6': config.HEART_REACT = "false"; successMsg = "Heart React: OFF"; break;

                    case '5.1': config.AUTO_VOICE = "true"; successMsg = "Auto Voice: ON"; break;
                    case '5.2': config.AUTO_VOICE = "false"; successMsg = "Auto Voice: OFF"; break;
                    case '5.3': config.AUTO_STICKER = "true"; successMsg = "Auto Sticker: ON"; break;
                    case '5.4': config.AUTO_STICKER = "false"; successMsg = "Auto Sticker: OFF"; break;
                    case '5.5': config.AUTO_REPLY = "true"; successMsg = "Auto Reply: ON"; break;
                    case '5.6': config.AUTO_REPLY = "false"; successMsg = "Auto Reply: OFF"; break;
                    case '5.7': config.MENTION_REPLY = "true"; successMsg = "Mention Reply: ON"; break;
                    case '5.8': config.MENTION_REPLY = "false"; successMsg = "Mention Reply: OFF"; break;

                    case '6.1': config.ALWAYS_ONLINE = "true"; successMsg = "Always Online: ON"; break;
                    case '6.2': config.ALWAYS_ONLINE = "false"; successMsg = "Always Online: OFF"; break;
                    case '6.3': config.AUTO_TYPING = "true"; successMsg = "Auto Typing: ON"; break;
                    case '6.4': config.AUTO_TYPING = "false"; successMsg = "Auto Typing: OFF"; break;
                    case '6.5': config.AUTO_RECORDING = "true"; successMsg = "Auto Recording: ON"; break;
                    case '6.6': config.AUTO_RECORDING = "false"; successMsg = "Auto Recording: OFF"; break;

                    case '7.1': config.WELCOME = "true"; successMsg = "Welcome: ON"; break;
                    case '7.2': config.WELCOME = "false"; successMsg = "Welcome: OFF"; break;
                    case '7.3': config.ADMIN_EVENTS = "true"; successMsg = "Admin Events: ON"; break;
                    case '7.4': config.ADMIN_EVENTS = "false"; successMsg = "Admin Events: OFF"; break;
                    case '7.5': config.READ_MESSAGE = "true"; successMsg = "Read Message: ON"; break;
                    case '7.6': config.READ_MESSAGE = "false"; successMsg = "Read Message: OFF"; break;
                    case '7.7': config.READ_CMD = "true"; successMsg = "Read Command: ON"; break;
                    case '7.8': config.READ_CMD = "false"; successMsg = "Read Command: OFF"; break;
                    default: return;
                }

                if (successMsg) {
                    await conn.sendMessage(from, { react: { text: '✅', key: msg.key } });
                    return reply(`✅ *SETTING UPDATED*\n\n${successMsg}`);
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
