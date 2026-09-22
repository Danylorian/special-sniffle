"use client";

import { deleteTransactionAction } from "@/app/actions";

export default function DeleteTransactionButtonLarge({ id }: { id: number }) {
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
        className="w-full rounded-xl border border-red-300 text-red-600 font-medium py-3 dark:border-red-900"
      >
        Supprimer cette opération
      </button>
    </form>
  );
}
