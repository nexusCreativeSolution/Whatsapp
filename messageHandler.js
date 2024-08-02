async function handleMessage(sock, message) {
    if (message && message.message) {
        const { from, text } = message.message;

        // Process the message and decide how to respond
        let responseText = 'Hello! How can I assist you today?';

        // Send a simple response
        await sock.sendMessage(from, { text: responseText });
    }
}

module.exports = handleMessage;
