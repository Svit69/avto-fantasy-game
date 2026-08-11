import { Info } from "lucide-react";
import { BudgetSummary } from "./BudgetSummary.jsx";
import { PositionGroup } from "./PositionGroup.jsx";

const positions = ["ВРАТАРЬ", "ЗАЩИТНИКИ", "НАПАДАЮЩИЕ"];

export function TeamLineup({ roster }) {
  return (
    <section className="lineup-card">
      <div className="lineup-card__header">
        <h2>СОСТАВ</h2>
        <span>{roster.countFilledSlots()}/5</span>
        <button className="icon-button" type="button" aria-label="Информация">
          <Info size={20} />
        </button>
      </div>
      <div className="lineup-field">
        {positions.map((position) => (
          <PositionGroup
            key={position}
            position={position}
            slots={roster.getSlotsByPosition(position)}
          />
        ))}
      </div>
      <button className="save-button" type="button">СОХРАНИТЬ СОСТАВ</button>
      <BudgetSummary roster={roster} />
    </section>
  );
}
