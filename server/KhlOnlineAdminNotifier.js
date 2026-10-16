import { AdminMatchScoreFormatter } from "./AdminMatchScoreFormatter.js";

export class KhlOnlineAdminNotifier {
  constructor({ botClient, adminIds, notificationRepository }) { Object.assign(this, { botClient, adminIds, notificationRepository }); }
  async notifyOnce(calendarMatch, stage, result = null, players = [], details = "") {
    if (!this.botClient.hasToken()) return;
    const match = result?.match || calendarMatch;
    const titles = { prepared: "Подготовка к матчу", start: "Матч начался", interim: "Промежуточный сбор",
      final: "Финальный сбор завершён", protected: "Сохранён приоритет протокола", error: "Сбор временно не выполнен" };
    const score = match.score ? ` ${new AdminMatchScoreFormatter().formatInline(match.score)}` : "";
    const names = new Map(players.map((player) => [player.id, `${player.lastName} ${player.firstName}`]));
    const stats = stage === "final" ? (result?.playerStats || []).map((stat) => `${names.get(stat.playerId) || stat.playerId}: ${stat.fantasyPoints} ФО`).join("\n") : "";
    const start = new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Yekaterinburg", dateStyle: "short", timeStyle: "short" }).format(new Date(calendarMatch.startsAt));
    const text = `КХЛ онлайн: ${titles[stage]}\n${match.homeTeam} - ${match.awayTeam}${score}\nНачало: ${start} (Екб)\nID: ${calendarMatch.khlGameId}\n${stats}\n${details}`.trim();
    for (const adminId of this.adminIds.map(String).filter(Boolean)) {
      const key = `khl-online:${calendarMatch.id}:${stage}`;
      if (await this.notificationRepository.hasNotificationBeenSent(adminId, key)) continue;
      const response = await this.botClient.callJson("sendMessage", { chat_id: adminId, text: text.slice(0, 4000) });
      if (!response.ok) throw new Error(`khl_admin_telegram_${response.error_code}`);
      await this.notificationRepository.markNotificationAsSent(adminId, key);
    }
  }
}
