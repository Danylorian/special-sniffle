import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardData, type DashboardData } from "../lib/queries";
import { useSettings } from "../lib/SettingsContext";
import { formatAmount, formatDate } from "../lib/money";

export default function Dashboard() {
  const { settings } = useSettings();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboardData().then(setData);
  }, []);

  if (!data || !settings) {
    return <p className="text-sm text-neutral-500 text-center py-10">Chargement…</p>;
  }

  const currency = settings.currency;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-emerald-600 text-white p-5 shadow-sm">
        <p className="text-sm text-emerald-100">Solde actuel de la caisse</p>
        <p className="text-3xl font-bold mt-1">
          {formatAmount(data.balance, currency)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-white/15 px-3 py-2">
            <p className="text-emerald-100">Recettes (ce mois)</p>
            <p className="font-semibold text-base">
              {formatAmount(data.monthIncome, currency)}
            </p>
          </div>
          <div className="rounded-lg bg-white/15 px-3 py-2">
            <p className="text-emerald-100">Dépenses (ce mois)</p>
            <p className="font-semibold text-base">
              {formatAmount(data.monthExpense, currency)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Link
          to="/transactions/nouvelle?type=expense"
          className="flex flex-col items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2 py-3 text-center text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          <span className="text-xl">➖</span>
          <span className="text-xs font-medium leading-tight">
            Nouvelle dépense
          </span>
        </Link>
        <Link
          to="/transactions/nouvelle?type=income"
          className="flex flex-col items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-3 text-center text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
        >
          <span className="text-xl">➕</span>
          <span className="text-xs font-medium leading-tight">
            Nouvelle recette
          </span>
        </Link>
        <Link
          to="/prets/nouveau"
          className="flex flex-col items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-2 py-3 text-center text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
        >
          <span className="text-xl">🤝</span>
          <span className="text-xs font-medium leading-tight">
            Prêt / Emprunt
          </span>
        </Link>
      </section>

      {(data.totalOwedToUs > 0 || data.totalWeOwe > 0) && (
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
            <p className="text-xs text-neutral-500">On nous doit</p>
            <p className="text-lg font-semibold text-emerald-600">
              {formatAmount(data.totalOwedToUs, currency)}
            </p>
          </div>
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
            <p className="text-xs text-neutral-500">On doit</p>
            <p className="text-lg font-semibold text-red-600">
              {formatAmount(data.totalWeOwe, currency)}
            </p>
          </div>
        </section>
      )}

      {data.activeLoans.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Prêts en cours</h2>
            <Link to="/prets" className="text-sm text-emerald-600">
              Tout voir
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {data.activeLoans.map((loan) => (
              <li key={loan.id}>
                <Link
                  to={`/prets/${loan.id}`}
                  className="flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{loan.contact_name}</p>
                    <p className="text-xs text-neutral-500">
                      {loan.direction === "lent"
                        ? "Doit encore"
                        : "On doit encore"}
                    </p>
                  </div>
                  <p
                    className={`font-semibold ${
                      loan.direction === "lent"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatAmount(loan.remaining, currency)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Dernières opérations</h2>
          <Link to="/transactions" className="text-sm text-emerald-600">
            Tout voir
          </Link>
        </div>
        {data.recentTransactions.length === 0 ? (
          <p className="text-sm text-neutral-500 rounded-xl border border-dashed border-black/15 dark:border-white/15 p-4 text-center">
            Aucune opération pour l&apos;instant. Ajoute une dépense ou une
            recette pour commencer.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.recentTransactions.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 px-3 py-2"
              >
                <div>
                  <p className="font-medium">
                    {t.category_name ?? (t.type === "expense" ? "Dépense" : "Recette")}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(t.date)}
                    {t.description ? ` · ${t.description}` : ""}
                  </p>
                </div>
                <p
                  className={`font-semibold ${
                    t.type === "expense" ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {t.type === "expense" ? "-" : "+"}
                  {formatAmount(t.amount, currency)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
