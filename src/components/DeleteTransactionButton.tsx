"use client";

import { deleteTransactionAction } from "@/app/actions";

export default function DeleteTransactionButton({ id }: { id: number }) {
  return (
    <form
      action={deleteTransactionAction}
      onSubmit={(e) => {
        if (!confirm("Supprimer cette opération ?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label="Supprimer"
        className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
      >
        🗑️
      </button>
    </form>
  );
}
