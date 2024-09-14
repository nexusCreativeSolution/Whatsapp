module.exports = {
  name: 'support',
  description: 'Provides links for support and contact.',
  usage: 'support',
  execute: async (sockMulti, message, args) => {
      try {
          const chatId = message.key.remoteJid;

          const supportMessage = `
══════════════════════════════
 🌟 𝑺𝑼𝑷𝑷𝑶𝑹𝑻 𝑳𝑰𝑵𝑲𝑺 🌟
══════════════════════════════

🌐 *Website*: https://nexuscreativesolution.github.io/Nexus.site2/

💬 *Discord*: https://discord.gg/fPVhy5qs

📸 *Instagram*: https://www.instagram.com/nexus_creative_solution?igsh=dnZ0MTBwNXU5dm8x&utm_source=qre

🤖 *Telegram Bot*: https://t.me/TalkWizardBot

══════════════════════════════
 🌐 *𝑵𝒆𝒙𝑼𝑺 𝑪𝒓𝒆𝒂𝒕𝒊𝒗𝒆* 🌐
══════════════════════════════`;

          await sockMulti.sendMessage(chatId, { text: supportMessage });

          console.log('Support links sent successfully.');
      } catch (error) {
          console.error('Error executing support command:', error.message);
      }
  }
};
