import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getCaisseWithBalance,
  listLoansByCaisse,
  listTransactionsByCaisse,
} from "../lib/queries";
import { useSettings } from "../lib/SettingsContext";
import { formatAmount, formatDate } from "../lib/money";
import DeleteTransactionButton from "../components/DeleteTransactionButton";
import type {
  CaisseWithBalance,
  LoanWithDetails,
  TransactionWithCaisse,
} from "../lib/types";

export default function CaisseDetail() {
  const { id } = useParams();
  const caisseId = Number(id);
  const { settings } = useSettings();

  const [caisse, setCaisse] = useState<CaisseWithBalance | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithCaisse[]>([]);
  const [loans, setLoans] = useState<LoanWithDetails[]>([]);
  const [notFound, setNotFound] = useState(false);

  async function reload() {
    const c = await getCaisseWithBalance(caisseId);
    if (!c) {
      setNotFound(true);
      return;
    }
    setCaisse(c);
    setTransactions(await listTransactionsByCaisse(caisseId));
    setLoans(await listLoansByCaisse(caisseId));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caisseId]);

  if (notFound) {
    return (
      <p className="text-sm text-neutral-500 text-center py-10">
        Caisse introuvable.
      </p>
    );
  }

  if (!caisse || !settings) {
    return <p className="text-sm text-neutral-500 text-center py-10">Chargement…</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold">{caisse.name}</h1>

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
        {(caisse.lent > 0 || caisse.borrowed > 0) && (
          <div className="grid grid-cols-2 gap-3 text-sm mt-3 pt-3 border-t border-black/10 dark:border-white/10">
            <div>
              <p className="text-neutral-500">Prêté depuis cette caisse</p>
              <p className="font-semibold text-base">
                {formatAmount(caisse.lent - caisse.repaidToUs, settings.currency)}
                <span className="text-xs text-neutral-400 font-normal">
                  {" "}
                  restant
                </span>
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Emprunté vers cette caisse</p>
              <p className="font-semibold text-base">
                {formatAmount(
                  caisse.borrowed - caisse.repaidByUs,
                  settings.currency
                )}
                <span className="text-xs text-neutral-400 font-normal">
                  {" "}
                  restant
                </span>
              </p>
            </div>
          </div>
        )}
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

      <div className="grid grid-cols-3 gap-3">
        <Link
          to={`/transactions/nouvelle?type=expense&caisse=${caisse.id}`}
          className="flex flex-col items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2 py-3 text-center text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          <span className="text-xl">➖</span>
          <span className="text-xs font-medium leading-tight">
            Nouvelle dépense
          </span>
        </Link>
        <Link
          to={`/transactions/nouvelle?type=income&caisse=${caisse.id}`}
          className="flex flex-col items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-3 text-center text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
        >
          <span className="text-xl">➕</span>
          <span className="text-xs font-medium leading-tight">
            Nouvelle recette
          </span>
        </Link>
        <Link
          to={`/prets/nouveau?caisse=${caisse.id}`}
          className="flex flex-col items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-2 py-3 text-center text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
        >
          <span className="text-xl">🤝</span>
          <span className="text-xs font-medium leading-tight">
            Prêt / Emprunt
          </span>
        </Link>
      </div>

      {loans.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Prêts liés à cette caisse</h2>
          <ul className="flex flex-col gap-2">
            {loans.map((loan) => {
              const settled = loan.remaining <= 0.001;
              return (
                <li key={loan.id}>
                  <Link
                    to={`/prets/${loan.id}`}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                      settled
                        ? "border-black/5 opacity-60 dark:border-white/5"
                        : "border-black/10 dark:border-white/10"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{loan.contact_name}</p>
                      <p className="text-xs text-neutral-500">
                        {loan.direction === "lent" ? "Prêté" : "Emprunté"} ·{" "}
                        {formatDate(loan.date)}
                      </p>
                    </div>
                    <p
                      className={`font-semibold ${
                        settled
                          ? "text-neutral-400"
                          : loan.direction === "lent"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {settled
                        ? "Soldé"
                        : formatAmount(loan.remaining, settings.currency)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

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
                  to={`/transactions/${t.id}`}
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
                <DeleteTransactionButton id={t.id} onDeleted={reload} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
