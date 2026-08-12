import { Plus } from "lucide-react";
import { PlayerPhotoService } from "../services/PlayerPhotoService.js";

export function LineupSlot({ slot }) {
  const player = slot.getPlayer();

  return (
    <button className={slot.isFilled() ? "player-card filled" : "player-card"} type="button" aria-label={slot.getActionLabel()}>
      {slot.isFilled() ? <FilledSlot player={player} /> : <EmptySlot />}
    </button>
  );
}

function FilledSlot({ player }) {
  return (
    <>
      <span className="player-card__status" />
      <img
        className="player-card__photo"
        src={PlayerPhotoService.buildPublicPhotoUrl(player)}
        alt={player.getName()}
        onError={hideUnavailablePhoto}
      />
      <span className="player-card__fallback" aria-hidden="true">
        <img src={player.getClub().getJerseyUrl()} alt="" />
      </span>
      <small>{player.getFirstName()[0]}. {player.getLastName()}</small>
      <strong>{player.getPrice()}M</strong>
    </>
  );
}

function hideUnavailablePhoto(event) {
  event.currentTarget.style.display = "none";
}

function EmptySlot() {
  return (
    <>
      <span className="player-card__outline" aria-hidden="true" />
      <span className="player-card__plus"><Plus size={28} /></span>
      <strong>ДОБАВИТЬ</strong>
    </>
  );
}
