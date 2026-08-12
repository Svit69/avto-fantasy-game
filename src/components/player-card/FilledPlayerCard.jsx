import { X } from "lucide-react";
import { PlayerPhotoService } from "../../services/PlayerPhotoService.js";
import { PlayerCardMetrics } from "../../services/PlayerCardMetrics.js";

export function FilledPlayerCard({ player }) {
  return (
    <>
      <PlayerCardIdentity player={player} />
      <ScoreBadge player={player} />
      <PlayerTextPanel player={player} />
    </>
  );
}

function PlayerCardIdentity({ player }) {
  return (
    <section className="player-card__media" aria-label={player.getName()}>
      <img className="player-card__club-logo" src={player.getClub().getLogoUrl()} alt="" />
      <span className="player-card__remove"><X size={18} strokeWidth={3} /></span>
      <img className="player-card__photo" src={PlayerPhotoService.buildPublicPhotoUrl(player)} alt={player.getName()} onError={showDefaultPhoto} />
    </section>
  );
}

function ScoreBadge({ player }) {
  return <strong className="player-card__score">{PlayerCardMetrics.calculateFantasyScore(player)}</strong>;
}

function PlayerTextPanel({ player }) {
  return (
    <section className="player-card__info">
      <strong>{player.getLastName()}</strong>
      <span>{PlayerCardMetrics.getShortPositionName(player)}</span>
      <small>${player.getPrice()}m</small>
    </section>
  );
}

function showDefaultPhoto(event) {
  PlayerPhotoService.replaceMissingPhotoWithDefault(event.currentTarget);
}
