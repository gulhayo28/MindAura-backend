# Umidnoma - Psixologik Yordam Platformasi

Umidnoma - bu professional psixologlar bilan bog'lanish uchun platforma. Platforma orqali foydalanuvchilar psixologlar bilan bog'lanishlari va psixologik yordam olishlari mumkin.

## Loyiha tuzilishi

Loyiha quyidagi qismlardan iborat:

- Backend (Node.js + Express)
- Frontend (React)
- Telegram Bot

## O'rnatish

### Backend

1. `backend` papkasiga o'ting:
```bash
cd backend
```

2. Kerakli paketlarni o'rnating:
```bash
npm install
```

3. `.env` faylini yarating va quyidagi o'zgaruvchilarni to'ldiring:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/umidnoma
JWT_SECRET=your_jwt_secret_key
```

4. Serverni ishga tushiring:
```bash
npm run dev
```

### Frontend

1. `frontend` papkasiga o'ting:
```bash
cd frontend
```

2. Kerakli paketlarni o'rnating:
```bash
npm install
```

3. Frontendni ishga tushiring:
```bash
npm start
```

### Telegram Bot

1. `telegram_bot` papkasiga o'ting:
```bash
cd telegram_bot
```

2. Kerakli paketlarni o'rnating:
```bash
npm install
```

3. `.env` faylini yarating va quyidagi o'zgaruvchilarni to'ldiring:
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
API_URL=http://localhost:5000
```

4. Botni ishga tushiring:
```bash
npm start
```

## Foydalanish

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Telegram Bot: @your_bot_username

## Imkoniyatlar

- Psixologlar ro'yxati
- Psixologlar bilan bog'lanish
- Psixologik yordam olish
- Telegram orqali psixologlar bilan muloqot
- Maxfiy suhbatlar
- Professional yordam

## Texnologiyalar

- Backend: Node.js, Express, MongoDB
- Frontend: React, Tailwind CSS
- Telegram Bot: node-telegram-bot-api 