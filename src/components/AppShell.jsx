import { Header } from "./Header.jsx";
import { BottomNavigation } from "./BottomNavigation.jsx";
import { TeamLineup } from "./TeamLineup.jsx";
import { TelegramLoginStatus } from "./TelegramLoginStatus.jsx";

export function AppShell({ roster, authorizedUser, isTelegramRuntime }) {
  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Авто Фэнтези">
        <Header authorizedUser={authorizedUser} />
        <TeamLineup roster={roster} />
        <TelegramLoginStatus
          authorizedUser={authorizedUser}
          isTelegramRuntime={isTelegramRuntime}
        />
        <BottomNavigation />
      </section>
    </main>
  );
}
