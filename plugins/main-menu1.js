const config = require('../config')
const { cmd, commands } = require('../command');
const path = require('path'); 
const os = require("os")
const fs = require('fs');
const {runtime} = require('../lib/functions')
const axios = require('axios')

cmd({
    pattern: "menu2",
    alias: ["allmenu"],
    use: '.menu2',
    desc: "Show all bot commands",
    category: "menu",
    react: "📜",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
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
        
        let dec = `
╭━〔 *𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳* 〕━··๏
┃★╭──────────────
┃★│ • 👑 Owner : *${config.OWNER_NAME}*
┃★│ • ⚙️ Prefix : *[${config.PREFIX}]*
┃★│ • 🌐 Platform : *${platformName}*
┃★│ • 📦 Version : *2.0.0*
┃★│ • ⏱️ Runtime : *${runtime(process.uptime())}*
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷

╭━━〔 *🤖 Ai Menu* 〕━━┈⊷
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

╭━━〔 🔄 *Convert Menu* 〕━━┈⊷
┃★╭────────────── 
┃★│ • attp
┃★│ • caption
┃★│ • brat
┃★│ • aivoice
┃★│ • binary
┃★│ • dbinary
┃★│ • base64
┃★│ • unbase64
┃★│ • fetch
┃★│ • recolor
┃★│ • readmore
┃★│ • sticker
┃★│ • stake
┃★│ • stoimg
┃★│ • gsticker
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
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷

╭━━〔 📥 *Download Menu* 〕━━┈⊷
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

╭━━〔 😄 *Fun Menu* 〕━━┈⊷
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
┃★│ • sends 
┃★│ • repeat
┃★│ • aura
┃★│ • 8ball
┃★│ • boy
┃★│ • girl
┃★│ • coinflip
┃★│ • character
┃★│ • compliment
┃★│ • dare
┃★│ • emoji
┃★│ • fact
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
┃★│ • ship
┃★│ • shapar
┃★│ • turth
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷

╭━━〔 👥 *Group Menu* 〕━━┈⊷
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
┃★│ • gcstatus
┃★│ • hidetag
┃★│ • tagall
┃★│ • join
┃★│ • kick
┃★│ • kickall
┃★│ • removeall
┃★│ • removemembers
┃★│ • removeadmins
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
┃★│ • upgdp
┃★│ • upgdesc
┃★│ • upgname
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷

╭━━〔 🖼️ *Imagine Menu* 〕━━┈⊷
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
┃★│ • remini
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

╭━━〔 🏠 *Main Menu* 〕━━┈⊷
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
┃★│ • setting
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷

╭━━〔 📌 *Other Menu* 〕━━┈⊷
┃★╭──────────────
┃★│ • date
┃★│ • count
┃★│ • countx
┃★│ • calculate
┃★│ • createapi
┃★│ • get
┃★│ • gpass
┃★│ • sss
┃★│ • timenow
┃★│ • timezone
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷

╭━━〔 👑 *Owner Menu* 〕━━┈⊷
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
┃★│ • settings
┃★│ • jid
┃★│ • jid2
┃★│ • gjid
┃★│ • forward
┃★│ • fwd2
┃★│ • send
┃★│ • person
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷

╭━━〔 🔍 *Search Menu* 〕━━┈⊷
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
┃★│ • ssweb
┃★│ • srepo
┃★│ • stickers
┃★│ • ttstalk
┃★│ • twtstalk
┃★│ • tempnumber
┃★│ • tempmail
┃★│ • vcc
┃★│ • yts
┃★│ • ytpost
┃★│ • ytstalk
┃★│ • webinfo
┃★│ • weather
┃★│ • Wikipedia
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷
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
        
        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/brlkte.jpg' },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363400240662312@newsletter',
                        newsletterName: config.BOT_NAME,
                        serverMessageId: 143
                    }
                }
            },
            { quoted: FakeVCard });
        
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e}`);
    }
});
