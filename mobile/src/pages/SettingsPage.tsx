import { useState, type FormEvent } from "react";
import { updateSettings, updateTheme } from "../lib/queries";
import { useSettings } from "../lib/SettingsContext";
import type { ThemePreference } from "../lib/types";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: "system", label: "Système", icon: "🌓" },
  { value: "light", label: "Clair", icon: "☀️" },
  { value: "dark", label: "Sombre", icon: "🌙" },
];

export default function SettingsPage() {
  const { settings, reload } = useSettings();
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currency = String(formData.get("currency") || "FCFA").trim();
    const householdName = String(formData.get("householdName") || "Ma caisse").trim();
    await updateSettings(currency, householdName);
    await reload();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleThemeChange(theme: ThemePreference) {
    await updateTheme(theme);
    await reload();
  }

  if (!settings) {
    return <p className="text-sm text-neutral-500 text-center py-10">Chargement…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Réglages</h1>

      <section className="rounded-2xl border border-black/10 dark:border-white/10 p-4">
        <h2 className="font-semibold mb-3">Apparence</h2>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleThemeChange(opt.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors ${
                settings.theme === opt.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "border-black/10 dark:border-white/10 text-neutral-500"
              }`}
            >
              <span className="text-xl">{opt.icon}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-black/10 dark:border-white/10 p-4"
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Nom de la caisse</span>
          <input
            name="householdName"
            type="text"
            defaultValue={settings.household_name}
            required
            className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Devise</span>
          <input
            name="currency"
            type="text"
            defaultValue={settings.currency}
            required
            placeholder="Ex: FCFA, €, $..."
            className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold py-3"
        >
          {saved ? "Enregistré ✓" : "Enregistrer"}
        </button>
      </form>

      <p className="text-sm text-neutral-500">
        Toutes les données restent stockées uniquement sur ce téléphone.
        L&apos;espace multi-utilisateur (inscription de plusieurs personnes)
        arrivera dans une prochaine étape.
      </p>
    </div>
  );
}
