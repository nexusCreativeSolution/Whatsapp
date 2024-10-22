const User = require('../models/User');

module.exports = {
    usage: ["gamble"],
    desc: "Gamble a certain amount and guess the direction (right or left).",
    commandType: "Economy",
    emoji: '🎲',

    async execute(sock, msg, args) {
        try {
            const userId = msg.key.remoteJid.replace('@s.whatsapp.net', '');

            if (!userId) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Could not determine user ID." });
            }

            // Fetch the user from the database
            let user = await User.findOne({ userId });
            if (!user) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "🎩 Ah, a newcomer! Step right up and use the bot to create your account for all the exciting thrills ahead!" });
            }

            // Validate the gamble amount
            const amount = parseInt(args[0], 10);
            if (isNaN(amount) || amount <= 0) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "🎲 A good gamble needs a good number! Enter something real and let the fun begin!" });
            }

            // Check if the user has enough balance
            if (user.balance < amount) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "aye mate 👋, we know you having fun but cant gamble what you dont have 😹" });
            }

            // Validate the direction choice (right or left)
            const direction = args[1]?.toLowerCase();
            if (direction !== "right" && direction !== "left") {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please choose either 'right' or 'left'." });
            }

            // Randomly determine the bot's choice
            const botChoice = Math.random() < 0.5 ? "right" : "left";

            // Initialize response variables
            let resultMessage;
            if (botChoice === direction) {
                // User wins, increase balance
                user.balance += amount;
                resultMessage = `
🎉 Congratulations! You guessed *${direction}* correctly and won *${amount}* coins!
💰 Your new balance is *${user.balance}* coins.`;
            } else {
                // User loses, decrease balance
                user.balance -= amount;
                resultMessage = `
😢 You guessed *${direction}*, but the correct direction was *${botChoice}*.
You lost *${amount}* coins. Your new balance is *${user.balance}* coins.`;
            }

            // Save the updated balance to the database
            await user.save();

            // Send the result message
            await sock.sendMessage(msg.key.remoteJid, { text: resultMessage });
        } catch (error) {
            console.error(error); // Log the error for debugging
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ An error occurred while processing your gamble: " + error.message });
        }
    }
};
