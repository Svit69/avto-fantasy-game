import { EmptyPlayerCard } from "./player-card/EmptyPlayerCard.jsx";
import { FilledPlayerCard } from "./player-card/FilledPlayerCard.jsx";

export function LineupSlot({ slot, onAddPlayer }) {
  const player = slot.getPlayer();
  const handleSlotClick = () => {
    if (!slot.isFilled()) {
      onAddPlayer("Игроки");
    }
  };

  return (
    <button className={slot.isFilled() ? "player-card selected" : "player-card"} type="button" aria-label={slot.getActionLabel()} onClick={handleSlotClick}>
      {slot.isFilled() ? <FilledPlayerCard player={player} /> : <EmptyPlayerCard />}
    </button>
  );
}
