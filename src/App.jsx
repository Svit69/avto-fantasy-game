import { AppShell } from "./components/AppShell.jsx";
import { TelegramGateway } from "./services/TelegramGateway.js";
import { buildInitialRoster } from "./services/RosterFactory.js";

const telegramGateway = new TelegramGateway(window);
const roster = buildInitialRoster();

export function App() {
  return (
    <AppShell
      roster={roster}
      authorizedUser={telegramGateway.getAuthorizedUser()}
      isTelegramRuntime={telegramGateway.isTelegramRuntime()}
    />
  );
}
