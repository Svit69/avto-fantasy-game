import { LineupSlot } from "./LineupSlot.jsx";

export function PositionGroup({ position, slots, onAddPlayer }) {
  return (
    <section className="position-group" aria-label={position}>
      <h3>{position}</h3>
      <div className="position-group__slots">
        {slots.map((slot, index) => (
          <LineupSlot slot={slot} key={`${position}-${index}`} onAddPlayer={onAddPlayer} />
        ))}
      </div>
    </section>
  );
}
