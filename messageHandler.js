const mongoose = require('mongoose');
const LiveChat = require('./LiveChat'); // Make sure you have the LiveChat model

const GROUP_ID = '120363281584500593@g.us'; // Your group ID

async function handleMessage(sock, message) {
    if (message && message.messages && message.messages[0]) {
        const msg = message.messages[0];
        const { key, message: msgContent } = msg;

        if (key && key.fromMe === false) {
            const from = key.remoteJid;
            if (from.endsWith('@g.us') && from !== GROUP_ID) {
                console.log('Message is from a group that is not the target group. Ignoring.');
                return; // Exit if the message is from a group that is not the target group
            }

            if (msgContent && msgContent.extendedTextMessage && msgContent.extendedTextMessage.text) {
                const text = msgContent.extendedTextMessage.text.trim().toLowerCase();
                console.log(`Received message: ${text}`);

                let responseText = '';
                const imageUrl = 'https://telegra.ph/file/8365f455d4685e659391a.jpg'; // Update with your image URL

                if (from.endsWith('@g.us') || from !== GROUP_ID) {
                    // Bot menu for the group or private chat
                    if (text === '/menu' || text === 'hi') {
                        responseText = `══════════════════════════════
🌟 𝑩𝒐𝒕 𝑴𝒆𝒏𝒖 🌟
══════════════════════════════
   𝑾𝑬𝑩𝑺𝑰𝑻𝑬 𝑪𝑹𝑬𝑨𝑇𝑰𝑶𝑵
   ➤ Custom websites to boost your online presence.
   ─────────────────────────
   𝑭𝑳𝒀𝑬𝑹 𝑫𝑬𝑺𝑰𝑮𝑵
   ➤ Stunning flyers for your marketing needs.
   ─────────────────────────
   𝑻𝑬𝑳𝑬𝑮𝑹𝑨𝑴 𝑩𝒐𝒕
   ➤ Automate and enhance your Telegram interactions.
   ─────────────────────────
   𝑾𝑯𝑨𝑻𝒲𝑨𝑷𝑩 𝑩𝒐𝒕
   ➤ Streamline your WhatsApp communication.
══════════════════════════════
    🌐 𝑵𝑬𝒳𝑼𝑺 𝑪𝑹𝑬𝑨𝑻𝑰𝑽𝑬 🌐
══════════════════════════════
🌟_please select 1, 2, or 3_`;
                    } else if (['1', '2', '3'].includes(text)) {
                        switch (text) {
                            case '1':
                                responseText = 'You selected Website Creation. We provide custom websites to enhance your business.';
                                break;
                            case '2':
                                responseText = 'You selected Flyer Design. We create visually appealing flyers for your promotions.';
                                break;
                            case '3':
                                responseText = 'You selected Telegram/WhatsApp Bots. We build bots to improve your communication.';
                                break;
                        }
                    } else if (text === '/help') {
                        responseText = `Here are my commands:
- /menu: Show the bot menu.
- /help: Show this help message.
- chat: Request a live chat.
- end chat: End the current chat session.`;
                    } else if (text === 'chat') {
                        responseText = 'You have requested a live chat. An agent will be with you shortly.';

                        // Save the live chat request to MongoDB
                        await LiveChat.create({ userId: from, status: 'pending' });

                        // Notify the support group
                        const supportMessage = `🔔 New live chat request from ${from}. Please assist the user.`;
                        await sock.sendMessage(GROUP_ID, { text: supportMessage });
                    } else if (text === 'end chat') {
                        // End the chat session
                        await LiveChat.findOneAndUpdate({ userId: from }, { status: 'completed' });
                        responseText = 'Your chat session has been ended. Thank you for reaching out!';
                    } else {
                        responseText = 'I don\'t understand that. Type /help to see my commands.';
                    }
                } else {
                    responseText = 'I don\'t understand that. Type /help to see my commands.';
                }

                try {
                    if (text === 'hi' || text === '/menu') {
                        await sock.sendMessage(from, { image: { url: imageUrl }, caption: responseText });
                    } else {
                        await sock.sendMessage(from, { text: responseText });
                    }
                    console.log(`Sent message: ${responseText}`);
                } catch (error) {
                    console.error(`Failed to send message: ${error}`);
                }
            } else {
                console.log('Message content is not a text message.');
            }
        } else {
            console.log('Message sender information is not available.');
        }
    } else {
        console.log('No message content found.');
    }
}

module.exports = handleMessage;