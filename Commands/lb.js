const User = require('../models/User');

// Define user roles for the top 10 users
const roles = [
    'Godlike',     // Rank 1
    'Legend',      // Rank 2
    'Champion',    // Rank 3
    'Master',      // Rank 4
    'Expert',      // Rank 5
    'Adept',       // Rank 6
    'Journeyman',  // Rank 7
    'Apprentice',  // Rank 8
    'Rookie',      // Rank 9
    'Beginner'     // Rank 10
];

module.exports = {
    usage: ["lb"],
    desc: "Show the leaderboard of top 10 users with the most coins.",
    commandType: "Economy",
    emoji: '🏆',

    async execute(sock, msg, args) {
        try {
            // Fetch top 10 users sorted by balance
            const users = await User.find().sort({ balance: -1 }).limit(10); 
            
            if (users.length === 0) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ No users found." });
            }

            // Create a leaderboard message
            let leaderboard = "🏆 **Leaderboard** 🏆\n\n";
            users.forEach((user, index) => {
                const role = roles[index]; // Assign role based on index
                
                leaderboard += `**${index + 1}.** @${user.userId.replace('@s.whatsapp.net', '')}: ${user.balance} coins\n` +
                               `**Role:** ${role}\n` +
                               `─────────────────────\n`; // Separator line
            });

            // Send the leaderboard message
            await sock.sendMessage(msg.key.remoteJid, { text: leaderboard, mentions: users.map(user => user.userId) });

        } catch (error) {
            console.error("Leaderboard command error:", error);
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ An error occurred while fetching the leaderboard: ${error.message}` });
        }
    }
};
