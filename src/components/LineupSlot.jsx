import { Minus, Plus } from "lucide-react";

export function LineupSlot({ slot }) {
  const Icon = slot.isFilled() ? Minus : Plus;
  const player = slot.getPlayer();

  return (
    <button className="slot" type="button" aria-label={slot.getActionLabel()}>
      {slot.isFilled() ? (
        <img className="slot__jersey" src={player.getClub().getJerseyUrl()} alt={player.getName()} />
      ) : (
        <span className="slot__empty" aria-hidden="true" />
      )}
      <span className="slot__action">
        <Icon size={22} strokeWidth={2.6} />
      </span>
    </button>
  );
}
