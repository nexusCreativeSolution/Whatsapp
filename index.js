const connectToWhatsApp = require('./server');
const handleMessage = require('./messageHandler');

async function main() {
    const sock = await connectToWhatsApp();

    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        await handleMessage(sock, message);
    });
}

main();
