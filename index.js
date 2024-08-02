const createClient = require('./server');
const handleMessage = require('./messageHandler');

async function main() {
    const sock = await createClient();

    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        await handleMessage(sock, message);
    });
}

main();
