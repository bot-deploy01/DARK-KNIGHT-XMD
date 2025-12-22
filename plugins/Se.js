const config = require('../config');
const { cmd } = require('../command');

let settingMessageId = null; // store message id

cmd({
    pattern: "sett",
    alias: ["settings"],
    desc: "Settings for the bot",
    category: "owner",
    react: "⚙",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {

    if (!isOwner) return reply("❌ You are not the owner!");

    try {
        let desc = `
🪀 *SETTING LIST* 📃

*1️⃣ BOT MODE*
> 1.1 = MODE:public
> 1.2 = MODE:private
> 1.3 = MODE:group
> 1.4 = MODE:inbox

*2️⃣ AUTO READ STATUS*
> 2.1 = true
> 2.2 = false

*3️⃣ AUTO STATUS REPLY*
> 3.1 = true
> 3.2 = false

*4️⃣ AUTO STATUS REACT*
> 4.1 = true
> 4.2 = false

*5️⃣ AUTO VOICE*
> 5.1 = true
> 5.2 = false

*6️⃣ AUTO STICKER*
> 6.1 = true
> 6.2 = false

*7️⃣ AUTO REPLY*
> 7.1 = true
> 7.2 = false

*8️⃣ AUTO REACT*
> 8.1 = true
> 8.2 = false

*9️⃣ HEART REACT*
> 9.1 = true
> 9.2 = false

*🔟 OWNER REACT*
> 10.1 = true
> 10.2 = false

*1️⃣1️⃣ FAKE RECORDING*
> 11.1 = true
> 11.2 = false

*1️⃣2️⃣ ANTI BAD*
> 12.1 = true
> 12.2 = false

*1️⃣3️⃣ ANTI LINK*
> 13.1 = true
> 13.2 = false

📌 *Reply with option number (ex: 1.1)*  
`;

        const sent = await conn.sendMessage(from, {
            image: { url: "https://telegra.ph/file/e84c85f6f6554f338f0c9-b29616e9df5cdba264.jpg" },
            caption: desc
        }, { quoted: mek });

        settingMessageId = sent.key.id;

    } catch (err) {
        console.error(err);
        reply("❌ Error while opening settings");
    }
});


// ===== ONE TIME MESSAGE LISTENER =====
cmd.onMessage(async (conn, msg) => {
    try {
        if (!msg.message?.extendedTextMessage) return;

        const text = msg.message.extendedTextMessage.text.trim();
        const stanzaId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

        if (!stanzaId || stanzaId !== settingMessageId) return;

        const from = msg.key.remoteJid;

        const map = {
            "1.1": "MODE:public",
            "1.2": "MODE:private",
            "1.3": "MODE:group",
            "1.4": "MODE:inbox",
            "2.1": "AUTO_READ_STATUS:true",
            "2.2": "AUTO_READ_STATUS:false",
            "3.1": "AUTO_STATUS_REPLY:true",
            "3.2": "AUTO_STATUS_REPLY:false",
            "4.1": "AUTO_STATUS_REACT:true",
            "4.2": "AUTO_STATUS_REACT:false",
            "5.1": "AUTO_VOICE:true",
            "5.2": "AUTO_VOICE:false",
            "6.1": "AUTO_STICKER:true",
            "6.2": "AUTO_STICKER:false",
            "7.1": "AUTO_REPLY:true",
            "7.2": "AUTO_REPLY:false",
            "8.1": "AUTO_REACT:true",
            "8.2": "AUTO_REACT:false",
            "9.1": "HEART_REACT:true",
            "9.2": "HEART_REACT:false",
            "10.1": "OWNER_REACT:true",
            "10.2": "OWNER_REACT:false",
            "11.1": "FAKE_RECORDING:true",
            "11.2": "FAKE_RECORDING:false",
            "12.1": "ANTI_BAD:true",
            "12.2": "ANTI_BAD:false",
            "13.1": "ANTI_LINK:true",
            "13.2": "ANTI_LINK:false",
        };

        const setting = map[text];
        if (!setting) {
            await conn.sendMessage(from, { text: "❌ Invalid option" }, { quoted: msg });
            return;
        }

        await conn.sendMessage(from, { text: `✅ Updating: ${setting}` }, { quoted: msg });
        await conn.sendMessage(from, { text: `.update ${setting}` });

        // delete user reply after 2s
        setTimeout(async () => {
            await conn.sendMessage(from, { delete: msg.key });
        }, 2000);

    } catch (e) {
        console.error("SETTING LISTENER ERROR:", e);
    }
});
