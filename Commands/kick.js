const User = require('../models/User');

module.exports = {
    usage: ["kick"],
    desc: "Kick a user from the group. (Admin only)",
    commandType: "Moderation",
    emoji: '👢',

    async execute(sock, msg, args) {
        try {
            const groupId = msg.key.remoteJid; // Get the group ID
            const senderId = msg.key.participant || msg.key.remoteJid; // Get the sender ID

            // Check if the message contains mentions
            const mentionedJids = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (mentionedJids.length === 0) {
                return await sock.sendMessage(groupId, { text: "❌ Please mention a user to kick." });
            }

            // Fetch the group metadata
            let groupMetadata;
            try {
                groupMetadata = await sock.groupMetadata(groupId);
            } catch (error) {
                console.error("Error fetching group metadata:", error);
                return await sock.sendMessage(groupId, { text: "❌ Unable to fetch group metadata." });
            }

            // Ensure participants exist
            const participants = groupMetadata.participants || [];
            if (!participants || participants.length === 0) {
                return await sock.sendMessage(groupId, { text: "❌ No participants found in the group." });
            }

            // Check if the sender is an admin
            const isAdmin = participants.some(participant => 
                participant.id === senderId && (participant.admin === 'admin' || participant.admin === 'superadmin')
            );

            if (!isAdmin) {
                return await sock.sendMessage(groupId, { text: "❌ You don't have permission to use this command." });
            }

            const targetUserId = mentionedJids[0]; // Get the first mentioned user

            // Kick the user from the group
            const response = await sock.groupParticipantsUpdate(groupId, [targetUserId], "remove");
            console.log("Kick response:", response); // Log the response for debugging

            await sock.sendMessage(groupId, { text: `✅ User @${targetUserId.replace('@s.whatsapp.net', '')} has been kicked from the group.`, mentions: [targetUserId] });

        } catch (error) {
            console.error("Kick command error:", error); // Log the error for debugging
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ An error occurred while trying to kick the user: " + error.message });
        }
    }
};
