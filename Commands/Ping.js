module.exports = {
    usage: ["ping"],
    desc: "Checks the bot's response time.",
    commandType: "Bot",
    isGroupOnly: false,
    isAdminOnly: false,
    isPrivateOnly: false,
    emoji: '🏓', 
    

    async execute(sock, m) {
        try {
            
            const startTime = Date.now();
            const latency = Date.now() - startTime;
            await sock.reply(m, `🚀 Pong! ${latency}ms`);
        } catch (error) {
            await sock.reply(m, "❌ An error occurred while checking the ping: " + error);
        }
    }
};
