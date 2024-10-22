const fs = require('fs');
const path = require('path');

module.exports = {
    usage: ['help'],
    desc: 'List all available commands.',
    commandType: 'General',
    isGroupOnly: false,

    async execute(sock, message) {
        const commandsFolder = path.join(__dirname, '../Commands');
        const commandFiles = fs.readdirSync(commandsFolder).filter(file => file.endsWith('.js'));

        let helpMessage = '📜 **Available Commands:**\n\n';

        for (const file of commandFiles) {
            const command = require(path.join(commandsFolder, file));
            helpMessage += `✨ **${command.usage.join(', ')}** - ${command.desc}\n`;
        }

        await sock.sendMessage(message.key.remoteJid, {
            text: helpMessage
        });
    }
};
