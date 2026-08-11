import { ChevronLeft, ChevronRight, LockKeyhole } from "lucide-react";
import { seasonMonths } from "../data/months.js";

export function MonthSelector() {
  return (
    <section className="months" aria-label="Месяцы сезона">
      <ChevronLeft className="months__chevron" aria-hidden="true" />
      {seasonMonths.map((month) => (
        <article className="month-card" key={month.title}>
          <span className="month-card__title">{month.title}</span>
          {month.isLocked ? <LockKeyhole size={22} /> : <strong>{month.points}</strong>}
          <span className="month-card__status">{month.status}</span>
        </article>
      ))}
      <ChevronRight className="months__chevron" aria-hidden="true" />
    </section>
  );
}
