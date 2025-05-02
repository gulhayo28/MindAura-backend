require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Create a bot instance
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Command handlers
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Assalomu alaykum! Umidnoma psixologik yordam platformasiga xush kelibsiz.\n\n` +
    `Quyidagi buyruqlardan foydalanishingiz mumkin:\n` +
    `/psychologists - Psixologlar ro'yxati\n` +
    `/help - Yordam\n` +
    `/contact - Aloqa ma'lumotlari`
  );
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Umidnoma boti orqali siz:\n\n` +
    `- Psixologlar ro'yxatini ko'rishingiz mumkin\n` +
    `- Psixologlar bilan bog'lanish mumkin\n` +
    `- Psixologik yordam olish mumkin\n\n` +
    `Buyruqlar:\n` +
    `/psychologists - Psixologlar ro'yxati\n` +
    `/help - Yordam\n` +
    `/contact - Aloqa ma'lumotlari`
  );
});

bot.onText(/\/contact/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Aloqa ma'lumotlari:\n\n` +
    `Telefon: +998 99 999 99 99\n` +
    `Email: info@umidnoma.uz\n` +
    `Manzil: Toshkent shahri, Yunusobod tumani`
  );
});

bot.onText(/\/psychologists/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const response = await axios.get('http://localhost:5000/api/psychologists');
    const psychologists = response.data;
    
    if (psychologists.length === 0) {
      bot.sendMessage(chatId, 'Hozircha psixologlar mavjud emas.');
      return;
    }
    
    psychologists.forEach(psychologist => {
      const message = 
        `👤 ${psychologist.name}\n` +
        `📚 Mutaxassislik: ${psychologist.specialization}\n` +
        `📞 Telefon: ${psychologist.phone}\n` +
        `📝 Tavsif: ${psychologist.description}\n` +
        `⭐ Reyting: ${psychologist.rating}/5`;
      
      bot.sendMessage(chatId, message);
    });
  } catch (error) {
    console.error('Error fetching psychologists:', error);
    bot.sendMessage(chatId, 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.');
  }
});

// Handle messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  
  // If the message is not a command, send a default response
  if (!msg.text.startsWith('/')) {
    bot.sendMessage(
      chatId,
      'Iltimos, quyidagi buyruqlardan birini tanlang:\n' +
      '/psychologists - Psixologlar ro\'yxati\n' +
      '/help - Yordam\n' +
      '/contact - Aloqa ma\'lumotlari'
    );
  }
}); 