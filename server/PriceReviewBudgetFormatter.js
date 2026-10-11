export class PriceReviewBudgetFormatter {
  formatBudget(report) {
    if (!report.budget) return "Бюджет не проверен.";
    const budget = report.budget;
    const before = budget.minimumBefore === null ? "не собрать" : `${budget.minimumBefore}к`;
    const after = budget.minimumAfter === null ? "не собрать" : `${budget.minimumAfter}к`;
    return [`Бюджет: ${budget.limit}к. Состав: 3 НАП + 2 ЗАЩ + 1 ВРТ, не более ${budget.clubLimit} игроков клуба.`,
      `Самый доступный состав: ${before} → ${after} после всех рекомендаций.`,
      budget.referencePoints ? "Оценка цены: 60% сравнения внутри команды и позиции + 40% ориентира по бюджету." : "Для бюджетного ориентира формы пока недостаточно статистики по всем позициям; проверка доступности действует.",
      ...(budget.minimumAfter === null || budget.minimumAfter > budget.limit ? ["Внимание: доступный состав не найден. Нужен пересмотр цен или наличия игроков по позициям."] : []),
      `Повышений отклонено по бюджету: ${report.counts.budget || 0}.`].join("\n");
  }
}
