module.exports = {
    usage: ["ping"],
    desc: "Checks the bot's response time.",
    commandType: "Bot",
    isGroupOnly: false,
    isAdminOnly: false,
    isPrivateOnly: false,
    emoji: '🏓', // Ping pong emoji for fun

    async execute(sock, m) {
        try {
            // Get the timestamp before sending the message
            const startTime = Date.now();
            const latency = Date.now() - startTime;
            await sock.reply(m, `🚀 Pong! ${latency}ms`);
        } catch (error) {
            await sock.reply(m, "❌ An error occurred while checking the ping: " + error);
        }
    }
};
