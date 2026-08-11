import { Minus, Plus } from "lucide-react";
import jerseyUrl from "../assets/jersey.svg";

export function LineupSlot({ slot }) {
  const Icon = slot.isFilled() ? Minus : Plus;

  return (
    <button className="slot" type="button" aria-label={slot.getActionLabel()}>
      {slot.isFilled() ? (
        <img className="slot__jersey" src={jerseyUrl} alt={slot.getPlayer().getName()} />
      ) : (
        <span className="slot__empty" aria-hidden="true" />
      )}
      <span className="slot__action">
        <Icon size={22} strokeWidth={2.6} />
      </span>
    </button>
  );
}
