export class RosterPriceNotificationMessageFactory {
  createMessage(roster, tour) {
    const { changes, total, budget } = roster.priceAdjustment;
    const details = changes.map((change) => `${change.name}: ${change.before}к → ${change.after}к`).join("\n");
    const deadline = new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Yekaterinburg", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(tour.deadlineTime));
    return `Изменились цены игроков в вашем составе на тур «${tour.title || tour.month}».\n\n${details}\n\nСтоимость состава: ${total}к при бюджете ${budget}к. Превышение: ${total - budget}к.\n\nСостав переведён в режим редактирования. Все выбранные хоккеисты остались на местах, но заявку нужно скорректировать и сохранить заново до ${deadline} (Екатеринбург).\n\nПока вы не сохраните состав повторно, он не участвует в туре. Составы текущего и прошедших туров не изменились.`;
  }
  createApplicationButton(month) {
    const url = new URL(process.env.TELEGRAM_WEB_APP_URL || "http://localhost:3000");
    url.searchParams.set("roster_month", month);
    return { inline_keyboard: [[{ text: "Перейти в состав", web_app: { url: url.toString() } }]] };
  }
}
