module.exports = {
    name: 'help',
    description: 'Displays all available commands',
    usage: 'help',
    execute: async (sockMulti, message, args) => {
        try {
            const chatId = message.key.remoteJid;

            const helpMessage = `
══════════════════════════════
   🌟 𝑩𝒐𝒕 𝑯𝒆𝒍𝒑 𝑴𝒆𝒏𝒖 🌟
══════════════════════════════
Here are the available commands:

📋 *!menu* - Display the services menu.
🛠️ *!support* - Get support information.
📝 *!request* - Submit a request for a service.
💬 *!live* - Get live chat assistance.

══════════════════════════════
   🌐 *𝑵𝒆𝒙𝑼𝑺 𝑪𝒓𝒆𝒂𝒕𝒊𝒗𝒆* 🌐
══════════════════════════════`;

            await sockMulti.sendMessage(chatId, { text: helpMessage });

            console.log('Help menu sent successfully.');
        } catch (error) {
            console.error('Error executing help command:', error.message);
        }
    }
};
