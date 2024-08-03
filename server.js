const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function connectToWhatsApp() {
    // Use a specific directory for multi-device authentication state
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_multi_device');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Automatically print QR code in terminal
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { qr, connection, lastDisconnect } = update;

        if (qr) {
            console.log('Scan the QR code with WhatsApp to login:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error != null;
            if (shouldReconnect) {
                console.log('Connection closed due to an error. Attempting to reconnect...');
                setTimeout(connectToWhatsApp, 5000); // Reconnect with a delay
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

module.exports = connectToWhatsApp;
