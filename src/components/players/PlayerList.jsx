import { PlayerAvailabilityService } from "../../services/PlayerAvailabilityService.js";
import { PlayerListItem } from "./PlayerListItem.jsx";

export function PlayerList({ players, roster, onPlayerSelect, onPlayerRemove }) {
  return (
    <section className="player-list" aria-label="Список игроков">
      {players.map((player) => (
        <PlayerListItem
          key={player.getId()}
          player={player}
          isSelectable={PlayerAvailabilityService.canSelectPlayer(player, roster)}
          isSelected={PlayerAvailabilityService.isPlayerSelected(player, roster)}
          actionLabel={PlayerAvailabilityService.getSelectionLabel(player, roster)}
          onPlayerSelect={onPlayerSelect}
          onPlayerRemove={onPlayerRemove}
        />
      ))}
    </section>
  );
}
