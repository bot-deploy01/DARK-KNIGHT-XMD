const config = require('../config')
const {cmd , commands} = require('../command')
const os = require("os")

cmd({
    pattern: "settings",
    alias: ["setting"],
    desc: "settings the bot",
    category: "owner",
    react: "⚙",
    filename: __filename


},
async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    try {
        let desc = `* _𝑺𝑬𝑻𝑻𝑰𝑵𝑮𝑺_


╭══════════════════════○
┣━ *𝗪𝗢𝗥𝗞 𝗠𝗢𝗗𝗘 😈*
> *1️⃣.1️⃣  Public Work*
> *1️⃣.2️⃣  Private Work*
> *1️⃣.3️⃣  Group Only*
> *1️⃣.4️⃣  Inbox Only*
╭══════════════════════○
┣━ *𝗔𝗨𝗧𝗢 𝗩𝗢𝗜𝗖𝗘 😈*
> *2️⃣.1️⃣ Auto Voice On*
> *2️⃣.2️⃣ Auto Voice Off*
╭══════════════════════○
┣━ *𝗔𝗨𝗧𝗢 𝗦𝗧𝗔𝗧𝗨𝗦 𝗦𝗘𝗘𝗡 😈*
> *3️⃣.1️⃣ Auto Read Status On*
> *3️⃣.2️⃣ Auto Read Status Off*
╭══════════════════════○
┣━ *𝗔𝗨𝗧𝗢 𝗦𝗧𝗜𝗖𝗞𝗘𝗥 😈*
> *4️⃣.1️⃣ Auto sticker On*
> *4️⃣.2️⃣ Auto sticker Off*
╭══════════════════════○
┣━ *𝗔𝗨𝗧𝗢 𝗥𝗘𝗣𝗟𝗬😈*
> *5️⃣.1️⃣ Auto reply On*
> *5️⃣.2️⃣ Auto reply Off*
╭══════════════════════○
┣━ *𝗕𝗢𝗧 𝗢𝗡𝗟𝗜𝗡𝗘 𝗢𝗙𝗙𝗟𝗜𝗡𝗘 😈*
> *6️⃣.1️⃣ Online On*
> *6️⃣.2️⃣ Online Off*
╭══════════════════════○
┣━ *𝗠𝗦𝗚 𝗥𝗘𝗔𝗗 😈*
> *7️⃣.1️⃣ Read Msg On*
> *7️⃣.2️⃣ Read Msg Off*
╭══════════════════════○
┣━ *𝗠𝗦𝗚 𝗥𝗘𝗔𝗖𝗧 😈*
> *8️⃣.1️⃣ Auto React On*
> *8️⃣.2️⃣ Auto React Off*
╭══════════════════════○
┣━ *𝗔𝗡𝗧𝗜 𝗟𝗜𝗡𝗞 😈*
> *9️⃣.1️⃣ Anti Link On*
> *9️⃣.2️⃣ Anti Link Off*
> *9️⃣.3️⃣ Anti Link Remove*
╰═══════════════════════○


* *🔢 Reply Below This Number Change To Bot Change Setting*

> powerd by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

        const vv = await conn.sendMessage(from, { image: { url: config.MENU_IMAGE_URL }, caption: desc }, { quoted: mek });

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const selectedOption = msg.message.extendedTextMessage.text.trim();

            if (msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.stanzaId === vv.key.id) {
                switch (selectedOption) {
                    case '1.1':
                        reply(".update MODE:public" );
                        break;
                    case '1.2':               
                        reply(".update MODE:private");
                        break;
                    case '1.3':               
                          reply(".update MODE:group");
                      break;
                    case '1.4':     
                        reply(".update MODE:inbox");
                      break;
                    case '2.1':     
                        reply(".update AUTO_VOICE:true");
                        break;
                    case '2.2':     
                        reply(".update AUTO_VOICE:false");
                    break;
                    case '3.1':    
                        reply(".update AUTO_READ_STATUS:true");
                    break;
                    case '3.2':    
                        reply(".update AUTO_READ_STATUS:false");
                    break;                    
                    case '4.1':    
                        reply(".update AUTO_STICKER:true");
                    break;
                    case '4.2':    
                        reply(".update AUTO_STICKER:false");
                    break;                                        
                    case '5.1':    
                        reply(".update AUTO_REPLY:true");
                    break;
                    case '5.2':    
                        reply(".update AUTO_REPLY:false");
                    break;                        
                    case '6.1':    
                        reply(".update ALLWAYS_OFFLINE:true");
                    break; 
                    case '6.2':    
                        reply(".update ALLWAYS_OFFLINE:false");
                    break;                       
                    case '7.1':    
                        reply(".update READ_MESSAGE:true");
                    break;
                    case '7.2':    
                        reply(".update READ_MESSAGE:false");
                    break;
                    case '8.1':    
                        reply(".update config.AUTO_REACT:true");
                    break;
                    case '8.2':    
                        reply(".update config.AUTO_REACT:false");
                    break;
                    case '9.1':    
                        reply(".update ANTI_LINK:true");
                        reply(".update ANTI_LINKK:false");
                    break;
                    case '9.2':    
                        reply(".update ANTI_LINKK:true");
                        reply(".update ANTI_LINK:false");
                    break;
                    case '9.3':    
                        reply(".update ANTI_LINK:false");
                        reply(".update ANTI_LINKK:false");
                    break;
                    default:
                        reply("Invalid option. Please select a valid option🔴");
                }

            }
        });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply('An error occurred while processing your request.');
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
