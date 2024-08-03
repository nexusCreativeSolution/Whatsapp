const connectToWhatsApp = require('./server');
const handleMessage = require('./messageHandler');

async function main() {
    const sock = await connectToWhatsApp();  // Connect to WhatsApp and get the socket instance

    sock.ev.on('messages.upsert', async (m) => {
        if (m.messages && m.messages.length > 0) {
            const message = m.messages[0];
            if (!message.key.fromMe) {  // Ensure the bot doesn't respond to its own messages
                await handleMessage(sock, m);  // Handle and respond to the message
            }
        }
    });
}
const mongoose = require('mongoose');

// Replace with your MongoDB URI
const mongoURI = 'mongodb+srv://casinobot:123johniphone@cluster0.nfztvsi.mongodb.net/?retryWrites=true&w=majority ';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
});
main();  // Run the main function