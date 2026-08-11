import { formatMillionBudget } from "../utils/budgetFormatter.js";

export function BudgetSummary({ roster }) {
  return (
    <section className="summary" aria-label="Сводка бюджета">
      <div>
        <span>БЮДЖЕТ</span>
        <strong>{formatMillionBudget(roster.calculateSpentBudget())}</strong>
        <small>/ {roster.getBudgetLimit()}M</small>
      </div>
      <div>
        <span>ОСТАЛОСЬ ИГРОКОВ</span>
        <strong>{5 - roster.countFilledSlots()}/5</strong>
      </div>
    </section>
  );
}
