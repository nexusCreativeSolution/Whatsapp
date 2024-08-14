const qrcode = require('qrcode-terminal');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const { makeCacheableSignalKeyStore, isJidBroadcast } = require('@whiskeysockets/baileys');

const rateLimiter = new RateLimiterMemory({ points: 5, duration: 1 });
const { pino } = require ('pino');
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
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '20.0.0'],
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        defaultQueryTimeoutMs: undefined,
        generateHighQualityLinkPreview: true,
        shouldIgnoreJid: (jid) => isJidBroadcast(jid),
        syncFullHistory: true,
        connectTimeoutMs: 1000 * 60 * 5,
        emitOwnEvents: true,
        markOnlineOnConnect: true,
        shouldSyncHistoryMessage: () => true,
        logger: pino({ level: 'silent' }),
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
