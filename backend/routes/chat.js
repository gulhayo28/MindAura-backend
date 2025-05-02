const express = require('express');
const router = express.Router();
const axios = require('axios');

// ChatGPT API configuration
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY;
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';

// Handle chat messages
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        const response = await axios.post(
            CHATGPT_API_URL,
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Siz Umidnoma psixologik yordam platformasining AI yordamchisisiz. " +
                                "Sizning vazifangiz - foydalanuvchilarga psixologik yordam berish va ularni " +
                                "professional psixologlar bilan bog'lanishga yo'naltirish. " +
                                "Javoblaringiz qisqa, tushunarli va professional bo'lishi kerak. " +
                                "Agar foydalanuvchi jiddiy psixologik muammolarga duch kelsa, " +
                                "uni darhol professional psixolog bilan bog'lanishga undang."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            },
            {
                headers: {
                    'Authorization': `Bearer ${CHATGPT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ response: response.data.choices[0].message.content });
    } catch (error) {
        console.error('ChatGPT API error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.' });
    }
});

module.exports = router; 