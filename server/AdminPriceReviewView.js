import { PlayerPriceRecommendationFormatter } from "./PlayerPriceRecommendationFormatter.js";
import { PriceReviewBudgetFormatter } from "./PriceReviewBudgetFormatter.js";

export class AdminPriceReviewView {
  renderReport(chatId, report, requestedPage = 0) {
    const pageSize = 3;
    const lastPage = Math.max(0, Math.ceil(report.recommendations.length / pageSize) - 1);
    const page = Math.max(0, Math.min(lastPage, Math.floor(Number(requestedPage) || 0)));
    const items = report.recommendations.slice(page * pageSize, (page + 1) * pageSize);
    const warnings = report.coverage.filter((item) => !item.sufficient).map((item) => item.expected
      ? `${item.team}: загружено ${item.loaded}/${item.expected} последних прошедших матчей. Загрузите недостающие протоколы; рекомендации приостановлены.`
      : `${item.team}: нет прошедших матчей в календаре для проверки полноты.`);
    const text = ["Помощник стоимости", `Сезон ${report.season}. Анализ последних 5 и 10 матчей и всей дистанции.`,
      `Проверено игроков: ${report.total}. Рекомендаций: ${report.recommendations.length}.`,
      new PriceReviewBudgetFormatter().formatBudget(report),
      `С данными: ${report.total - (report.counts.no_data || 0)}. Без матчей за сезон: ${report.counts.no_data || 0}. Только 1–2 матча: ${report.counts.short_history || 0}.`,
      `Без изменений: ${report.counts.unchanged || 0} (учтены в расчёте). Не хватает сопоставимых игроков: ${report.counts.peers || 0}.`,
      ...warnings, "Цены не изменены. Рекомендации: шаг 1к, применение вручную.",
      ...(items.length ? items.map((item) => new PlayerPriceRecommendationFormatter().formatRecommendation(item)) : ["Обоснованных изменений по доступным данным нет."]),
      `Страница ${page + 1}/${lastPage + 1}`].join("\n\n");
    const rows = items.map((item) => [{ text: `Изменить цену: ${item.player.lastName}`, callback_data: `admin:price:${item.player.id}` }]);
    const navigation = [];
    if (page > 0) navigation.push({ text: "Назад", callback_data: `admin:price_review:${page - 1}` });
    if (page < lastPage) navigation.push({ text: "Дальше", callback_data: `admin:price_review:${page + 1}` });
    if (navigation.length) rows.push(navigation);
    rows.push([{ text: "Как считается рекомендация", callback_data: "admin:price_review_help" }],
      [{ text: "Статистика всех игроков", callback_data: "admin:price_review_players:0" }],
      [{ text: "Пересчитать", callback_data: `admin:price_review:${page}` }], [{ text: "В меню", callback_data: "admin:menu" }]);
    return this.#createReply(chatId, text, rows);
  }
  renderExplanation(chatId) {
    const text = ["Как работает помощник стоимости", "Это подсказка для админа, а не автоматическое изменение цен.",
      "Берём все завершённые матчи регулярного сезона, даже если в текущем туре игрок ещё не играл. ФО уже учитывают коэффициент лиги; повторно его не применяем. История игрока сохраняется при переходах между лигами.",
      "Веса окон: последние 5 игр — 50%, последние 10 — 30%, сезон — 20%. Окна пересекаются, чтобы недавняя форма весила больше. Неполные окна имеют меньший вес; доступные веса нормализуются. База формы: 70% среднего с ограничением выбросов + 30% медианы. Реальные ФО не меняются.",
      "Последние 1–2 игры сравниваются с более ранней медианой. Один всплеск добавляет ограниченную поправку с весом 15%, два — 50%. Стабильность и доля положительных матчей показываются отдельно; разброс уменьшает уверенность в изменении цены.",
      "Сравниваем отдачу ФО/цену только внутри текущей команды и позиции. Поэтому ценовые уровни Автомобилиста, Горняка и МХК Авто не выравниваются.",
      "Для рекомендации нужно 3 матча за сезон, независимо от тура. Полевым нужны 3 сопоставимых игрока, вратарям — 1; для вратарей уверенность ниже. При 1–2 играх показываем предварительную статистику без изменения цены. Отсутствующий матч не считается нулём.",
      "Бюджет берём из правил приложения. 60% расчётной цены — сравнение внутри команды, 40% — доля ФО игрока в сильнейшем по оценке формы составе 3+2+1 среди игроков с достаточной статистикой, с лимитом игроков клуба, умноженная на бюджет. Без данных по всем позициям бюджетный ориентир не применяется.",
      "Повышение запрещено, если после всех рекомендаций с этим игроком нельзя собрать состав в бюджет. Цены оставляем ручными, шаг ±1к. Порог отклонения: 1,5к и 20%. Направление подтверждает медиана последних 5 игр, серия из двух сильных игр либо существенное превышение бюджетной оценки для снижения.",
      "Проверяем загрузку последних 10 матчей команды, начавшихся более 4 часов назад: нужно не менее 80%. Новый тур не обнуляет историю и проверку полноты. В списке всех игроков показываем данные и причину решения по каждому.",
      "Перед изменением проверьте травмы, роль игрока и состав. Повторный расчёт после ручного изменения может дать новую рекомендацию; ограничения по числу изменений нет."].join("\n\n");
    return this.#createReply(chatId, text, [[{ text: "К расчёту", callback_data: "admin:price_review:0" }], [{ text: "В меню", callback_data: "admin:menu" }]]);
  }
  #createReply(chatId, text, rows) { return { method: "sendMessage", chat_id: chatId, text, reply_markup: { inline_keyboard: rows } }; }
}
