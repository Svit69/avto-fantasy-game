# VPS deployment

1. Clone the repository to the server.
2. Create `.env` from `.env.example` and fill real values.
3. Run `npm install`.
4. Start the app with `pm2 start ecosystem.config.cjs`.
5. Put nginx in front of `http://127.0.0.1:3000`.
6. Enable HTTPS for the public domain.
7. Call `POST https://your-domain/api/telegram-set-webhook` once.
8. Keep `storage/users.json` persistent between deployments.
9. Check `GET https://your-domain/api/telegram-webhook-info` if the bot does not answer.
10. Check `pm2 logs avto-fantasy --lines 100` for Telegram webhook events.
11. Check `GET https://your-domain/api/health` to confirm nginx reaches Node.js.
12. Check `GET https://your-domain/api/telegram-bot-info` to confirm the token points to the expected bot.
13. Add draft notifications to cron:

```cron
*/15 * * * * cd /var/www/avto-fantasy-game && npm run notify:draft >> storage/notification-cron.log 2>&1
```

If Telegram reports `Connection timed out`, make sure nginx proxies
`/api/telegram-webhook` to Node.js and restart PM2 after pulling changes.

Required environment variables:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEB_APP_URL=https://your-domain
TELEGRAM_WEBHOOK_URL=https://your-domain/api/telegram-webhook
USER_DATABASE_PATH=storage/users.json
PORT=3000
```
