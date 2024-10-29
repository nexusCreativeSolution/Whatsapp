const fs = require('fs'); // Import the fs module
const path = require('path'); // Import the path module
const User = require('../models/User'); // Import the User model

module.exports = {
    usage: ["info"],
    desc: "Displays bot information and statistics.",
    commandType: "General",
    emoji: 'ℹ️',

    async execute(sock, msg, args) {
        try {
            // Retrieve total user count
            const totalUsers = await User.countDocuments({});

            // Retrieve total mod count
            const totalMods = await User.countDocuments({ isMod: true });

            // Count the total number of command files in the Commands directory
            const commandsDir = path.join(__dirname, '../Commands');
            const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
            const totalCommands = commandFiles.length;

            // Example uptime (this can be modified to calculate real uptime)
            const uptime = process.uptime();
            const uptimeString = new Date(uptime * 1000).toISOString().substr(11, 8); // Convert seconds to HH:MM:SS

            // Memory usage
            const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // Convert bytes to MB

            // CPU usage (this is just an example; you might want to use a library for accurate monitoring)
            const cpuUsage = Math.random() * 100; // Placeholder, use actual calculation if needed

            // Bot version (you can replace it with your actual version)
            const botVersion = "5.0"; 

            // Bot owner's name (replace with actual owner)
            const botOwner = "PRINCE JAY"; 

            // Create the response message
            const responseMessage = `
*⛩️❯─「NEXUS-Md」─❮⛩️*

🚀 *Commands:* ${totalCommands} 

🚦 *Uptime:* ${uptimeString}

🌑 *Users:* ${totalUsers}

👽 *Mods:* ${totalMods}

🛡 *Groups:* Not available in the current schema

💻 *Memory Used:* ${memoryUsage.toFixed(2)} MB

🖥️ *CPU Usage:* ${cpuUsage.toFixed(2)}%

🤖 *Bot Version:* ${botVersion}

👤 *Bot Owner:* *${botOwner}*
            `;

            // Send the message with context info including the copyright notice
            await sock.sendMessage(msg.key.remoteJid, {
                text: responseMessage,
                contextInfo: {
                    mentionedJid: [],
                    "forwardingScore": 0,
                    "isForwarded": false,
                    "externalAdReply": {
                        title: "©️NEXUS-MD",
                        body: "",
                        mediaType: 2,
                        mediaUrl: "", // You can add a URL if you have one
                        thumbnail: Buffer.from([]) // You can add a Buffer of an image if you want
                    }
                }
            });
        } catch (error) {
            console.error("Error executing info command:", error);
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ An error occurred while fetching bot info." });
        }
    }
};
