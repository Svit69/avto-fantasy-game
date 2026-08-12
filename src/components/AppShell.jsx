import { Header } from "./Header.jsx";
import { BottomNavigation } from "./BottomNavigation.jsx";
import { PlayersScreen } from "./players/PlayersScreen.jsx";
import { TeamLineup } from "./TeamLineup.jsx";
import { TelegramLoginStatus } from "./TelegramLoginStatus.jsx";

export function AppShell({ roster, activeSection, onSectionChange, authorizedUser, isTelegramRuntime }) {
  const isPlayersSection = activeSection === "Игроки";

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Авто Фэнтези">
        <Header authorizedUser={authorizedUser} />
        {isPlayersSection ? (
          <PlayersScreen roster={roster} />
        ) : (
          <TeamLineup roster={roster} onAddPlayer={onSectionChange} />
        )}
        <TelegramLoginStatus
          authorizedUser={authorizedUser}
          isTelegramRuntime={isTelegramRuntime}
        />
        <BottomNavigation activeSection={activeSection} onSectionChange={onSectionChange} />
      </section>
    </main>
  );
}
