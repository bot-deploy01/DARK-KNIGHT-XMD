const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

// Function to extract display number from any ID format
function extractDisplayNumber(id) {
    if (!id) return 'Unknown';
    if (id.includes(':')) {
        return id.split(':')[0];
    }
    if (id.includes('@')) {
        return id.split('@')[0];
    }
    return id;
}

// Multi-choice poll command (allows selecting multiple options)
cmd({
    pattern: "mpoll",
    alias: ["multipoll", "multichoice"],
    react: "📊",
    category: "group",
    desc: "Create a multi-choice poll (can select multiple options).",
    use: ".mpoll question;option1,option2,option3",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, q, reply }) => {
    try {
        // Check if in group
        if (!isGroup) {
            return reply("❌ Polls work best in groups. Please use this command in a group.");
        }

        // Get sender ID with LID support
        const senderId = mek.key.participant || mek.key.remoteJid || (mek.key.fromMe ? conn.user?.id : null);
        
        // Check if input is provided
        if (!q || q.trim() === '') {
            return reply(`📊 *How to Create a Multi-Choice Poll*\n\n*Format:*\n${prefix}mpoll question;option1,option2,option3\n\n*Example:*\n${prefix}mpoll What foods do you like?;Pizza,Burger,Pasta,Sushi\n\n*Note:* Users can select multiple options!`);
        }

        // Parse input
        let [question, optionsString] = q.split(";");

        // Validate question and options
        if (!question || question.trim() === '') {
            return reply("❌ Please provide a question for the poll.");
        }

        if (!optionsString || optionsString.trim() === '') {
            return reply("❌ Please provide options for the poll.");
        }

        // Clean and parse options
        let options = [];
        for (let option of optionsString.split(",")) {
            const trimmedOption = option.trim();
            if (trimmedOption !== "" && !options.includes(trimmedOption)) {
                options.push(trimmedOption);
            }
        }

        // Validate options count
        if (options.length < 2) {
            return reply("❌ Please provide at least 2 different options.");
        }

        if (options.length > 12) {
            return reply("❌ Maximum 12 options allowed.");
        }

        question = question.trim();

        // Show processing
        await conn.sendMessage(from, { react: { text: '📊', key: mek.key } });

        // Create multi-choice poll
        await conn.sendMessage(from, {
            poll: {
                name: question,
                values: options,
                selectableCount: options.length,  // Allow selecting all options
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Multi-poll command error:", e);
        return reply(`❌ An error occurred.\n\n_Error:_ ${e.message}`);
    }
});


cmd({
  pattern: "poll",
  category: "group",
  desc: "Create a poll with a question and options in the group.",
  filename: __filename,
}, async (conn, mek, m, { from, isGroup, body, sender, groupMetadata, participants, prefix, pushname, reply }) => {
  try {
    let [question, optionsString] = body.split(";");
    
    if (!question || !optionsString) {
      return reply(`Usage: ${prefix}poll question;option1,option2,option3...`);
    }

    let options = [];
    for (let option of optionsString.split(",")) {
      if (option && option.trim() !== "") {
        options.push(option.trim());
      }
    }

    if (options.length < 2) {
      return reply("*Please provide at least two options for the poll.*");
    }

    await conn.sendMessage(from, {
      poll: {
        name: question,
        values: options,
        selectableCount: 1,
        toAnnouncementGroup: true,
      }
    }, { quoted: mek });
  } catch (e) {
    return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${e.message}`);
  }
});
