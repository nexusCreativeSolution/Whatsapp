const User = require('../models/User');

module.exports = {
    usage: ["daily"],
    desc: "Claim your daily reward.",
    commandType: "Economy",
    emoji: '🌞',

    async execute(sock, msg, args) {
        try {
            // Determine the user ID based on context (group or direct message)
            let userId;
            if (msg.key.remoteJid.endsWith('@g.us')) {
                // In group context, use the participant's ID
                userId = msg.key.participant;
            } else {
                // Direct message context
                userId = msg.key.remoteJid.replace('@s.whatsapp.net', '');
            }

            if (!userId) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Unable to determine user ID." });
            }

            let user = await User.findOne({ userId });

            if (!user) {
                user = new User({ userId, balance: 1000 });
                await user.save();
            }

            const now = new Date();
            const rewardAmount = 500; // Amount to be claimed
            const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

            if (!user.lastClaim || now - user.lastClaim >= twentyFourHours) {
                // User can claim daily reward
                user.balance += rewardAmount;
                user.lastClaim = now; // Update the last claim time
                await user.save();
                await sock.sendMessage(msg.key.remoteJid, { text: `🌞 You've claimed your daily reward of ${rewardAmount} coins! Your new balance is ${user.balance} coins.` });
            } else {
                // User cannot claim yet
                const timeLeft = twentyFourHours - (now - user.lastClaim);
                const hoursLeft = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
                const minutesLeft = Math.floor((timeLeft / (1000 * 60)) % 60);
                await sock.sendMessage(msg.key.remoteJid, { text: `⏳ You have to wait ${hoursLeft} hours and ${minutesLeft} minutes before claiming your daily reward again.` });
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ An error occurred while claiming your daily reward: " + error.message });
        }
    }
};
