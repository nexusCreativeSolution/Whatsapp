const User = require('../models/User');

module.exports = {
    usage: ["addmod"],
    desc: "Add a user as a moderator.",
    commandType: "Moderation",
    emoji: '🔧',

    async execute(sock, msg, args) {
        const adminId = "18762274821@s.whatsapp.net"; // Replace with your admin ID
        const senderId = msg.key.participant || msg.key.remoteJid; // For groups, msg.key.participant is the sender, for direct msg, it's msg.key.remoteJid.

        // Check if the command issuer is the admin
        if (senderId !== adminId) {
            return await sock.sendMessage(msg.key.remoteJid, { text: "❌ You don't have permission to use this command." });
        }

        // Check if a user is mentioned
        const mentionedJids = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const targetUserId = mentionedJids.length > 0 ? mentionedJids[0] : null; // Get the first mentioned user

        if (!targetUserId) {
            return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please mention a user to add as a moderator." });
        }

        // Check if the mentioned user exists in the database
        let user = await User.findOne({ userId: targetUserId });
        if (!user) {
            return await sock.sendMessage(msg.key.remoteJid, { text: "❌ User not found." });
        }

        // Add the mentioned user as a moderator
        user.isMod = true;
        await user.save();

        // Send confirmation
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ User @${targetUserId.replace('@s.whatsapp.net', '')} has been added as a moderator.`,
            mentions: [targetUserId] // Ensure the mentioned user is tagged in the message
        });
    }
};
