import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listTransactions } from "../lib/queries";
import type { TransactionWithCaisse } from "../lib/types";
import { useSettings } from "../lib/SettingsContext";
import { formatAmount, formatDate } from "../lib/money";
import DeleteTransactionButton from "../components/DeleteTransactionButton";

export default function TransactionsList() {
  const { settings } = useSettings();
  const [transactions, setTransactions] = useState<TransactionWithCaisse[] | null>(
    null
  );

  function reload() {
    listTransactions().then(setTransactions);
  }

  useEffect(() => {
    reload();
  }, []);

  if (!transactions || !settings) {
    return <p className="text-sm text-neutral-500 text-center py-10">Chargement…</p>;
  }

  const grouped = new Map<string, TransactionWithCaisse[]>();
  for (const t of transactions) {
    if (!grouped.has(t.date)) grouped.set(t.date, []);
    grouped.get(t.date)!.push(t);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Opérations</h1>
        <div className="flex gap-2">
          <Link
            to="/transactions/nouvelle?type=expense"
            className="rounded-lg bg-red-600 text-white text-sm font-medium px-3 py-1.5"
          >
            + Dépense
          </Link>
          <Link
            to="/transactions/nouvelle?type=income"
            className="rounded-lg bg-emerald-600 text-white text-sm font-medium px-3 py-1.5"
          >
            + Recette
          </Link>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-neutral-500 rounded-xl border border-dashed border-black/15 dark:border-white/15 p-4 text-center">
          Aucune opération enregistrée pour le moment.
        </p>
      ) : (
        [...grouped.entries()].map(([date, items]) => (
          <div key={date}>
            <p className="text-xs font-medium text-neutral-500 mb-1">
              {formatDate(date)}
            </p>
            <ul className="flex flex-col gap-2">
              {items.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-1 rounded-xl border border-black/10 dark:border-white/10 pr-1"
                >
                  <Link
                    to={`/transactions/${t.id}`}
                    className="flex flex-1 items-center justify-between px-3 py-2 min-w-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {t.caisse_name ??
                          (t.type === "expense" ? "Dépense" : "Recette")}
                      </p>
                      {t.description && (
                        <p className="text-xs text-neutral-500 truncate">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <p
                      className={`shrink-0 pl-2 font-semibold ${
                        t.type === "expense"
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {t.type === "expense" ? "-" : "+"}
                      {formatAmount(t.amount, settings.currency)}
                    </p>
                  </Link>
                  <DeleteTransactionButton id={t.id} onDeleted={reload} />
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
