import { Plus } from "lucide-react";

export function EmptyPlayerCard() {
  return (
    <section className="player-card__empty">
      <span className="player-card__outline" aria-hidden="true" />
      <span className="player-card__plus"><Plus size={28} /></span>
      <strong>ДОБАВИТЬ</strong>
    </section>
  );
}
