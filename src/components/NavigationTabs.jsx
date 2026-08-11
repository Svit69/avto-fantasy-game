const navigationItems = ["МОЯ КОМАНДА", "ЛИГИ", "ТАБЛИЦА ЛИДЕРОВ", "ПОМОЩЬ", "ПРАВИЛА"];

export function NavigationTabs() {
  return (
    <nav className="navigation" aria-label="Основная навигация">
      {navigationItems.map((item, index) => (
        <button
          className={index === 0 ? "navigation__item active" : "navigation__item"}
          type="button"
          key={item}
        >
          {item}
        </button>
      ))}
    </nav>
  );
}
