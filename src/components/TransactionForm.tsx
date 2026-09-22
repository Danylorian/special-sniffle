"use client";

import { useState } from "react";
import type { Caisse, TransactionType } from "@/lib/types";

interface Props {
  caisses: Caisse[];
  defaultType: TransactionType;
  defaultCaisseId?: number | null;
  action: (formData: FormData) => void;
  initialValues?: {
    amount: number;
    date: string;
    caisseId: number;
    description: string | null;
  };
  submitLabel: string;
}

export default function TransactionForm({
  caisses,
  defaultType,
  defaultCaisseId,
  action,
  initialValues,
  submitLabel,
}: Props) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`rounded-xl border px-3 py-3 font-medium transition-colors ${
            type === "expense"
              ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              : "border-black/10 dark:border-white/10 text-neutral-500"
          }`}
        >
          ➖ Dépense
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`rounded-xl border px-3 py-3 font-medium transition-colors ${
            type === "income"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "border-black/10 dark:border-white/10 text-neutral-500"
          }`}
        >
          ➕ Recette
        </button>
      </div>
      <input type="hidden" name="type" value={type} />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Montant</span>
        <input
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          autoFocus
          defaultValue={initialValues?.amount}
          placeholder="0"
          className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3 text-lg"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Caisse</span>
        <select
          name="caisseId"
          required
          defaultValue={initialValues?.caisseId ?? defaultCaisseId ?? ""}
          className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
        >
          <option value="" disabled>
            — Choisir une caisse —
          </option>
          {caisses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Date</span>
        <input
          name="date"
          type="date"
          defaultValue={initialValues?.date ?? today}
          required
          className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Description (optionnel)</span>
        <input
          name="description"
          type="text"
          defaultValue={initialValues?.description ?? ""}
          placeholder="Ex: achat tomates, vente Coca..."
          className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
        />
      </label>

      <button
        type="submit"
        className="mt-2 rounded-xl bg-emerald-600 text-white font-semibold py-3"
      >
        {submitLabel}
      </button>
    </form>
  );
}
