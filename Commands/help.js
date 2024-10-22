const axios = require('axios');
const fs = require('fs');
const path = require('path');

const commandDir = path.join(__dirname, '../Commands'); // Adjust path accordingly

module.exports = {
    usage: ['help'],
    desc: 'List all available commands.',
    commandType: 'General',
    isGroupOnly: false,

    async execute(sock, message) {
        const groupId = message.key.remoteJid; // Get the group ID

        // Load command files from the commands directory
        const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));
        const commands = {};

        // Organize commands by type
        for (const file of commandFiles) {
            const command = require(path.join(commandDir, file));
            if (!commands[command.commandType]) {
                commands[command.commandType] = [];
            }
            commands[command.commandType].push(command);
        }

        // Construct the help message
        let helpMessage = '📜 **Available Commands** 📜\n\n';

        // Define emojis for each command type
        const emojis = {
            'General': '🌐',
            'Moderation': '🔧',
            'Fun': '🎉',
            'Utility': '🛠️',
            'Music': '🎵',
        };

        // Build the help message with a line separator for each command type
        for (const [type, cmds] of Object.entries(commands)) {
            const emoji = emojis[type] || '📋'; // Fallback emoji
            helpMessage += `═══════════════════════\n`;
            helpMessage += `**${emoji} ${type} Commands**\n`;
            helpMessage += `═══════════════════════\n`;
            cmds.forEach(cmd => {
                const usage = cmd.usage && Array.isArray(cmd.usage) ? cmd.usage.join(', ') : 'No usage available';
                helpMessage += `* ${usage}: ${cmd.desc}\n`;
            });
            helpMessage += `\n`;
        }

        helpMessage += `═══════════════════════\n`;
        helpMessage += `©️ Nexus Inc.\n`;

        try {
            // URL to the image you want to send
            const imageUrl = 'https://i.ibb.co/qmdqMZN/file-397.jpg';

            // Fetch the image from the URL
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');

            // Send the image with the help message
            await sock.sendMessage(groupId, {
                image: imageBuffer, // Directly pass the buffer
                caption: helpMessage
            });
        } catch (error) {
            console.error('Error sending help image:', error);
            await sock.sendMessage(groupId, { text: helpMessage });
        }
    }
};  
