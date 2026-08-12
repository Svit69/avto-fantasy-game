import { Info } from "lucide-react";
import { PositionGroup } from "./PositionGroup.jsx";
import { RosterMetrics } from "./RosterMetrics.jsx";
import rinkBackgroundUrl from "../assets/background.png";

const positions = ["ВРАТАРЬ", "ЗАЩИТНИКИ", "НАПАДАЮЩИЕ"];

export function TeamLineup({ roster }) {
  return (
    <section className="team-dashboard">
      <div className="team-dashboard__header">
        <div>
          <h2>МОЯ КОМАНДА</h2>
          <button className="info-chip" type="button" aria-label="Информация">
            <Info size={17} />
          </button>
        </div>
        <p><strong>{roster.countFilledSlots()}/{roster.countAvailableSlots()}</strong> ИГРОКОВ</p>
      </div>
      <RosterMetrics roster={roster} />
      <div className="rink-field">
        <img className="rink-field__background" src={rinkBackgroundUrl} alt="" />
        {positions.map((position) => (
          <PositionGroup
            key={position}
            position={position}
            slots={roster.getSlotsByPosition(position)}
          />
        ))}
      </div>
      <button className="save-button" type="button">СОХРАНИТЬ СОСТАВ</button>
    </section>
  );
}
