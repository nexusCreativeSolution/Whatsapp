const { MessageType } = require('@whiskeysockets/baileys'); // Adjust import as necessary

const User = require('../models/User'); // Adjust the path accordingly

module.exports = {
    usage: ['tagall'],
    desc: 'Tag all members in the group with a custom message.',
    commandType: 'Moderation',
    isGroupOnly: true,
    isAdminOnly: true,

    async execute(sock, message) {
        const groupId = message.key.remoteJid; // Get the group ID

        // Retrieve the message text and extract the custom message
        const response = message.message.conversation || message.message.extendedTextMessage.text || '';
        const args = response.split(' ').slice(1); // Exclude the command itself

        // Construct the custom message
        const customMessage = args.length > 0 ? args.join(' ') : 'Hello everyone!'; // Default message if none provided

        try {
            // Fetch the group members
            const group = await sock.groupMetadata(groupId);
            const participants = group.participants;

            // Arrays to hold the mentions with emojis
            const modMentions = [];
            const userMentions = [];

            // Loop through participants and check for isMod status
            for (const member of participants) {
                // Check if the user is a moderator in the database
                const user = await User.findOne({ userId: member.id }); // Adjust the field as necessary

                if (user && user.isMod) {
                    // If the user is a moderator, add to modMentions
                    modMentions.push(`👑 @${member.id.split('@')[0]}`); // Crown for moderators
                } else {
                    // If the user is not a moderator, add to userMentions
                    userMentions.push(`⭐ @${member.id.split('@')[0]}`); // Star for users
                }
            }

            // Construct the final tagging message
            let taggingMessage = '📢 **Tagging All Members** 📢\n\n';
            taggingMessage += `${customMessage}\n\n`; // Add custom message first

            if (modMentions.length > 0) {
                taggingMessage += '👑 **Moderators** 👑\n';
                taggingMessage += modMentions.join('\n') + '\n\n'; // Add moderators
            } else {
                taggingMessage += '👑 **No Moderators**\n\n'; // No moderators present
            }

            if (userMentions.length > 0) {
                taggingMessage += '⭐ **Users** ⭐\n';
                taggingMessage += userMentions.join('\n') + '\n\n'; // Add users
            } else {
                taggingMessage += '⭐ **No Users**\n\n'; // No users present
            }

            // Send the message with mentions
            await sock.sendMessage(groupId, {
                text: taggingMessage,
                mentions: participants.map(member => member.id) // Pass the actual member IDs for tagging
            });

        } catch (error) {
            console.error('Error tagging members:', error);
            await sock.reply(message, 'An error occurred while tagging members.');
        }
    }
};
