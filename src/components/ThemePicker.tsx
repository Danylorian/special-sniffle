import { updateThemeAction } from "@/app/actions";
import type { ThemePreference } from "@/lib/types";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: "system", label: "Système", icon: "🌓" },
  { value: "light", label: "Clair", icon: "☀️" },
  { value: "dark", label: "Sombre", icon: "🌙" },
];

export default function ThemePicker({ current }: { current: ThemePreference }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {THEME_OPTIONS.map((opt) => (
        <form key={opt.value} action={updateThemeAction}>
          <input type="hidden" name="theme" value={opt.value} />
          <button
            type="submit"
            className={`w-full flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors ${
              current === opt.value
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "border-black/10 dark:border-white/10 text-neutral-500"
            }`}
          >
            <span className="text-xl">{opt.icon}</span>
            <span className="text-xs font-medium">{opt.label}</span>
          </button>
        </form>
      ))}
    </div>
  );
}
