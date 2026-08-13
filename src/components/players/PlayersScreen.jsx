import { useState } from "react";
import { Filter, Search } from "lucide-react";
import { playerRecords } from "../../data/players.js";
import { createPlayersFromRecords } from "../../services/PlayerFactory.js";
import { PlayerFilterTabs } from "./PlayerFilterTabs.jsx";
import { PlayerList } from "./PlayerList.jsx";

const players = createPlayersFromRecords(playerRecords);

export function PlayersScreen({ roster, onPlayerSelect, onPlayerRemove }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const visiblePlayers = filterPlayersByPosition(players, activeFilter);

  return (
    <section className="players-screen">
      <div className="players-screen__header">
        <h2>ИГРОКИ</h2>
        <div>
          <button className="icon-button" type="button" aria-label="Поиск"><Search size={29} /></button>
          <button className="icon-button" type="button" aria-label="Фильтр"><Filter size={29} /></button>
        </div>
      </div>
      <PlayerFilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <PlayerList
        players={visiblePlayers}
        roster={roster}
        onPlayerSelect={onPlayerSelect}
        onPlayerRemove={onPlayerRemove}
      />
    </section>
  );
}

function filterPlayersByPosition(players, activeFilter) {
  if (activeFilter === "all") {
    return players;
  }

  return players.filter((player) => player.getPosition() === activeFilter);
}
