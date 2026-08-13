import { Header } from "./Header.jsx";
import { BottomNavigation } from "./BottomNavigation.jsx";
import { PlayersScreen } from "./players/PlayersScreen.jsx";
import { TeamLineup } from "./TeamLineup.jsx";
import { TelegramLoginStatus } from "./TelegramLoginStatus.jsx";

export function AppShell(props) {
  const { roster, activeSection, onSectionChange, onPlayerSelect, onPlayerRemove } = props;
  const { authorizedUser, isTelegramRuntime } = props;
  const isPlayersSection = activeSection === "Игроки";

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Авто Фэнтези">
        <Header authorizedUser={authorizedUser} />
        {isPlayersSection ? (
          <PlayersScreen roster={roster} onPlayerSelect={onPlayerSelect} onPlayerRemove={onPlayerRemove} />
        ) : (
          <TeamLineup roster={roster} onAddPlayer={onSectionChange} onPlayerRemove={onPlayerRemove} />
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
