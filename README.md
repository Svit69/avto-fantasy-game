# Авто Фэнтези

Мобильное web-приложение fantasy team для запуска через Telegram WebApp.

## Запуск

```bash
npm install
npm run dev
```

## Vercel

Build command: `npm run build`

Output directory: `dist`

## Telegram

Фронтенд читает пользователя из `window.Telegram.WebApp.initDataUnsafe.user`.
Для боевой авторизации нужно добавить серверную проверку `initData` бота.
