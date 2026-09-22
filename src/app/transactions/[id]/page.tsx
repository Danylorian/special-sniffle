import { notFound } from "next/navigation";
import TransactionForm from "@/components/TransactionForm";
import { getTransaction, listCategories } from "@/lib/queries";
import { deleteTransactionAction, updateTransactionAction } from "@/app/actions";

export default async function EditTransactionPage({
  params,
}: PageProps<"/transactions/[id]">) {
  const { id } = await params;
  const transactionId = Number(id);
  const transaction = getTransaction(transactionId);
  if (!transaction) notFound();

  const expenseCategories = listCategories("expense");
  const incomeCategories = listCategories("income");
  const updateWithId = updateTransactionAction.bind(null, transactionId);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Modifier l&apos;opération</h1>
      <TransactionForm
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        defaultType={transaction.type}
        action={updateWithId}
        initialValues={{
          amount: transaction.amount,
          date: transaction.date,
          categoryId: transaction.category_id,
          description: transaction.description,
        }}
        submitLabel="Mettre à jour"
      />
      <form action={deleteTransactionAction}>
        <input type="hidden" name="id" value={transactionId} />
        <button
          type="submit"
          className="w-full rounded-xl border border-red-300 text-red-600 font-medium py-3 dark:border-red-900"
        >
          Supprimer cette opération
        </button>
      </form>
    </div>
  );
}
