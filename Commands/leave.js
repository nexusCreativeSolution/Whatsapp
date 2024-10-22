const User = require('../models/User');

module.exports = {
    usage: ["leave"],
    desc: "Make the bot leave the group. (Mods only)",
    commandType: "Moderation",
    emoji: '👋',

    async execute(sock, msg, args) {
        try {
            const groupId = msg.key.remoteJid; // Get the group ID
            const senderId = msg.key.participant || msg.key.remoteJid; // Get the sender ID

            // Fetch the group metadata
            let groupMetadata;
            try {
                groupMetadata = await sock.groupMetadata(groupId);
            } catch (error) {
                console.error("Error fetching group metadata:", error);
                return await sock.sendMessage(groupId, { text: "❌ Unable to fetch group metadata." });
            }

            // Check if the sender is a moderator
            const isMod = await checkIfMod(senderId); // Use the checkIfMod function to verify moderator status

            if (!isMod) {
                return await sock.sendMessage(groupId, { text: "❌ You don't have permission to use this command." });
            }

            // Leave the group
            await sock.groupLeave(groupId);
            await sock.sendMessage(groupId, { text: "👋 The bot has left the group." });

        } catch (error) {
            console.error("Leave group command error:", error); // Log the error for debugging
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ An error occurred while trying to make the bot leave the group: " + error.message });
        }
    }
};

// Function to check if a user is a moderator
async function checkIfMod(userId) {
    const user = await User.findOne({ userId });
    return user ? user.isMod : false; // Return true if the user is a mod
}
