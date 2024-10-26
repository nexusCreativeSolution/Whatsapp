const { delay, DisconnectReason } = require('@whiskeysockets/baileys');
const { WhatsAppClient, getCommand, getAllCommands, loadCommands } = require('easy-baileys');
const { pino } = require('pino');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
let chalk;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const customOptions = {
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    printQRInTerminal: false,
    mobile: false,
    logger: pino({ level: 'silent' })
};

(async () => {
    try {
        chalk = (await import('chalk')).default;
        console.log(chalk.cyan('Welcome to the Nexus MD!'));
        console.log(chalk.yellow('----------------------------------------'));

        const authFolderPath = './authFiles';
        const credsPath = path.join(authFolderPath, 'creds.json');

        if (fs.existsSync(credsPath)) {
            console.log(chalk.green('Existing credentials found. Attempting to reconnect...'));
            await initializeClient();
        } else {
            const userInput = await askUserForInput(
                chalk.magenta('Choose authentication method:\n') +
                chalk.blue('1. QR Code\n') +
                chalk.blue('2. Pairing Code\n') +
                chalk.yellow('Enter your choice (1 or 2): ')
            );

            if (userInput === '1') {
                customOptions.printQRInTerminal = true;
                await initializeClient();
            } else if (userInput === '2') {
                const phoneNumber = await askUserForInput(chalk.yellow('Enter your phone number without "+" and including country code (e.g., 15551234567 for US): '));
                console.log(chalk.cyan(`Pairing code will be used. Phone number entered: ${phoneNumber}`));
                await pairCode(phoneNumber);
            } else {
                console.log(chalk.red('Invalid option selected. Please restart and choose either 1 or 2.'));
                rl.close();
            }
        }
    } catch (error) {
        console.error(chalk.red('An error occurred during initialization:'), error.message);
        rl.close();
    }
})();

function askUserForInput(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function initializeClient() {
    try {
        console.log(chalk.yellow('Initializing WhatsApp client...'));
        const clientMulti = await WhatsAppClient.create("multi", './authFiles', customOptions);
        const sockMulti = await clientMulti.getSocket();

        setupConnectionListener(sockMulti);
        console.log(chalk.green('WhatsApp client initialized successfully.'));
        await loadCommands('./Commands');
        listenForMessages(sockMulti);
    } catch (error) {
        console.error(chalk.red('Error initializing WhatsApp client:'), error.message);
    } finally {
        rl.close();
    }
}

async function pairCode(phoneNumber) {
    try {
        console.log(chalk.yellow('Generating pairing code...'));
        const clientMulti = await WhatsAppClient.create("multi", './authFiles', customOptions);
        const sockMulti = await clientMulti.getSocket();
        await delay(2500);
        const pairCode = await sockMulti.requestPairingCode(phoneNumber.toString());

        setupConnectionListener(sockMulti);
        console.log(chalk.green(`Here is your Pairing Code: ${chalk.bold(pairCode)}`));
        console.log(chalk.yellow('Please enter this code in your WhatsApp mobile app to complete the pairing process.'));

        listenForMessages(sockMulti);
    } catch (error) {
        console.error(chalk.red('Error during pairing code generation:'), error.message);
    } finally {
        rl.close();
    }
}

function setupConnectionListener(sockMulti) {
    sockMulti.ev.on("connection.update", async ({ lastDisconnect, connection }) => {
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log(chalk.yellow("Connection lost. Attempting to reconnect..."));
                try {
                    await initializeClient();
                } catch (reconnectError) {
                    console.error(chalk.red("Reconnection failed:"), reconnectError.message);
                }
            } else {
                console.log(chalk.red("Logged out. Reconnection will not be attempted."));
                deleteAuthFolder('./authFiles');
            }
        } else if (connection === "open") {
            console.log(chalk.green("WhatsApp connection established successfully."));
        } else {
            console.log(chalk.blue(`Connection update: ${connection}`));
        }
    });
}

async function loadCommand(directory) {
    try {
        console.log(chalk.yellow(`Loading commands from ${directory}...`));
        const commands = await getAllCommands(directory);
        console.log(chalk.green(`${commands.length} commands loaded successfully.`));
        commands.forEach(cmd => console.log(chalk.cyan(`  - ${cmd.usage}`)));
    } catch (error) {
        console.error(chalk.red('Error loading commands:'), error.message);
    }
}

function listenForMessages(sockMulti) {
    console.log(chalk.yellow('Listening for incoming messages...'));

    sockMulti.ev.on("messages.upsert", async ({ messages }) => {
        for (const msg of messages) {
            try {
                // Ensure `msg.message` exists to avoid undefined errors
                if (!msg.message) {
                    console.error(chalk.red("Message content is undefined."));
                    continue;
                }

                const userId = msg.key.remoteJid.replace('@s.whatsapp.net', '');
                const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
                const groupId = msg.key.remoteJid;

                // Process commands if messageText is available
                if (!messageText) {
                    console.error(chalk.red("No text found in message."));
                    continue;
                }

                const response = messageText.toLowerCase();
                const { commandName, args } = parseCommand(response, ['!', '.', '/']);
                if (!commandName) continue;

                console.log(chalk.blue(`Received command: ${commandName}`));

                const command = await getCommand(commandName);
                if (!command) {
                    console.log(chalk.yellow(`Command not found: ${commandName}`));
                    continue;
                }

                await executeCommand(command, sockMulti, msg, args).catch(error => {
                    console.error("Error executing command:", error);
                });
            } catch (error) {
                console.error(chalk.red('Error handling message:'), error.message);
            }
        }
    });
}

function extractTextFromMessage(message) {
    const messageTypes = ['extendedTextMessage', 'conversation'];
    return messageTypes.reduce((text, type) => text || (message[type] && (message[type].text || message[type].caption || message[type])) || '', '').toLowerCase();
}

function parseCommand(response, prefixes) {
    if (!prefixes.some(prefix => response.startsWith(prefix))) {
        return {};
    }

    const [commandName, ...args] = response.slice(1).trim().split(/\s+/);
    return { commandName, args };
}

async function executeCommand(command, sockMulti, message, args) {
    try {
        console.log(chalk.yellow(`Executing command: ${command.name}`));
        await command.execute(sockMulti, message, args);
        console.log(chalk.green(`Command ${command.name} executed successfully.`));
    } catch (cmdError) {
        console.error(chalk.red(`Error executing command '${command.name}':`), cmdError.message);
    }
}

function deleteAuthFolder(path) {
    if (fs.existsSync(path)) {
        fs.rmSync(path, { recursive: true, force: true });
        console.log(chalk.yellow('Authentication folder deleted due to logout.'));
    } else {
        console.log(chalk.blue('No authentication folder found.'));
    }
}

mongoose.connect('mongodb+srv://casinobot:123johniphone@cluster0.nfztvsi.mongodb.net/casinobotDB?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to MongoDB Cloud successfully!");
})
.catch((err) => {
    console.error("Error connecting to MongoDB: ", err);
});
