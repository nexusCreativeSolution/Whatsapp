function listenForMessages(sockMulti) {
    console.log(chalk.yellow('Listening for incoming messages...'));

    sockMulti.ev.on("messages.upsert", async ({ messages }) => {
        for (const msg of messages) {
            try {
                // Ensure the message exists and is valid
                if (!msg || !msg.key || !msg.key.remoteJid) {
                    console.log(chalk.red('Invalid message format, skipping...'));
                    continue; // Skip invalid messages
                }

                const userId = msg.key.remoteJid.replace('@s.whatsapp.net', '');
                const groupId = msg.key.remoteJid;

                // Ensure message has expected properties
                const messageText = msg.message?.conversation || 
                                    msg.message?.extendedTextMessage?.text || 
                                    '';

                if (!messageText) {
                    console.log(chalk.red('No message text found, skipping...'));
                    continue; // Skip messages without text
                }

                // Process commands
                const response = extractTextFromMessage(msg.message);
                if (!response) {
                    console.log(chalk.red('No valid command found in the message, skipping...'));
                    continue; // Skip messages without a valid command
                }

                const { commandName, args } = parseCommand(response, ['!', '.', '/']);
                if (!commandName) {
                    console.log(chalk.red('No command name found, skipping...'));
                    continue; // Skip if no command name is present
                }

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
