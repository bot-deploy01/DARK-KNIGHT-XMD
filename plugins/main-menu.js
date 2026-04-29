const os = require('os');
const fs = require('fs');
const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "menu",
    desc: "Show interactive menu system",
    category: "menu",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        
     let platformName = "Cloud/Vps"; // Default අගය
     const hostName = os.hostname();
     const nameLength = hostName.length;

    // Platform එක නිවැරදිව හඳුනාගැනීමේ logic එක
    if (process.env.HEROKU_APP_NAME || nameLength === 36) {
        platformName = "Heroku";
    } else if (process.env.KOYEB_APP_NAME || nameLength === 8) {
        platformName = "Koyeb";
    } else if (process.env.RAILWAY_STATIC_URL || nameLength === 12) {
        platformName = "Railway";
    } else if (process.env.RENDER_SERVICE_NAME || nameLength === 15) {
        platformName = "Render";
    } else if (process.env.PTERODACTYL || nameLength === 10) {
        platformName = "Panel";
    } else if (process.env.REPL_ID || nameLength === 12) {
        platformName = "Replit";
    } else if (process.env.SSH_TTY || nameLength === 6) {
        platformName = "VPS";
    }
        // Count total commands
        const totalCommands = Object.keys(commands).length;
        
        const menuCaption = `
╭━〔 *𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳* 〕━··๏
┃★╭──────────────
┃★│ 👑 Owner : *${config.OWNER_NAME}*
┃★│ ⚙️ Mode : *[${config.MODE}]*
┃★│ 🔣 Prefix : *[${config.PREFIX}]*
┃★│ 🚀 Platform : *${platformName}*
┃★│ 🏷️ Version : *2.0.0 Bᴇᴛᴀ*
┃★│ 📚 Commands : *${totalCommands}*
┃★│ ⏱️ Uptime: *${runtime(process.uptime())}*
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷
╭━━〔 *📜 MENU LIST* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈│ ➊ 🤖 *Ai Menu*
┃◈│ ➋ 🔄 *Convert Menu*
┃◈│ ➌ 📥 *Download Menu*
┃◈│ ➍ 😄 *Fun Menu*
┃◈│ ➎ 👥 *Group Menu*
┃◈│ ➏ 🖼️ *Imagine Menu*
┃◈│ ➐ 🏠 *Main Menu*
┃◈│ ➑ 📌 *Other Menu*
┃◈│ ➒ 👑 *Owner Menu*
┃◈│ ➓ 🔍 *Search Menu*
┃◈╰───────────┈⊷
╰──────────────┈⊷
> ${config.DESCRIPTION}`;

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
        
        const contextInfo = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363400240662312@newsletter',
                newsletterName: config.OWNER_NAME,
                serverMessageId: 143
            }
        };

        // Function to send menu image with timeout
        const sendMenuImage = async () => {
            try {
                return await conn.sendMessage(
                    from,
                    {
                        image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/brlkte.jpg' },
                        caption: menuCaption,
                        contextInfo: contextInfo
                    },
                    { quoted: FakeVCard }
                );
            } catch (e) {
                console.log('Image send failed, falling back to text');
                return await conn.sendMessage(
                    from,
                    { text: menuCaption, contextInfo: contextInfo },
                    { quoted: FakeVCard }
                );
            }
        };

        // Send image with timeout
        let sentMsg;
        try {
            sentMsg = await Promise.race([
                sendMenuImage(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Image send timeout')), 10000))
            ]);
        } catch (e) {
            console.log('Menu send error:', e);
            sentMsg = await conn.sendMessage(
                from,
                { text: menuCaption, contextInfo: contextInfo },
                { quoted: FakeVCard }
            );
        }
        
        const messageID = sentMsg.key.id;

        // Menu data (complete version)
        const menuData = {
            '1': {
                title: "🤖 *AI Menu* 🤖",
                content: `╭━━━〔 *🤖 Ai Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ • ai
┃★│ • gpt
┃★│ • gemini
┃★│ • venice
┃★│ • copilot
┃★│ • copilot2
┃★│ • openai
┃★│ • openai2
┃★│ • aiimg
┃★│ • aiimg1
┃★│ • aiimg2
┃★│ • aiimg3
┃★│ • aianime
┃★│ • imgedit
┃★│ • topromt
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷
> ${config.DESCRIPTION}`,
                image: true
            },
            '2': {
                title: "🔄 *Convert Menu* 🔄",
                content: `╭━━━〔 🔄 *Convert Menu* 〕━━━┈⊷
┃★╭────────────── 
┃★│ • attp
┃★│ • brat
┃★│ • aivoice
┃★│ • convert
┃★│ • enhance
┃★│ • binary
┃★│ • dbinary
┃★│ • base64
┃★│ • unbase64
┃★│ • fetch
┃★│ • recolor
┃★│ • readmore
┃★│ • stake
┃★│ • sticker
┃★│ • tiny
┃★│ • tourl
┃★│ • img2url
┃★│ • tts
┃★│ • tts2
┃★│ • tts3
┃★│ • toptt
┃★│ • tomp3
┃★│ • topdf
┃★│ • translate
┃★│ • urlencode
┃★│ • urldecode
┃★│ • vsticker
┃★│ • Wikipedia
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷
> ${config.DESCRIPTION}`,
                image: true
            },
            '3': {
                title: "📥 *Download Menu* 📥",
                content: `╭━━━〔 📥 *Download Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ • apk
┃★│ • apk2
┃★│ • facebook
┃★│ • fb2
┃★│ • gdrive
┃★│ • gdrive2
┃★│ • gitclone
┃★│ • image
┃★│ • img
┃★│ • instagram
┃★│ • igvid
┃★│ • ig2
┃★│ • mediafire
┃★│ • mfire2
┃★│ • mega
┃★│ • mega2
┃★│ • pinterest
┃★│ • pindl2
┃★│ • pins
┃★│ • pastpaper
┃★│ • pixeldrain
┃★│ • ringtone
┃★│ • ring2
┃★│ • spotify
┃★│ • spotify2
┃★│ • tiktok
┃★│ • tt2
┃★│ • tiks
┃★│ • twitter
┃★│ • twitt2
┃★│ • downurl
┃★│ • movie
┃★│ • xnxx
┃★│ • xvideo
┃★│ • song
┃★│ • song1
┃★│ • song2
┃★│ • song3
┃★│ • video
┃★│ • video1
┃★│ • video2
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷
> ${config.DESCRIPTION}`,
                image: true
            },
            '4': {
                title: "😄 *Fun Menu* 😄",
                content: `╭━━━〔 😄 *Fun Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ • emix
┃★│ • angry
┃★│ • confused
┃★│ • hot
┃★│ • happy
┃★│ • heart
┃★│ • moon
┃★│ • sad
┃★│ • shy
┃★│ • nikal
┃★│ • hack
┃★│ • msg
┃★│ • aura
┃★│ • 8ball
┃★│ • boy
┃★│ • girl
┃★│ • coinflip
┃★│ • character
┃★│ • compliment
┃★│ • dare
┃★│ • emoji
┃★│ • fack
┃★│ • flip
┃★│ • flirt
┃★│ • friend
┃★│ • joke
┃★│ • lovetest
┃★│ • pick
┃★│ • pickup
┃★│ • quote
┃★│ • rate
┃★│ • roll
┃★│ • repeat
┃★│ • ship
┃★│ • shapar
┃★│ • turth
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷
> ${config.DESCRIPTION}`,
                image: true
            },
            '5': {
                title: "👥 *Group Menu* 👥",
                content: `╭━━━〔 👥 *Group Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ • requestlist
┃★│ • acceptall
┃★│ • rejectall
┃★│ • add
┃★│ • invite
┃★│ • admin
┃★│ • dismiss
┃★│ • promote
┃★│ • demote
┃★│ • ginfo
┃★│ • gstates
┃★│ • hidetag
┃★│ • tagall
┃★│ • join
┃★│ • kick
┃★│ • kickall
┃★│ • kickall1
┃★│ • kickall2
┃★│ • leave
┃★│ • glink
┃★│ • lock 
┃★│ • unlock
┃★│ • mute
┃★│ • unmute
┃★│ • newgc
┃★│ • out 
┃★│ • poll
┃★│ • getonline
┃★│ • opentime
┃★│ • closetime
┃★│ • resetglink
┃★│ • tagadmins 
┃★│ • upgdesc
┃★│ • upgname
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷
> ${config.DESCRIPTION}`,
                image: true
            },
            '6': {
                title: "🖼️ *Imagine Menu 🖼️*",
                content: `╭━━━〔 🖼️ *Imagine Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ • awoo
┃★│ • dog
┃★│ • imgloli
┃★│ • maid
┃★│ • megumin
┃★│ • waifu
┃★│ • neko
┃★│ • anime
┃★│ • anime1
┃★│ • anime2
┃★│ • anime3
┃★│ • anime4
┃★│ • anime5
┃★│ • animegirl
┃★│ • animegirl1
┃★│ • animegirl2
┃★│ • animegirl3
┃★│ • animegirl4
┃★│ • animegirl5
┃★│ • imagine
┃★│ • imagine2
┃★│ • imagine3
┃★│ • wallpaper
┃★│ • wallpaper2
┃★│ • randomwall
┃★│ • getimage
┃★│ • getvideo
┃★│ • imgscan
┃★│ • image
┃★│ • topixel
┃★│ • adedit
┃★│ • bluredit
┃★│ • greyedit
┃★│ • invertedit
┃★│ • jailedit
┃★│ • jokeedit
┃★│ • nokiaedit
┃★│ • wantededit
┃★│ • removebg
┃★│ • couplepp
┃★│ • bonk
┃★│ • bully
┃★│ • blush
┃★│ • bite
┃★│ • cry
┃★│ • cuddle
┃★│ • cringe
┃★│ • dance
┃★│ • glomp
┃★│ • hug
┃★│ • happy
┃★│ • handhold
┃★│ • highfive
┃★│ • kill
┃★│ • kiss
┃★│ • lick
┃★│ • nom
┃★│ • pat
┃★│ • poke
┃★│ • smug
┃★│ • slay
┃★│ • smile
┃★│ • marige
┃★│ • wave
┃★│ • wink
┃★│ • yeet
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷
> ${config.DESCRIPTION}`,
                image: true
            },
            '7': {
                title: "🏠 *Main Menu* 🏠",
                content: `╭━━━〔 🏠 *Main Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ • alive
┃★│ • live
┃★│ • menu
┃★│ • menu2
┃★│ • ping 
┃★│ • ping2 
┃★│ • repo
┃★│ • system
┃★│ • version
┃★│ • uptime
┃★│ • restart
┃★│ • support 
┃★│ • owner
┃★│ • pair
┃★│ • bible
┃★│ • biblelist
┃★│ • logomenu
┃★│ • logo
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷
> ${config.DESCRIPTION}`,
                image: true
            },
            '8': {
                title: "📌 *Other Menu* 📌",
                content: `╭━━━〔 📌 *Other Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ • date
┃★│ • count
┃★│ • countx
┃★│ • caption
┃★│ • createapi
┃★│ • calculate
┃★│ • get
┃★│ • gpass
┃★│ • ssweb
┃★│ • person
┃★│ • timenow
┃★│ • timezone
┃★│ • tempnumber
┃★│ • tempmail
┃★│ • vcc
┃★│ • webinfo
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷
> ${config.DESCRIPTION}`,
                image: true
            },
            '9': {
                title: "👑 *Owner Menu* 👑",
                content: `╭━━━〔 👑 *Owner Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ • prefix
┃★│ • anticall
┃★│ • antilink
┃★│ • antidelete
┃★│ • block
┃★│ • unblock
┃★│ • broadcast
┃★│ • bug
┃★│ • spam
┃★│ • creact
┃★│ • ban
┃★│ • unban
┃★│ • listban
┃★│ • setsudo
┃★│ • delsudo
┃★│ • listsudo
┃★│ • vv
┃★│ • vv1
┃★│ • vv3
┃★│ • fullpp
┃★│ • setdp
┃★│ • setpp
┃★│ • getdp
┃★│ • getpp
┃★│ • update 
┃★│ • shutdown
┃★│ • clearchats
┃★│ • delete
┃★│ • poststates
┃★│ • privacy
┃★│ • blocklist
┃★│ • getbio
┃★│ • setppall
┃★│ • setonline
┃★│ • setmyname
┃★│ • updatebio
┃★│ • groupsprivacy
┃★│ • getprivacy
┃★│ • savecontact
┃★│ • setting
┃★│ • jid
┃★│ • jid2
┃★│ • gjid
┃★│ • forward
┃★│ • fwd2
┃★│ • send
┃★│ • persion
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷
> ${config.DESCRIPTION}`,
                image: true
            },
            '10': {
                title: "🔍 *Search Menu* 🔍",
                content: `╭━━━〔 🔍 *Search Menu* 〕━━━┈⊷
┃★╭──────────────      
┃★│ • app
┃★│ • check
┃★│ • cid
┃★│ • cjid
┃★│ • country
┃★│ • chinfo
┃★│ • currency
┃★│ • define
┃★│ • fancy 
┃★│ • getnumber
┃★│ • githubstalk
┃★│ • lyrics
┃★│ • npm
┃★│ • news
┃★│ • news1
┃★│ • news2
┃★│ • mvdetail
┃★│ • praytime
┃★│ • sss
┃★│ • srepo
┃★│ • stickers
┃★│ • ttstalk
┃★│ • twtstalk
┃★│ • yts
┃★│ • ytpost
┃★│ • ytstalk
┃★│ • weather
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷
> ${config.DESCRIPTION}`,
                image: true
            }
        };

        // Message handler with improved error handling
        const handler = async (msgData) => {
            try {
                const receivedMsg = msgData.messages[0];
                if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;

                const isReplyToMenu = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
                
                if (isReplyToMenu) {
                    const receivedText = receivedMsg.message.conversation || 
                                      receivedMsg.message.extendedTextMessage?.text;
                    const senderID = receivedMsg.key.remoteJid;

                    if (menuData[receivedText]) {
                        const selectedMenu = menuData[receivedText];
                        
                        try {
                            if (selectedMenu.image) {
                                await conn.sendMessage(
                                    senderID,
                                    {
                                        image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/brlkte.jpg' },
                                        caption: selectedMenu.content,
                                        contextInfo: contextInfo
                                    },
                                    { quoted: FakeVCard }
                                );
                            } else {
                                await conn.sendMessage(
                                    senderID,
                                    { text: selectedMenu.content, contextInfo: contextInfo },
                                    { quoted: FakeVCard }
                                );
                            }

                            await conn.sendMessage(senderID, {
                                react: { text: '✅', key: receivedMsg.key }
                            });

                        } catch (e) {
                            console.log('Menu reply error:', e);
                            await conn.sendMessage(
                                senderID,
                                { text: selectedMenu.content, contextInfo: contextInfo },
                                { quoted: FakeVCard }
                            );
                        }

                    } else {
                        await conn.sendMessage(
                            senderID,
                            {
                                text: `❌ *Invalid Option!* ❌\n\nPlease reply with a number between 1-11 to select a menu.\n\n*Example:* Reply with "1" for Download Menu\n\n> ${config.DESCRIPTION}`,
                                contextInfo: contextInfo
                            },
                            { quoted: FakeVCard }
                        );
                    }
                }
            } catch (e) {
                console.log('Handler error:', e);
            }
        };

        // Add listener
        conn.ev.on("messages.upsert", handler);

        // Remove listener after 5 minutes
        setTimeout(() => {
            conn.ev.off("messages.upsert", handler);
        }, 300000);

    } catch (e) {
        console.error('Menu Error:', e);
        try {
            await conn.sendMessage(
                from,
                { text: `❌ Menu system is currently busy. Please try again later.\n\n> ${config.DESCRIPTION}` },
                { quoted: FakeVCard }
            );
        } catch (finalError) {
            console.log('Final error handling failed:', finalError);
        }
    }
});
