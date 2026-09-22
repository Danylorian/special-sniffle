import { getSettings } from "@/lib/queries";
import { updateSettingsAction } from "@/app/actions";
import ThemePicker from "@/components/ThemePicker";

export default function SettingsPage() {
  const settings = getSettings();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Réglages</h1>

      <section className="rounded-2xl border border-black/10 dark:border-white/10 p-4">
        <h2 className="font-semibold mb-3">Apparence</h2>
        <ThemePicker current={settings.theme} />
      </section>

      <form
        action={updateSettingsAction}
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
          Enregistrer
        </button>
      </form>

      <p className="text-sm text-neutral-500">
        L&apos;espace multi-utilisateur (inscription de plusieurs personnes)
        arrivera dans une prochaine étape, une fois que cette première
        version fonctionne bien pour toi.
      </p>
    </div>
  );
}
