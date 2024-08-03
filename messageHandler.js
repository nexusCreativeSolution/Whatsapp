async function handleMessage(sock, message) {
    if (message && message.messages && message.messages[0]) {
        const msg = message.messages[0];
        const { key, message: msgContent } = msg;

        // Ensure 'key' and 'from' are defined
        if (key && key.fromMe === false) {
            const from = key.remoteJid;
            if (msgContent && msgContent.extendedTextMessage && msgContent.extendedTextMessage.text) {
                const text = msgContent.extendedTextMessage.text;
                console.log(`Received message: ${text}`);

                // Process the message and decide how to respond
                let responseText = '';
                if (text.toLowerCase() === 'hi') {
                    responseText = 'Hello! How can I assist you today?';
                } else {
                    responseText = 'I can help with various tasks. Type "Hi" to get started.';
                }

                // Send a response message
                try {
                    await sock.sendMessage(from, { text: responseText });
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