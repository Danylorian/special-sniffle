import { archiveCaisse } from "../lib/queries";

export default function ArchiveCaisseButton({
  id,
  onArchived,
}: {
  id: number;
  onArchived: () => void;
}) {
  async function handleClick() {
    if (
      !confirm(
        "Archiver cette caisse ? Elle ne sera plus proposée pour de nouvelles opérations."
      )
    )
      return;
    await archiveCaisse(id);
    onArchived();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Archiver"
      className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
    >
      🗑️
    </button>
  );
}
