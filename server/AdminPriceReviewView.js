import { PlayerPriceRecommendationFormatter } from "./PlayerPriceRecommendationFormatter.js";
import { PriceReviewBudgetFormatter } from "./PriceReviewBudgetFormatter.js";

export class AdminPriceReviewView {
  renderReport(chatId, report, requestedPage = 0) {
    const pageSize = 3;
    const lastPage = Math.max(0, Math.ceil(report.recommendations.length / pageSize) - 1);
    const page = Math.max(0, Math.min(lastPage, Math.floor(Number(requestedPage) || 0)));
    const items = report.recommendations.slice(page * pageSize, (page + 1) * pageSize);
    const warnings = report.coverage.filter((item) => !item.sufficient).map((item) => item.expected
      ? `${item.team}: загружено ${item.loaded}/${item.expected} прошедших матчей. Загрузите недостающие протоколы; рекомендации приостановлены.`
      : `${item.team}: пока нет завершённых матчей текущего тура для оценки.`);
    const text = ["Помощник стоимости", report.tours[0]?.title || "Начавшихся туров пока нет.",
      `Проверено игроков: ${report.total}. Рекомендаций: ${report.recommendations.length}.`,
      new PriceReviewBudgetFormatter().formatBudget(report),
      `Без изменений: ${report.counts.unchanged || 0}. Недостаточно матчей: ${report.counts.insufficient || 0}. Недостаточно сопоставимых игроков: ${report.counts.peers || 0}.`,
      ...warnings, "Цены не изменены. Рекомендации: шаг 1к, применение вручную.",
      ...(items.length ? items.map((item) => new PlayerPriceRecommendationFormatter().formatRecommendation(item)) : ["Обоснованных изменений по доступным данным нет."]),
      `Страница ${page + 1}/${lastPage + 1}`].join("\n\n");
    const rows = items.map((item) => [{ text: `Изменить цену: ${item.player.lastName}`, callback_data: `admin:price:${item.player.id}` }]);
    const navigation = [];
    if (page > 0) navigation.push({ text: "Назад", callback_data: `admin:price_review:${page - 1}` });
    if (page < lastPage) navigation.push({ text: "Дальше", callback_data: `admin:price_review:${page + 1}` });
    if (navigation.length) rows.push(navigation);
    rows.push([{ text: "Как считается рекомендация", callback_data: "admin:price_review_help" }],
      [{ text: "Пересчитать", callback_data: `admin:price_review:${page}` }], [{ text: "В меню", callback_data: "admin:menu" }]);
    return this.#createReply(chatId, text, rows);
  }
  renderExplanation(chatId) {
    const text = ["Как работает помощник стоимости", "Это подсказка для админа, а не автоматическое изменение цен.",
      "Берём завершённые матчи текущего тура и двух предыдущих. ФО уже учитывают коэффициент лиги; повторно его не применяем. История игрока сохраняется при переходах между лигами.",
      "Веса туров: 60%, 30%, 10%. Вес уменьшается, если сыграно меньше 5 матчей; доступные веса нормализуются. База формы: 70% среднего с ограничением выбросов + 30% медианы. Реальные средние ФО в отчёте не изменяются.",
      "Последние 1–2 игры сравниваются с более ранней медианой. Один всплеск добавляет ограниченную поправку с весом 15%, два — 50%. Стабильность и доля положительных матчей показываются отдельно; разброс уменьшает уверенность в изменении цены.",
      "Сравниваем отдачу ФО/цену только внутри текущей команды и позиции. Поэтому ценовые уровни Автомобилиста, Горняка и МХК Авто не выравниваются.",
      "Полевым нужно минимум 1 матч в текущем туре, 5 всего и 3 сопоставимых игрока. Вратарям: 1, 8 и 1 соответственно. Отсутствующий матч не считается нулём.",
      "Бюджет берём из правил приложения. 60% расчётной цены — сравнение внутри команды, 40% — доля ФО игрока в сильнейшем по оценке формы составе 3+2+1 среди игроков с достаточной статистикой, с лимитом игроков клуба, умноженная на бюджет. Без данных по всем позициям бюджетный ориентир не применяется.",
      "Повышение запрещено, если после всех рекомендаций с этим игроком нельзя собрать состав в бюджет. Цены оставляем ручными, шаг ±1к. Порог отклонения: 1,5к и 20%. Направление подтверждает медиана тура, серия из двух сильных игр либо существенное превышение бюджетной оценки для снижения.",
      "Если загружено меньше 80% матчей команды, начавшихся более 4 часов назад, рекомендации для неё блокируются. Один выброс или нехватка данных не должны определять цену.",
      "Перед изменением проверьте травмы, роль игрока и состав. Повторный расчёт после ручного изменения может дать новую рекомендацию; ограничения по числу изменений нет."].join("\n\n");
    return this.#createReply(chatId, text, [[{ text: "К расчёту", callback_data: "admin:price_review:0" }], [{ text: "В меню", callback_data: "admin:menu" }]]);
  }
  #createReply(chatId, text, rows) { return { method: "sendMessage", chat_id: chatId, text, reply_markup: { inline_keyboard: rows } }; }
}
