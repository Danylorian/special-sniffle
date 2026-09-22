import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCaisseWithBalance,
  getSettings,
  listTransactionsByCaisse,
} from "@/lib/queries";
import { formatAmount, formatDate } from "@/lib/money";
import DeleteTransactionButton from "@/components/DeleteTransactionButton";

export default async function CaisseDetailPage({
  params,
}: PageProps<"/caisses/[id]">) {
  const { id } = await params;
  const caisseId = Number(id);
  const caisse = getCaisseWithBalance(caisseId);
  if (!caisse) notFound();

  const settings = getSettings();
  const transactions = listTransactionsByCaisse(caisseId);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">{caisse.name}</h1>
      </div>

      <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-neutral-500">Recettes</p>
            <p className="font-semibold text-base text-emerald-600">
              {formatAmount(caisse.income, settings.currency)}
            </p>
          </div>
          <div>
            <p className="text-neutral-500">Dépenses</p>
            <p className="font-semibold text-base text-red-600">
              {formatAmount(caisse.expense, settings.currency)}
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
          <p className="text-neutral-500 text-sm">Solde de cette caisse</p>
          <p
            className={`text-2xl font-bold ${
              caisse.balance >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {formatAmount(caisse.balance, settings.currency)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/transactions/nouvelle?type=expense&caisse=${caisse.id}`}
          className="flex flex-col items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2 py-3 text-center text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          <span className="text-xl">➖</span>
          <span className="text-xs font-medium leading-tight">
            Nouvelle dépense
          </span>
        </Link>
        <Link
          href={`/transactions/nouvelle?type=income&caisse=${caisse.id}`}
          className="flex flex-col items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-3 text-center text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
        >
          <span className="text-xl">➕</span>
          <span className="text-xs font-medium leading-tight">
            Nouvelle recette
          </span>
        </Link>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Opérations de cette caisse</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-neutral-500 rounded-xl border border-dashed border-black/15 dark:border-white/15 p-4 text-center">
            Aucune opération dans cette caisse pour l&apos;instant.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {transactions.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-1 rounded-xl border border-black/10 dark:border-white/10 pr-1"
              >
                <Link
                  href={`/transactions/${t.id}`}
                  className="flex flex-1 items-center justify-between px-3 py-2 min-w-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm">{formatDate(t.date)}</p>
                    {t.description && (
                      <p className="text-xs text-neutral-500 truncate">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <p
                    className={`shrink-0 pl-2 font-semibold ${
                      t.type === "expense" ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {t.type === "expense" ? "-" : "+"}
                    {formatAmount(t.amount, settings.currency)}
                  </p>
                </Link>
                <DeleteTransactionButton id={t.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
