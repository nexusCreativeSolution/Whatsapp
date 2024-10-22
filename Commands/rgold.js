const User = require('../models/User');

// Function to check if a user is a moderator
async function checkIfMod(userId) {
    const user = await User.findOne({ userId });
    return user ? user.isMod : false; // Return true if the user is a mod
}

module.exports = {
    usage: ["rwallet"],
    desc: "Remove all gold from a user's wallet. (Mods only)",
    commandType: "Economy",
    emoji: '💸',

    async execute(sock, msg, args) {
        try {
            const senderId = msg.key.participant || msg.key.remoteJid; // Use participant ID in groups, remoteJid for private messages
            const isMod = await checkIfMod(senderId); // Check if the sender is a moderator

            if (!isMod) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "🔒 You don't have the authority to use this command." });
            }

            // Extract target user ID from mentions
            const mentionedJids = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const targetUserId = mentionedJids.length > 0 ? mentionedJids[0] : null; // Get the first mentioned user
            if (!targetUserId) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please mention a user to remove gold from." });
            }

            // Fetch the target user from the database
            let targetUser = await User.findOne({ userId: targetUserId });
            if (!targetUser) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ The specified user does not have an account." });
            }

            // Clear the target user's balance
            targetUser.balance = 0;
            await targetUser.save();

            // Send confirmation messages
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `💸 Successfully cleared all coins from @${targetUserId.replace('@s.whatsapp.net', '')}'s wallet.`, 
                mentions: [targetUserId] 
            });
            await sock.sendMessage(targetUserId, { 
                text: `⚠️ Your wallet has been cleared by a moderator! Your balance is now 0 coins.` 
            });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ An error occurred while clearing the wallet: ${error.message}` });
        }
    }
};
