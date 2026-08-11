import { UserCircle } from "lucide-react";
import logoUrl from "../assets/logo.png";

export function Header({ authorizedUser }) {
  const profileLabel = authorizedUser?.name ?? "Профиль Telegram";

  return (
    <header className="header">
      <img className="header__logo" src={logoUrl} alt="Авто Фэнтези" />
      <h1 className="header__title">АВТО ФЭНТЕЗИ</h1>
      <button className="icon-button" type="button" aria-label={profileLabel}>
        <UserCircle size={30} strokeWidth={2.4} />
      </button>
    </header>
  );
}
