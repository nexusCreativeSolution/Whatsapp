const User = require('../models/User');

module.exports = {
    usage: ['slot'],
    desc: 'Play an advanced slot machine game. Minimum bet: 10,000 coins.',
    commandType: 'Fun',
    emoji: '🎰',

    async execute(sock, msg, args) {
        try {
            const groupId = msg.key.remoteJid; // Group or user chat ID
            const userId = msg.key.participant || msg.key.remoteJid; // User ID
            const betAmount = parseInt(args[0], 10); // Bet amount

            if (isNaN(betAmount) || betAmount < 10000) {
                return await sock.sendMessage(groupId, { text: "💔yh you have been gambling yes🤷‍♂️ but this leauge require a minimum of 10,000 coins to play😂" });
            }

            let user = await User.findOne({ userId });

            if (!user) {
                return await sock.sendMessage(groupId, { text: "❌ You don't have an account yet. Please register to play the slot machine." });
            }

            if (user.balance < betAmount) {
                return await sock.sendMessage(groupId, { text: `❌ You don't have enough coins. Your current balance is ${user.balance} coins.` });
            }

            // Deduct the bet amount from the user's balance
            user.balance -= betAmount;

            // Slot machine configuration
            const slotEmojis = ['🍒', '🍋', '🍇', '🍉', '🔔', '⭐', '🍀', '💎', '👑'];
            const rareSymbols = ['💎', '👑']; // Rare symbols for bigger payouts

            // Create a more balanced random function
            const getRandomEmoji = () => {
                // Increase the chance of getting some common symbols
                const weights = [3, 3, 3, 3, 2, 2, 1, 1, 1]; // Higher weight = more frequent appearance
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

            // Generate a 3x3 slot machine result (3 rows, 3 columns)
            const slots = [
                [getRandomEmoji(), getRandomEmoji(), getRandomEmoji()],
                [getRandomEmoji(), getRandomEmoji(), getRandomEmoji()],
                [getRandomEmoji(), getRandomEmoji(), getRandomEmoji()]
            ];

            // Display the slot machine result
            let slotResult = `🎰 **SLOT MACHINE** 🎰\n\n`;
            slotResult += `══════════════\n`;
            slotResult += slots.map(row => row.join(' | ')).join('\n');
            slotResult += `\n══════════════\n`;

            // Win conditions: 
            // 1. Three matching symbols on any row.
            // 2. Two matching symbols on any row for a smaller reward.
            // 3. Three matching rare symbols for higher reward.
            let isJackpot = false;
            let isRareWin = false;
            let isSmallWin = false;
            let winnings = 0;

            for (const row of slots) {
                if (row[0] === row[1] && row[1] === row[2]) {
                    if (rareSymbols.includes(row[0])) {
                        isRareWin = true;
                    } else {
                        isJackpot = true;
                    }
                } else if (row[0] === row[1] || row[1] === row[2]) {
                    isSmallWin = true;
                }
            }

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
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ An error occurred while playing the slot machine: ${error.message}` });
        }
    }
};
