import { listCategories } from "@/lib/queries";
import { archiveCategoryAction, createCategoryAction } from "@/app/actions";

export default function CategoriesPage() {
  const expenseCategories = listCategories("expense");
  const incomeCategories = listCategories("income");

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
              <form action={archiveCategoryAction}>
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  className="text-xs text-neutral-400 hover:text-red-600"
                >
                  Archiver
                </button>
              </form>
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
              <form action={archiveCategoryAction}>
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  className="text-xs text-neutral-400 hover:text-red-600"
                >
                  Archiver
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-black/10 dark:border-white/10 p-4">
        <h2 className="font-semibold mb-3">Ajouter une catégorie</h2>
        <form action={createCategoryAction} className="flex flex-col gap-3">
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
