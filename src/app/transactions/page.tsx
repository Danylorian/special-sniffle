import Link from "next/link";
import { listTransactions, getSettings } from "@/lib/queries";
import { formatAmount, formatDate } from "@/lib/money";

export default function TransactionsPage() {
  const settings = getSettings();
  const transactions = listTransactions();

  const grouped = new Map<string, typeof transactions>();
  for (const t of transactions) {
    const key = t.date;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(t);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Opérations</h1>
        <div className="flex gap-2">
          <Link
            href="/transactions/nouvelle?type=expense"
            className="rounded-lg bg-red-600 text-white text-sm font-medium px-3 py-1.5"
          >
            + Dépense
          </Link>
          <Link
            href="/transactions/nouvelle?type=income"
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
                <li key={t.id}>
                  <Link
                    href={`/transactions/${t.id}`}
                    className="flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">
                        {t.category_name ??
                          (t.type === "expense" ? "Dépense" : "Recette")}
                      </p>
                      {t.description && (
                        <p className="text-xs text-neutral-500">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <p
                      className={`font-semibold ${
                        t.type === "expense"
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {t.type === "expense" ? "-" : "+"}
                      {formatAmount(t.amount, settings.currency)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
