import { UserCircle } from "lucide-react";
import { clubs } from "../data/clubs.js";

export function Header({ authorizedUser }) {
  const profileLabel = authorizedUser?.name ?? "Профиль Telegram";
  const primaryClub = clubs.automobilist;

  return (
    <header className="header">
      <img className="header__logo" src={primaryClub.getLogoUrl()} alt={primaryClub.getName()} />
      <h1 className="header__title">АВТО ФЭНТЕЗИ</h1>
      <button className="icon-button" type="button" aria-label={profileLabel}>
        <UserCircle size={30} strokeWidth={2.4} />
      </button>
    </header>
  );
}
