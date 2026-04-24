const axios = require("axios");
const { cmd } = require("../command");
const { fetchJson, getBuffer } = require('../lib/functions');
const { Sticker, StickerTypes } = require('wa-sticker-formatter'); 

// --- 1. LOGO LIST---
cmd({
    pattern: "logo",
    react: "✨",
    desc: "Logo maker with format selection",
    category: "image",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    try {
        if (!q) return reply("❌ *Example:* .logo Dark");

        const data = await fetchJson('https://www.ominisave.com/api/logo-list');
        const types = data.types;

        if (!types || !Array.isArray(types)) return reply("❌ API ERROR.");

        let listMsg = `✨ *LOGO MAKER LIST* ✨\n\n`;
        listMsg += `📝 *Name:* ${q}\n\n`;
        listMsg += `*Patterns:*\n`;

        types.forEach((item, index) => {
            listMsg += `*${index + 1}.* ${item}\n`;
        });

        listMsg += `\n> *🔢 Please Reply Below Number.*`;

        await conn.sendMessage(m.chat, { text: listMsg }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply("❌ Error: " + e.message);
    }
});

// --- 2. REPLY LISTENER ---
cmd({
    on: "body"
}, async (conn, mek, m, { body, reply }) => {
    try {
     
        if (!m.quoted) return;
        
        const quotedText = m.quoted.text || m.quoted.conversation || "";
        if (!quotedText) return;

        
        const selection = body.trim();
        if (isNaN(selection)) return;
        const num = parseInt(selection);


        
        if (quotedText.includes("LOGO MAKER LIST")) {
            
            
            if (!quotedText.includes("Name:* ")) return;
            const name = quotedText.split("Name:* ")[1].split("\n")[0].trim();

            
            const lines = quotedText.split("\n");
            const targetLine = lines.find(l => l.includes(`*${num}.*`));
            if (!targetLine) return;

            const type = targetLine.split(".* ")[1].trim();

            if (type) {
                
                let formatMsg = `⚙️ *FORMAT SELECTION* ⚙️\n\n`;
                formatMsg += `📝 *Name:* ${name}\n`;
                formatMsg += `🎨 *Pattern:* ${type}\n\n`;
                formatMsg += `*1.* 🖼️ Image\n`;
                formatMsg += `*2.* 📄 Document\n`;
                formatMsg += `*3.* ✨ Sticker\n\n`;
                formatMsg += `> *🔢 Please Reply Below Number.*`;

                return await conn.sendMessage(m.chat, { text: formatMsg }, { quoted: mek });
            }
        }


        
        if (quotedText.includes("FORMAT SELECTION")) {
            
            
            if (![1, 2, 3].includes(num)) return reply("❌ *Number Reply Error.*");

            
            if (!quotedText.includes("Name:* ")) return;
            const name = quotedText.split("Name:* ")[1].split("\n")[0].trim();

            
            if (!quotedText.includes("Pattern:* ")) return;
            const type = quotedText.split("Pattern:* ")[1].split("\n")[0].trim();

            if (name && type) {
                reply(`🔄 *Generating ${type} logo...*`);

                
                const logoUrl = `https://www.ominisave.com/api/logo?name=${encodeURIComponent(name)}&type=${type}`;
                const buffer = await getBuffer(logoUrl);

                
                if (num === 1) {
                    await conn.sendMessage(m.chat, {
                        image: buffer,
                        caption: `✨ *Logo Generated*\n\n📌 *Type:* ${type}\n📝 *Name:* ${name}`
                    }, { quoted: mek });
                } 
               
                else if (num === 2) {
                    await conn.sendMessage(m.chat, {
                        document: buffer,
                        mimetype: 'image/png',
                        fileName: `DARK-KNIGHT_${type}_logo.png`,
                        caption: `✨ *Logo Document*\n\n📌 *Type:* ${type}\n📝 *Name:* ${name}`
                    }, { quoted: mek });
                } 
                
                else if (num === 3) {
                    let sticker = new Sticker(buffer, {
                        pack: `Logo-${type.toUpperCase()}`,
                        author: "DARK-KNIGHT",
                        type: StickerTypes.FULL,
                        categories: ['🤩', '🎉'],
                        quality: 80, 
                        background: 'transparent'
                    });
                    const stickerBuffer = await sticker.build();
                    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: mek });
                }
            }
        }

    } catch (e) {
        console.log("Listener Error:", e);
    }
});


cmd({
    pattern: "logo2",
    alias: ["logomenu"],
    desc: "menu the bot",
    category: "menu",
    react: "🎀",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `
╭━━〔 🎨 *Logo Menu* 〕━━┈⊷
┃★╭──────────────
┃★│ • 3dcomic
┃★│ • 3dpaper
┃★│ • america
┃★│ • angelwings
┃★│ • bear
┃★│ • bulb
┃★│ • boom
┃★│ • birthday
┃★│ • blackpink
┃★│ • cat
┃★│ • clouds
┃★│ • castle
┃★│ • deadpool
┃★│ • dragonball
┃★│ • devilwings
┃★│ • eraser
┃★│ • frozen
┃★│ • futuristic
┃★│ • galaxy
┃★│ • hacker
┃★│ • leaf
┃★│ • luxury
┃★│ • naruto
┃★│ • nigeria
┃★│ • neonlight
┃★│ • paint
┃★│ • pornhub
┃★│ • sans
┃★│ • sunset
┃★│ • sadgirl
┃★│ • thor
┃★│ • tatoo
┃★│ • typography
┃★│ • valorant
┃★│ • zodiac
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷‎`;

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
                image: { url: `https://files.catbox.moe/brlkte.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363400240662312@newsletter',
                        newsletterName: "𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳",
                        serverMessageId: 143
                    }
                }
            },
            { quoted: FakeVCard }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
