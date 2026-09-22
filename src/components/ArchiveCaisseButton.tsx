"use client";

import { archiveCaisseAction } from "@/app/actions";

export default function ArchiveCaisseButton({ id }: { id: number }) {
  return (
    <form
      action={archiveCaisseAction}
      onSubmit={(e) => {
        if (!confirm("Archiver cette caisse ? Elle ne sera plus proposée pour de nouvelles opérations.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label="Archiver"
        className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
      >
        🗑️
      </button>
    </form>
  );
}
