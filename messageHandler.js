async function handleMessage(sock, message) {
    if (message && message.messages && message.messages[0]) {
        const msg = message.messages[0];
        const { key, message: msgContent } = msg;

        if (key && key.fromMe === false) {
            const from = key.remoteJid;
            if (from.endsWith('@g.us')) {
                console.log('Message is from a group. Ignoring.');
                return; // Exit if the message is from a group
            }

            if (msgContent && msgContent.extendedTextMessage && msgContent.extendedTextMessage.text) {
                const text = msgContent.extendedTextMessage.text.trim().toLowerCase();
                console.log(`Received message: ${text}`);

                let responseText = '';
                let imageUrl = ''; // URL of your image

                if (text === 'hi') {
                    responseText = `❀° ┄──•••───╮
          𝘽𝙊𝙏 𝙈𝙀𝙉𝙐  
   ╰───•••──┄ °❀     
   ┏━━━ʕ•㉨•ʔ━━━┓
   ⎪⚽ _.website_creation_
   ⎪⚽ _.flyer_design_
   ⎪⚽ _.telegram_bot_
   ⎪⚽ _.whatsapp_bot_
   ⎪⌲    NEXUS CREATIVE SOLUTION MENU LIST
   ┗━━━ʕ•㉨•ʔ━━━┛`;

                    imageUrl = 'https://telegra.ph/file/8365f455d4685e659391a.jpg'; // Update with your image URL
                } else if (['1', '2', '3'].includes(text)) {
                    switch (text) {
                        case '1':
                            responseText = 'You selected Website Creation. We provide custom website design and development tailored to your business needs.';
                            break;
                        case '2':
                            responseText = 'You selected Flyer Design. We create visually appealing flyers to promote your business or events.';
                            break;
                        case '3':
                            responseText = 'You selected Telegram/WhatsApp Bots. We build bots to enhance your business communication and automation.';
                            break;
                        default:
                            responseText = 'Invalid choice. Please reply with 1, 2, or 3 to select a service.';
                            break;
                    }
                } else {
                    responseText = 'I didn\'t understand that. Please reply with "Hi" to see the services or choose a service number (1, 2, or 3).';
                }

                try {
                    if (imageUrl) {
                        // Send an image from a URL along with the text message
                        await sock.sendMessage(from, { image: { url: imageUrl }, caption: responseText });
                    } else {
                        // Send text only
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
