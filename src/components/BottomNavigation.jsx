import { CalendarDays, Shirt, Trophy, UserCircle, Users } from "lucide-react";

const navigationItems = [
  { label: "Состав", icon: Shirt, isActive: true },
  { label: "Игроки", icon: Users },
  { label: "Матчи", icon: CalendarDays },
  { label: "Лиги", icon: Trophy },
  { label: "Профиль", icon: UserCircle },
];

export function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="Разделы приложения">
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <button className={item.isActive ? "bottom-nav__item active" : "bottom-nav__item"} type="button" key={item.label}>
            <Icon size={24} strokeWidth={2.1} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
