const User = require('../models/User');

// Function to check if a user is a moderator
async function checkIfMod(userId) {
    const user = await User.findOne({ userId });
    return user ? user.isMod : false; // Return true if the user is a mod
}

module.exports = {
    usage: ["addgold"],
    desc: "Add money to a user's wallet. (Mods only)",
    commandType: "Economy",
    emoji: '💵',

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
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please mention a user to add gold to." });
            }

            // Parse the amount of gold to add
            const amount = parseInt(args[1], 10);
            if (isNaN(amount) || amount <= 0) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please specify a valid amount to add." });
            }

            // Fetch the target user from the database
            let targetUser = await User.findOne({ userId: targetUserId });
            if (!targetUser) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ The specified user does not have an account." });
            }

            // Add gold to the target user's balance
            targetUser.balance += amount;
            await targetUser.save();

            // Send confirmation messages
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `💵 Successfully added ${amount} coins to @${targetUserId.replace('@s.whatsapp.net', '')}'s wallet. New balance: ${targetUser.balance} coins.`, 
                mentions: [targetUserId] 
            });
            await sock.sendMessage(targetUserId, { 
                text: `💰 You've received ${amount} coins! Your new balance is ${targetUser.balance} coins.` 
            });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ An error occurred while adding money: ${error.message}` });
        }
    }
};
