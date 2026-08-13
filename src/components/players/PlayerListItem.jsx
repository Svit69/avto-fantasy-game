import { Minus, Plus } from "lucide-react";
import { PlayerPhotoService } from "../../services/PlayerPhotoService.js";
import { PlayerCardMetrics } from "../../services/PlayerCardMetrics.js";

export function PlayerListItem(props) {
  const { player, isSelectable, isSelected, actionLabel } = props;
  const Icon = isSelected ? Minus : Plus;

  return (
    <article className={resolvePlayerRowClassName(isSelectable, isSelected)}>
      <img className="player-row__photo" src={PlayerPhotoService.buildPublicPhotoUrl(player)} alt={player.getName()} onError={showDefaultPhoto} />
      <div className="player-row__identity">
        <span>№{PlayerCardMetrics.calculateFantasyScore(player)}</span>
        <strong>{player.getFirstName()}<br />{player.getLastName()}</strong>
        <small>{PlayerCardMetrics.getFullPositionName(player)}</small>
      </div>
      <div className="player-row__price"><strong>{player.getPrice()}M</strong><span>ЦЕНА</span></div>
      <button className={isSelected ? "player-row__action selected" : "player-row__action"} type="button" disabled={!isSelectable && !isSelected} aria-label={actionLabel} onClick={() => handlePlayerAction(props)}>
        <Icon size={28} />
      </button>
    </article>
  );
}

function handlePlayerAction({ player, isSelected, onPlayerSelect, onPlayerRemove }) {
  if (isSelected) {
    onPlayerRemove(player.getId());
    return;
  }

  onPlayerSelect(player);
}

function showDefaultPhoto(event) {
  PlayerPhotoService.replaceMissingPhotoWithDefault(event.currentTarget);
}

function resolvePlayerRowClassName(isSelectable, isSelected) {
  if (isSelected) {
    return "player-row selected";
  }

  return isSelectable ? "player-row" : "player-row disabled";
}
