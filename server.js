const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter settings (e.g., 5 messages per second)
const rateLimiter = new RateLimiterMemory({ points: 5, duration: 1 });

// Message queue
const messageQueue = [];

// Function to process messages from the queue
async function processMessages(sock) {
    while (messageQueue.length > 0) {
        const message = messageQueue.shift(); // Get the next message
        try {
            await handleMessage(sock, message); // Process the message
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }
}

// Function to handle individual messages
async function handleMessage(sock, message) {
    // Add your message handling logic here
    console.log('Processing message:', JSON.stringify(message, undefined, 2));
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_multi_device');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
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
                setTimeout(connectToWhatsApp, 5000);
            } else {
                console.log('Connection closed. You need to scan the QR code again.');
            }
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        // Limit message rate
        try {
            await rateLimiter.consume(m.messages[0].key.remoteJid);
            messageQueue.push(m);
            processMessages(sock); // Process the message queue
        } catch (error) {
            console.log('Rate limit exceeded:', error);
        }
    });

    return sock;
}

module.exports = connectToWhatsApp;