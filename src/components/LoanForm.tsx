"use client";

import { useState } from "react";
import type { Caisse, LoanDirection } from "@/lib/types";

interface Props {
  action: (formData: FormData) => void;
  caisses: Caisse[];
  defaultDirection?: LoanDirection;
  defaultCaisseId?: number | null;
}

export default function LoanForm({
  action,
  caisses,
  defaultDirection = "lent",
  defaultCaisseId,
}: Props) {
  const [direction, setDirection] = useState<LoanDirection>(defaultDirection);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setDirection("lent")}
          className={`rounded-xl border px-3 py-3 font-medium transition-colors ${
            direction === "lent"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "border-black/10 dark:border-white/10 text-neutral-500"
          }`}
        >
          Je prête
        </button>
        <button
          type="button"
          onClick={() => setDirection("borrowed")}
          className={`rounded-xl border px-3 py-3 font-medium transition-colors ${
            direction === "borrowed"
              ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              : "border-black/10 dark:border-white/10 text-neutral-500"
          }`}
        >
          On m&apos;a prêté
        </button>
      </div>
      <input type="hidden" name="direction" value={direction} />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          {direction === "lent"
            ? "Depuis quelle caisse ?"
            : "Vers quelle caisse ?"}
        </span>
        <select
          name="caisseId"
          required
          defaultValue={defaultCaisseId ?? ""}
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
        <span className="text-sm font-medium">
          {direction === "lent" ? "À qui ?" : "De qui ?"}
        </span>
        <input
          name="contactName"
          type="text"
          required
          autoFocus
          placeholder="Nom de la personne"
          className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Téléphone (optionnel)</span>
        <input
          name="contactPhone"
          type="tel"
          placeholder="Ex: 07 00 00 00 00"
          className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Montant</span>
        <input
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
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
          defaultValue={today}
          required
          className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Description (optionnel)</span>
        <input
          name="description"
          type="text"
          placeholder="Ex: pour l'école, dépannage..."
          className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
        />
      </label>

      <button
        type="submit"
        className="mt-2 rounded-xl bg-blue-600 text-white font-semibold py-3"
      >
        Enregistrer
      </button>
    </form>
  );
}
