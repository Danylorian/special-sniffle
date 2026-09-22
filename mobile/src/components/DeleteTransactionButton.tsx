import { deleteTransaction } from "../lib/queries";

export default function DeleteTransactionButton({
  id,
  onDeleted,
}: {
  id: number;
  onDeleted: () => void;
}) {
  async function handleClick() {
    if (!confirm("Supprimer cette opération ?")) return;
    await deleteTransaction(id);
    onDeleted();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Supprimer"
      className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
    >
      🗑️
    </button>
  );
}
