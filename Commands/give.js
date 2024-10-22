const User = require('../models/User');

module.exports = {
    usage: ["givegold"],
    desc: "Give some of your gold to another player.",
    commandType: "Economy",
    emoji: '🤝',

    async execute(sock, msg, args) {
        try {
            const senderId = msg.key.participant || msg.key.remoteJid; // Sender's ID
            const mentionedJids = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const targetUserId = mentionedJids.length > 0 ? mentionedJids[0] : null; // Get the first mentioned user

            if (!targetUserId) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please mention a user to give gold to." });
            }

            // Parse the amount of gold to give
            const amount = parseInt(args[1], 10);
            if (isNaN(amount) || amount <= 0) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please specify a valid amount to give." });
            }

            // Fetch the sender and target user from the database
            let sender = await User.findOne({ userId: senderId });
            let targetUser = await User.findOne({ userId: targetUserId });

            if (!sender) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ You don't have an account." });
            }

            if (!targetUser) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ The specified user does not have an account." });
            }

            // Check if the sender has enough gold
            if (sender.balance < amount) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ You don't have enough gold to complete this transaction." });
            }

            // Deduct gold from sender and add to recipient
            sender.balance -= amount;
            targetUser.balance += amount;

            await sender.save();
            await targetUser.save();

            // Send confirmation messages
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `✅ You successfully gave ${amount} coins to @${targetUserId.replace('@s.whatsapp.net', '')}. Your new balance is ${sender.balance} coins.`, 
                mentions: [targetUserId] 
            });
            await sock.sendMessage(targetUserId, { 
                text: `💰 You've received ${amount} coins from @${senderId.replace('@s.whatsapp.net', '')}! Your new balance is ${targetUser.balance} coins.` 
            });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ An error occurred: ${error.message}` });
        }
    }
};
