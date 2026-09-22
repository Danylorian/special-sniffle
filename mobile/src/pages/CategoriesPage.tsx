import { useEffect, useState, type FormEvent } from "react";
import { archiveCategory, createCategory, listCategories } from "../lib/queries";
import type { Category, TransactionType } from "../lib/types";

export default function CategoriesPage() {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);

  async function reload() {
    setExpenseCategories(await listCategories("expense"));
    setIncomeCategories(await listCategories("income"));
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleArchive(id: number) {
    await archiveCategory(id);
    await reload();
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name")).trim();
    const type = String(formData.get("type")) as TransactionType;
    if (!name) return;
    await createCategory(name, type);
    form.reset();
    await reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Catégories</h1>

      <section>
        <h2 className="font-semibold mb-2 text-red-700 dark:text-red-300">
          Dépenses
        </h2>
        <ul className="flex flex-col gap-2">
          {expenseCategories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 px-3 py-2"
            >
              <span>{c.name}</span>
              <button
                onClick={() => handleArchive(c.id)}
                className="text-xs text-neutral-400 hover:text-red-600"
              >
                Archiver
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold mb-2 text-emerald-700 dark:text-emerald-300">
          Recettes
        </h2>
        <ul className="flex flex-col gap-2">
          {incomeCategories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 px-3 py-2"
            >
              <span>{c.name}</span>
              <button
                onClick={() => handleArchive(c.id)}
                className="text-xs text-neutral-400 hover:text-red-600"
              >
                Archiver
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-black/10 dark:border-white/10 p-4">
        <h2 className="font-semibold mb-3">Ajouter une catégorie</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            name="name"
            type="text"
            required
            placeholder="Nom de la catégorie"
            className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
          />
          <select
            name="type"
            required
            className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-3"
          >
            <option value="expense">Dépense</option>
            <option value="income">Recette</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold py-3"
          >
            Ajouter
          </button>
        </form>
      </section>
    </div>
  );
}
