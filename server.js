const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const sock = makeWASocket({
        auth: state,
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { qr, connection, lastDisconnect } = update;
        if (qr) {
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            if (lastDisconnect.error) {
                console.log('Connection closed due to an error. Attempting to reconnect...');
                // Optionally, you can add a delay before reconnecting to avoid rapid reconnect attempts
                setTimeout(() => connectToWhatsApp(), 5000);
            } else {
                console.log('Connection closed. You need to scan the QR code again.');
            }
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        console.log(JSON.stringify(m, undefined, 2));
    });

    return sock; // Return the socket instance
}

module.exports = connectToWhatsApp;  // Export the function
