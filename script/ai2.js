const axios = require('axios');

module.exports.config = {
  name: 'ai2',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['ai2'],
  description: "Ask AI a question",
  usage: "ai2 [question]",
  credits: 'churchill',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const prompt = args.join(" ");
  const threadID = event.threadID;
  const senderID = event.senderID;
  const messageID = event.messageID;

  if (!prompt) {
    api.sendMessage('Please provide a question, ex: ai2 what is love?', threadID, messageID);
    return;
  }

  const responseMessage = await new Promise((resolve, reject) => {
    
    api.sendMessage({
      body: '✍️ 𝚈𝙸 𝙰𝙽𝚂𝚆𝙴𝚁𝙸𝙽𝙶...',
      mentions: [{ tag: senderID, id: senderID }],
    }, threadID, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    }, messageID);
  });

  const apiUrl = `https://hiroshi-rest-api.replit.app/ai/yi?ask=${encodeURIComponent(prompt)}`;

  try {
    const startTime = Date.now();
    const response = await axios.get(apiUrl);
    const result = response.data;
    const aiResponse = result.response; 
    const endTime = Date.now();
    const responseTime = ((endTime - startTime) / 1000).toFixed(2);

    api.getUserInfo(senderID, async (err, ret) => {
      if (err) {
        console.error('Error fetching user info:', err);
        await api.editMessage('Error fetching user info.', responseMessage.messageID);
        return;
      }

      const userName = ret[senderID].name;
      const formattedResponse = `✌️ 𝚈𝙸 𝙰𝙸
━━━━━━━━━━━━━━━━━━
${aiResponse}
━━━━━━━━━━━━━━━━━━
🗣 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${userName}
⏰ 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎 𝚃𝚒𝚖𝚎: ${responseTime}s`;

      try {
        // Edit the initial message with the AI's response
        await api.editMessage(formattedResponse, responseMessage.messageID);
      } catch (error) {
        console.error('Error editing message:', error);
        api.sendMessage('Error editing message: ' + error.message, threadID, messageID);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = `⚠️ Error: ${error.message}. Please try again later.`;
    await api.editMessage(errorMessage, responseMessage.messageID);
  }
};
