import { useState, type FormEvent } from "react";
import { updateSettings } from "../lib/queries";
import { useSettings } from "../lib/SettingsContext";

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

  if (!settings) {
    return <p className="text-sm text-neutral-500 text-center py-10">Chargement…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Réglages</h1>

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
