import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createCaisse, listCaissesWithBalance } from "../lib/queries";
import { useSettings } from "../lib/SettingsContext";
import { formatAmount } from "../lib/money";
import ArchiveCaisseButton from "../components/ArchiveCaisseButton";
import type { CaisseWithBalance } from "../lib/types";

export default function CaissesPage() {
  const { settings } = useSettings();
  const [caisses, setCaisses] = useState<CaisseWithBalance[] | null>(null);

  function reload() {
    listCaissesWithBalance().then(setCaisses);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name")).trim();
    if (!name) return;
    await createCaisse(name);
    form.reset();
    reload();
  }

  if (!caisses || !settings) {
    return <p className="text-sm text-neutral-500 text-center py-10">Chargement…</p>;
  }

  const total = caisses.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Caisses</h1>
        <p className="text-sm text-neutral-500">
          Total de toutes les caisses :{" "}
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {formatAmount(total, settings.currency)}
          </span>
        </p>
      </div>

      {caisses.length === 0 ? (
        <p className="text-sm text-neutral-500 rounded-xl border border-dashed border-black/15 dark:border-white/15 p-4 text-center">
          Aucune caisse pour le moment. Ajoute-en une ci-dessous (ex :
          Cuisine, Boissons, Maïs...).
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {caisses.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-1 rounded-xl border border-black/10 dark:border-white/10 pr-1"
            >
              <Link
                to={`/caisses/${c.id}`}
                className="flex flex-1 items-center justify-between px-3 py-3 min-w-0"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-neutral-500 truncate">
                    Recettes {formatAmount(c.income, settings.currency)} ·
                    Dépenses {formatAmount(c.expense, settings.currency)}
                  </p>
                </div>
                <p
                  className={`shrink-0 pl-2 font-semibold ${
                    c.balance >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {formatAmount(c.balance, settings.currency)}
                </p>
              </Link>
              <ArchiveCaisseButton id={c.id} onArchived={reload} />
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-2xl border border-black/10 dark:border-white/10 p-4">
        <h2 className="font-semibold mb-3">Ajouter une caisse</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            name="name"
            type="text"
            required
            placeholder="Ex: Cuisine, Boissons, Maïs..."
            className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
          />
          <button
            type="submit"
            className="rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold py-3"
          >
            Ajouter
          </button>
        </form>
      </section>
    </div>
  );
}
