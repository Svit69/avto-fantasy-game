import { EmptyPlayerCard } from "./player-card/EmptyPlayerCard.jsx";
import { FilledPlayerCard } from "./player-card/FilledPlayerCard.jsx";

export function LineupSlot({ slot }) {
  const player = slot.getPlayer();

  return (
    <button className={slot.isFilled() ? "player-card selected" : "player-card"} type="button" aria-label={slot.getActionLabel()}>
      {slot.isFilled() ? <FilledPlayerCard player={player} /> : <EmptyPlayerCard />}
    </button>
  );
}
