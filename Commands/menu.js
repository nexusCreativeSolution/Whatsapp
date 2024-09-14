const { extractResponseTextContent } = require('../extractResponse');  // Import listener utility

module.exports = {
    name: 'menu',
    description: 'Displays the bot menu with services and options.',
    usage: 'menu',

    execute: async (sockMulti, message, args) => {
        try {
            const chatId = message.key.remoteJid;

            const imageUrl = 'https://telegra.ph/file/c43d9eddaffe8fc301557.jpg';

            const menuMessage = `
══════════════════════════════
   🌟 𝑩𝒐𝒕 𝑴𝒆𝒏𝒖 🌟
══════════════════════════════

   1️⃣ *𝑾𝑬𝑩𝑺𝑰𝑻𝑬 𝑪𝑹𝑬𝑨𝑻𝑰𝑶𝑵*
   ➤ Custom websites to boost your online presence.

   2️⃣ *𝑭𝑳𝒀𝑬𝑹 𝑫𝑬𝑺𝑰𝑮𝑵*
   ➤ Stunning flyers for your marketing needs.

   3️⃣ *𝑻𝑬𝑳𝑬𝑮𝑹𝑨𝑴 𝑩𝒐𝒕*
   ➤ Automate and enhance your Telegram interactions.

   4️⃣ *𝑾𝑯𝑨𝑻𝑺𝑨𝑷𝑷 𝑩𝒐𝒕*
   ➤ Streamline your WhatsApp communication.

══════════════════════════════
   🌐 *𝑵𝑬𝒙𝑼𝑺 𝑪𝑹𝑬𝑨𝑻𝑰𝑽𝑬* 🌐
══════════════════════════════

🌟 _Please reply with 1, 2, 3, or 4 to select an option_
`;

            // Send the menu with the image
            const sentMessage = await sockMulti.sendMessage(chatId, {
                image: { url: imageUrl },
                caption: menuMessage,
            });

            console.log('Bot menu and image sent successfully. Waiting for user response...');

            // Wait for the user's response using the listener utility
            const userResponse = await extractResponseTextContent(sockMulti, message, sentMessage, 60000);  // 60 seconds timeout

            if (userResponse.response) {
                console.log('User response received:', userResponse.response);  // Add log to confirm response

                switch (userResponse.response) {
                    case '1':
                        await sockMulti.sendMessage(chatId, { text: 'You selected Website Creation! 🚀' });
                        break;
                    case '2':
                        await sockMulti.sendMessage(chatId, { text: 'You selected Flyer Design! 🎨' });
                        break;
                    case '3':
                        await sockMulti.sendMessage(chatId, { text: 'You selected Telegram Bot! 🤖' });
                        break;
                    case '4':
                        await sockMulti.sendMessage(chatId, { text: 'You selected WhatsApp Bot! 💬' });
                        break;
                    default:
                        console.log('Invalid option selected:', userResponse.response);
                        await sockMulti.sendMessage(chatId, { text: 'Invalid option. Please reply with 1, 2, 3, or 4.' });
                        break;
                }
            } else {
                console.log('No valid response received.');
            }

        } catch (error) {
            console.error('Error executing menu command:', error.message);
        }
    }
};
