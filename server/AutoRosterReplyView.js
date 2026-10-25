import { FANTASY_ROSTER_RULES } from "../src/config/FantasyRosterRules.js";

export class AutoRosterReplyView {
  createReply(chatId, result) {
    const messages = { registration: "Для автозаполнения сначала зарегистрируйтесь через /start.",
      closed: "Сейчас нет открытого тура для автозаполнения. Составы после дедлайна изменить нельзя.",
      unavailable: "Сейчас не удалось подобрать состав по бюджету, позициям и лимиту клуба. Ваш прежний состав не изменён. Попробуйте собрать его в приложении.",
      busy: "Сейчас много запросов. Попробуйте автозаполнение ещё раз через несколько секунд. Сохранённый состав не будет перезаписан." };
    if (messages[result.type]) return { method: "sendMessage", chat_id: chatId, text: messages[result.type] };
    const total = result.roster.slots.reduce((sum, slot) => sum + Number(slot.lockedPrice || 0), 0);
    const intro = result.type === "existing" ? "У вас уже сохранён состав. Автозаполнение его не изменило." : "Состав автоматически подобран и сохранён!";
    const players = result.players?.map((player) => `${player.firstName} ${player.lastName} · ${player.price}к`).join("\n");
    const deadline = new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Yekaterinburg", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(result.tour.deadlineTime));
    const url = new URL(process.env.TELEGRAM_WEB_APP_URL || "http://localhost:3000"); url.searchParams.set("roster_month", result.tour.month);
    return { method: "sendMessage", chat_id: chatId,
      text: `${intro}\n\nТур «${result.tour.title || result.tour.month}».${players ? `\n\n${players}` : ""}\n\nСтоимость: ${total}к из ${FANTASY_ROSTER_RULES.budgetLimit}к.\nРедактировать можно до ${deadline} (Екатеринбург). Цены до дедлайна могут меняться — если бюджет будет превышен, бот предупредит.`,
      reply_markup: { inline_keyboard: [[{ text: "Посмотреть состав", web_app: { url: url.toString() } }]] } };
  }
}
