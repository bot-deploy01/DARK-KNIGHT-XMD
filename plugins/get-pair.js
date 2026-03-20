const { cmd, commands } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pair",
    alias: ["getpair", "code"],
    react: "✅",
    desc: "Get 8-digit pairing code for 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳",
    category: "download",
    use: ".pair 9477xxxxxxx",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply }) => {
    try {
        // 1. අංකය පිරිසිදු කිරීම (Input Cleaning)
        let targetNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        // 2. අංකය තහවුරු කිරීම (Validation)
        if (!targetNumber || targetNumber.length < 10) {
            return await reply("❌ *වැරදි අංකයක්!* \n\nකරුණාකර රටේ කේතය සහිතව අංකය ඇතුළත් කරන්න.\nඋදා: `.pair 94771234567` ");
        }

        // Loading message එකක් යවා එහි ID එක ලබා ගැනීම
        const waitMsg = await conn.sendMessage(from, { text: "⏳ *කේතය ජනනය කරමින් පවතී...*" }, { quoted: mek });

        // 3. Pairing Server එකට Request එක යැවීම
        const apiUrl = `https://dark-knight-xmd-pair-production.up.railway.app/pair/code?number=${targetNumber}`;
        const response = await axios.get(apiUrl);

        // 4. Response එක පරීක්ෂා කිරීම
        if (response.data && response.data.code) {
            const pairingCode = response.data.code; 

            const successText = `🚀 *𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳 PAIRING SUCCESS*\n\n` +
                                `💬 *අංකය:* ${targetNumber}\n` +
                                `🔢 *Pairing Code:* \`${pairingCode}\` \n\n` +
                                `> ඉහත කේතය මත එකවරක් ටැප් කර (Tap) කොපි කරගන්න. පසුව WhatsApp 'Link with phone number' වෙත ගොස් ඇතුළත් කරන්න.`;

            // කලින් යවපු "Wait" මැසේජ් එක Edit කර සාර්ථක පණිවිඩය පෙන්වීම
            await conn.sendMessage(from, { text: successText, edit: waitMsg.key });

            // 5. තත්පර 1කට පසු කේතය පමණක් වෙනම මැසේජ් එකක් ලෙස යැවීම (පහසුවෙන් Copy කිරීමට)
            await new Promise(resolve => setTimeout(resolve, 1000));
            await reply(`\`${pairingCode}\``);

        } else {
            throw new Error("Invalid API Response");
        }

    } catch (error) {
        console.error("Pairing Error:", error);
        await reply("❌ *සමාවන්න! Pairing Code එක ලබාගත නොහැකි විය.*\nServer එක දැනට අක්‍රිය විය හැක හෝ අංකය වැරදි විය හැක.");
    }
});
