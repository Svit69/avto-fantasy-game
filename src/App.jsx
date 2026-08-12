import { useState } from "react";
import { AppShell } from "./components/AppShell.jsx";
import { TelegramGateway } from "./services/TelegramGateway.js";
import { buildInitialRoster } from "./services/RosterFactory.js";

const telegramGateway = new TelegramGateway(window);
const roster = buildInitialRoster();

export function App() {
  const [activeSection, setActiveSection] = useState("Состав");

  return (
    <AppShell
      roster={roster}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      authorizedUser={telegramGateway.getAuthorizedUser()}
      isTelegramRuntime={telegramGateway.isTelegramRuntime()}
    />
  );
}
