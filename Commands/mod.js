const User = require('../models/User');

module.exports = {
    usage: ["mods"],
    desc: "Show the list of bot moderators.",
    commandType: "Moderation",
    emoji: '🛠️',

    async execute(sock, msg, args) {
        try {
            // Find the owner and moderators
            const ownerId = "18762274821@s.whatsapp.net"; // Replace with your admin ID
            const owner = await User.findOne({ userId: ownerId });
            const mods = await User.find({ isMod: true });

            // Create a response message
            let responseMessage = "*🛠️❯──「 𝑴𝒐𝒅𝒆𝒓𝒂𝒕𝒐𝒓𝒔 」──❮🛠️*\n\n";

            // Add owner information
            if (owner) {
                responseMessage += `*👑 Owner:* @${owner.userId.replace('@s.whatsapp.net', '')}\n`;
            }

            // Add a separator line
            responseMessage += "──────────────────────────────\n";

            // Filter out the owner from the list of mods
            const otherMods = mods.filter(mod => mod.userId !== ownerId);

            // Check for other moderators
            if (otherMods.length === 0) {
                responseMessage += "❌ There are currently no other moderators.";
            } else {
                const modList = otherMods.map(mod => `@${mod.userId.replace('@s.whatsapp.net', '')}`).join('\n'); // Format mentions
                responseMessage += `*🔧 Moderators:*\n${modList}`;
            }

            // Send the message with mentions
            const mentions = [owner.userId, ...otherMods.map(mod => mod.userId)]; // Include owner and mods for mentions
            await sock.sendMessage(msg.key.remoteJid, {
                text: responseMessage,
                mentions: mentions,
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ An error occurred while fetching the moderators: " + error.message });
        }
    }
};
