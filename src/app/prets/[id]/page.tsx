import { notFound } from "next/navigation";
import { getLoan, getSettings, listRepayments } from "@/lib/queries";
import { formatAmount, formatDate, todayIso } from "@/lib/money";
import { addRepaymentAction, deleteLoanAction } from "@/app/actions";

export default async function LoanDetailPage({
  params,
}: PageProps<"/prets/[id]">) {
  const { id } = await params;
  const loanId = Number(id);
  const loan = getLoan(loanId);
  if (!loan) notFound();

  const settings = getSettings();
  const repayments = listRepayments(loanId);
  const settled = loan.remaining <= 0.001;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">{loan.contact_name}</h1>
        <p className="text-sm text-neutral-500">
          {loan.direction === "lent"
            ? "Argent prêté à cette personne"
            : "Argent emprunté à cette personne"}
          {" · "}
          {formatDate(loan.date)}
        </p>
        {loan.description && (
          <p className="text-sm text-neutral-500 mt-1">{loan.description}</p>
        )}
      </div>

      <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-neutral-500">Montant initial</p>
            <p className="font-semibold text-base">
              {formatAmount(loan.amount, settings.currency)}
            </p>
          </div>
          <div>
            <p className="text-neutral-500">Déjà remboursé</p>
            <p className="font-semibold text-base">
              {formatAmount(loan.repaid, settings.currency)}
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
          <p className="text-neutral-500 text-sm">Reste</p>
          <p
            className={`text-2xl font-bold ${
              settled
                ? "text-neutral-400"
                : loan.direction === "lent"
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {settled ? "Soldé ✅" : formatAmount(loan.remaining, settings.currency)}
          </p>
        </div>
      </div>

      {!settled && (
        <form
          action={addRepaymentAction}
          className="flex flex-col gap-3 rounded-2xl border border-black/10 dark:border-white/10 p-4"
        >
          <h2 className="font-semibold">
            {loan.direction === "lent"
              ? "Enregistrer un remboursement reçu"
              : "Enregistrer un remboursement effectué"}
          </h2>
          <input type="hidden" name="loanId" value={loanId} />
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Montant</span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              max={loan.remaining}
              required
              placeholder="0"
              className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3 text-lg"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Date</span>
            <input
              name="date"
              type="date"
              defaultValue={todayIso()}
              required
              className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Note (optionnel)</span>
            <input
              name="note"
              type="text"
              className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 text-white font-semibold py-3"
          >
            Enregistrer le remboursement
          </button>
        </form>
      )}

      {repayments.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Historique des remboursements</h2>
          <ul className="flex flex-col gap-2">
            {repayments.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 px-3 py-2"
              >
                <div>
                  <p className="text-sm">{formatDate(r.date)}</p>
                  {r.note && (
                    <p className="text-xs text-neutral-500">{r.note}</p>
                  )}
                </div>
                <p className="font-semibold">
                  {formatAmount(r.amount, settings.currency)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form action={deleteLoanAction}>
        <input type="hidden" name="id" value={loanId} />
        <button
          type="submit"
          className="w-full rounded-xl border border-red-300 text-red-600 font-medium py-3 dark:border-red-900"
        >
          Supprimer ce prêt
        </button>
      </form>
    </div>
  );
}
