import Link from "next/link";
import { listLoans, getSettings } from "@/lib/queries";
import { formatAmount, formatDate } from "@/lib/money";
import type { LoanWithDetails } from "@/lib/types";

function LoanGroup({
  title,
  loans,
  currency,
  positiveColor,
}: {
  title: string;
  loans: LoanWithDetails[];
  currency: string;
  positiveColor: string;
}) {
  if (loans.length === 0) return null;
  return (
    <div>
      <h2 className="font-semibold mb-2">{title}</h2>
      <ul className="flex flex-col gap-2">
        {loans.map((loan) => {
          const settled = loan.remaining <= 0.001;
          return (
            <li key={loan.id}>
              <Link
                href={`/prets/${loan.id}`}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                  settled
                    ? "border-black/5 opacity-60 dark:border-white/5"
                    : "border-black/10 dark:border-white/10"
                }`}
              >
                <div>
                  <p className="font-medium">{loan.contact_name}</p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(loan.date)} · {loan.caisse_name}
                    {loan.description ? ` · ${loan.description}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      settled ? "text-neutral-400" : positiveColor
                    }`}
                  >
                    {settled
                      ? "Soldé"
                      : formatAmount(loan.remaining, currency)}
                  </p>
                  {!settled && loan.repaid > 0 && (
                    <p className="text-xs text-neutral-400">
                      sur {formatAmount(loan.amount, currency)}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function LoansPage() {
  const settings = getSettings();
  const loans = listLoans();
  const lent = loans.filter((l) => l.direction === "lent");
  const borrowed = loans.filter((l) => l.direction === "borrowed");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Prêts</h1>
        <Link
          href="/prets/nouveau"
          className="rounded-lg bg-blue-600 text-white text-sm font-medium px-3 py-1.5"
        >
          + Nouveau
        </Link>
      </div>

      {loans.length === 0 ? (
        <p className="text-sm text-neutral-500 rounded-xl border border-dashed border-black/15 dark:border-white/15 p-4 text-center">
          Aucun prêt ni emprunt enregistré. Utilise le bouton ci-dessus quand
          quelqu&apos;un emprunte de l&apos;argent ou qu&apos;on vous en
          prête.
        </p>
      ) : (
        <>
          <LoanGroup
            title="Argent prêté (on doit nous rembourser)"
            loans={lent}
            currency={settings.currency}
            positiveColor="text-emerald-600"
          />
          <LoanGroup
            title="Argent emprunté (on doit rembourser)"
            loans={borrowed}
            currency={settings.currency}
            positiveColor="text-red-600"
          />
        </>
      )}
    </div>
  );
}
