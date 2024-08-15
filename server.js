const qrcode = require('qrcode-terminal');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { default: makeWASocket, useMultiFileAuthState, delay, makeInMemoryStore } = require('@whiskeysockets/baileys');
const { makeCacheableSignalKeyStore, isJidBroadcast } = require('@whiskeysockets/baileys');
const readline = require('readline');
const { pino } = require('pino');

// Set up readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Message queue
const messageQueue = [];
const rateLimiter = new RateLimiterMemory({ points: 5, duration: 1 });
const store = makeInMemoryStore();

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

    store?.bind(sock.ev);

    sock.ev.on('creds.update', saveCreds);

    // Pairing code for Web clients
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('Please enter your mobile phone number:\n');
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`Pairing code: ${code}`);
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error != null;
            if (shouldReconnect) {
                console.log('Connection closed due to an error. Attempting to reconnect...');
                setTimeout(connectToWhatsApp, 5000);
            } else {
                console.log('Connection closed. You need to generate a new pairing code.');
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

// Helper function to get user input
function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

connectToWhatsApp();

module.exports = connectToWhatsApp;
