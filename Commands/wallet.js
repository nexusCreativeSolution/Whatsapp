const User = require('../models/User');

module.exports = {
    usage: ["wallet"],
    desc: "Check your balance or another user's balance.",
    commandType: "Economy",
    emoji: '💰',

    async execute(sock, msg, args) {
        try {
            // Keep the full JID as user ID for the command issuer
            let userId;

            // Check if the message is from a group or a direct message
            if (msg.key.remoteJid.endsWith('@g.us')) {
                // In group context, use the sender's ID
                userId = msg.key.participant; // This gets the ID of the user who sent the message
            } else {
                // Direct message context
                userId = msg.key.remoteJid.trim();
            }

            // If args[0] is provided and is a mention, get the mentioned user's ID
            let targetUserId;
            if (args[0] && args[0].startsWith('@')) {
                targetUserId = msg.mentionedJids[0]; // Use the mentioned user's full JID
            } else {
                targetUserId = userId; // Use the command issuer's ID if no mention
            }

            // Find the user in the database
            let user = await User.findOne({ userId: targetUserId });

            if (!user) {
                // If the user doesn't exist, create a new one with a default username
                user = new User({ 
                    userId: targetUserId, 
                    balance: 1000,
                    username: targetUserId // You can adjust this if you have a separate username field
                });
                await user.save();
            }

            const responseMessage = `
*🏦❯──「 𝑵𝒆𝒙𝒖𝒔 𝑩𝒂𝒏𝒌 」──❮🏦*

👤 *Account Holder:* @${targetUserId.replace('@s.whatsapp.net', '')} 
💰 *Balance:* ${user.balance} coins

*🔒 Secure your wealth and keep growing!*`;

            const imageUrl = "https://i.ibb.co/7r3bY6K/file-315.jpg"; // Valid image URL

            // Send the image message with text and mentions
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: imageUrl },
                caption: responseMessage,
                contextInfo: {
                    externalAdReply: {
                        title: "Nexus Bank",
                        body: "Join our WhatsApp Channel for updates and more!",
                        mediaType: 1,
                        mediaUrl: "https://whatsapp.com/channel/0029VacWsSl3LdQOmWZrBj0l",
                        sourceUrl: "https://whatsapp.com/channel/0029VacWsSl3LdQOmWZrBj0l",
                    },
                    mentionedJids: [targetUserId] // Pass the full JID for mentions
                },
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ An error occurred while fetching your balance: ${error.message}` });
        }
    }
};
