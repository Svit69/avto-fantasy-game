import { TrendingUp } from "lucide-react";
import { formatMillionBudget } from "../utils/budgetFormatter.js";

export function RosterMetrics({ roster }) {
  return (
    <section className="metrics" aria-label="Показатели команды">
      <MetricCard title="БЮДЖЕТ" value={formatMillionBudget(roster.getBudgetLimit())} detail="/ 100.0M" />
      <MetricCard title="ОСТАЛОСЬ ВЫБОРОВ" value={`${roster.countAvailableSlots() - roster.countFilledSlots()}/${roster.countAvailableSlots()}`} />
      <MetricCard title="ПРОГНОЗИРУЕМЫЕ ОЧКИ" value="256" icon={<TrendingUp size={16} />} />
    </section>
  );
}

function MetricCard({ title, value, detail, icon }) {
  return (
    <article className="metric-card">
      <span>{title}{icon}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  );
}
