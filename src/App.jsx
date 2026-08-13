import { useState } from "react";
import { AppShell } from "./components/AppShell.jsx";
import { TelegramGateway } from "./services/TelegramGateway.js";
import { buildInitialRoster } from "./services/RosterFactory.js";

const telegramGateway = new TelegramGateway(window);
const initialRoster = buildInitialRoster();

export function App() {
  const [activeSection, setActiveSection] = useState("Состав");
  const [roster, setRoster] = useState(initialRoster);
  const handlePlayerSelect = (player) => {
    setRoster((currentRoster) => currentRoster.addPlayer(player));
    setActiveSection("Состав");
  };
  const handlePlayerRemove = (playerId) => {
    setRoster((currentRoster) => currentRoster.removePlayer(playerId));
  };

  return (
    <AppShell
      roster={roster}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onPlayerSelect={handlePlayerSelect}
      onPlayerRemove={handlePlayerRemove}
      authorizedUser={telegramGateway.getAuthorizedUser()}
      isTelegramRuntime={telegramGateway.isTelegramRuntime()}
    />
  );
}
