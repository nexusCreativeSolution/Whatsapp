const User = require('../models/User');

module.exports = {
    usage: ['slot'],
    desc: 'Play an advanced slot machine game. Minimum bet: 10,000 coins.',
    commandType: 'Fun',
    emoji: '🎰',

    async execute(sock, msg, args) {
        try {
            const groupId = msg.key.remoteJid; // Get the group or user chat ID
            const userId = msg.key.participant || msg.key.remoteJid; // Get the user ID
            const betAmount = parseInt(args[0], 10); // Parse bet amount from arguments

            // Validate bet amount
            if (isNaN(betAmount) || betAmount < 10000) {
                return await sock.sendMessage(groupId, { 
                    text: "💔 You need a minimum bet of 10,000 coins to play. Please try again!" 
                });
            }

            // Check user account
            let user = await User.findOne({ userId });
            if (!user) {
                return await sock.sendMessage(groupId, { 
                    text: "❌ You don't have an account yet. Please register to play the slot machine." 
                });
            }

            // Check if user has enough balance
            if (user.balance < betAmount) {
                return await sock.sendMessage(groupId, { 
                    text: `❌ Insufficient balance. Your current balance is ${user.balance} coins.` 
                });
            }

            // Deduct the bet amount from the user's balance
            user.balance -= betAmount;

            // Slot machine symbols and weights
            const slotEmojis = ['🍒', '🍋', '🍇', '🍉', '🔔', '⭐', '🍀', '💎', '👑'];
            const weights = [3, 3, 3, 3, 2, 2, 1, 1, 1]; // Adjusted weights for more balanced results
            const rareSymbols = ['💎', '👑']; // Rare symbols for bigger payouts

            // Function to get a random emoji based on weights
            const getRandomEmoji = () => {
                const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
                const random = Math.floor(Math.random() * totalWeight);
                let cumulativeWeight = 0;

                for (let i = 0; i < slotEmojis.length; i++) {
                    cumulativeWeight += weights[i];
                    if (random < cumulativeWeight) {
                        return slotEmojis[i];
                    }
                }
            };

            // Generate a 3x3 slot machine result
            const slots = [
                [getRandomEmoji(), getRandomEmoji(), getRandomEmoji()],
                [getRandomEmoji(), getRandomEmoji(), getRandomEmoji()],
                [getRandomEmoji(), getRandomEmoji(), getRandomEmoji()]
            ];

            // Format the slot machine result
            let slotResult = `🎰 **SLOT MACHINE** 🎰\n\n`;
            slotResult += `══════════════\n`;
            slotResult += slots.map(row => row.join(' | ')).join('\n');
            slotResult += `\n══════════════\n`;

            // Determine winnings based on the result
            let winnings = 0;
            const isJackpot = slots.some(row => row[0] === row[1] && row[1] === row[2]);
            const isRareWin = slots.some(row => rareSymbols.includes(row[0]) && row[0] === row[1] && row[1] === row[2]);
            const isSmallWin = slots.some(row => row[0] === row[1] || row[1] === row[2]);

            if (isRareWin) {
                winnings = betAmount * 5; // Rare symbol win: 5x the bet
                user.balance += winnings;
                slotResult += `👑 **MEGA JACKPOT!** You matched rare symbols and won **${winnings} coins**!\nYour new balance: ${user.balance} coins.\n`;
            } else if (isJackpot) {
                winnings = betAmount * 2; // Regular win: 2x the bet
                user.balance += winnings;
                slotResult += `🎉 **Congratulations!** You matched symbols and won **${winnings} coins**!\nYour new balance: ${user.balance} coins.\n`;
            } else if (isSmallWin) {
                winnings = betAmount * 1.5; // Small win: 1.5x the bet
                user.balance += winnings;
                slotResult += `✨ **Small win!** You matched two symbols and won **${winnings} coins**!\nYour new balance: ${user.balance} coins.\n`;
            } else {
                slotResult += `💔 **Better luck next time!** You lost **${betAmount} coins**.\nYour new balance: ${user.balance} coins.\n`;
            }

            // Save the updated user balance
            await user.save();

            // Send the slot machine result
            await sock.sendMessage(groupId, { text: slotResult });

        } catch (error) {
            console.error('Error playing advanced slot machine:', error);
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ An error occurred while playing the slot machine: ${error.message}` 
            });
        }
    }
};
