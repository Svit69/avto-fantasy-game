import { Header } from "./Header.jsx";
import { MonthSelector } from "./MonthSelector.jsx";
import { NavigationTabs } from "./NavigationTabs.jsx";
import { TeamLineup } from "./TeamLineup.jsx";
import { TelegramLoginStatus } from "./TelegramLoginStatus.jsx";

export function AppShell({ roster, authorizedUser, isTelegramRuntime }) {
  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Авто Фэнтези">
        <Header authorizedUser={authorizedUser} />
        <NavigationTabs />
        <MonthSelector />
        <TeamLineup roster={roster} />
        <TelegramLoginStatus
          authorizedUser={authorizedUser}
          isTelegramRuntime={isTelegramRuntime}
        />
      </section>
    </main>
  );
}
