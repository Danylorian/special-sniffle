import { Link, useLocation } from "react-router-dom";

const items = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/transactions", label: "Opérations", icon: "📒" },
  { href: "/prets", label: "Prêts", icon: "🤝" },
  { href: "/categories", label: "Catégories", icon: "🏷️" },
  { href: "/parametres", label: "Réglages", icon: "⚙️" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 border-t border-black/10 bg-white/95 backdrop-blur dark:bg-black/90 dark:border-white/10">
      <ul className="mx-auto flex max-w-xl">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                to={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
