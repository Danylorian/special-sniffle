import TransactionForm from "@/components/TransactionForm";
import { listCategories } from "@/lib/queries";
import { createTransactionAction } from "@/app/actions";

export default async function NewTransactionPage({
  searchParams,
}: PageProps<"/transactions/nouvelle">) {
  const params = await searchParams;
  const defaultType = params.type === "income" ? "income" : "expense";

  const expenseCategories = listCategories("expense");
  const incomeCategories = listCategories("income");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nouvelle opération</h1>
      <TransactionForm
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        defaultType={defaultType}
        action={createTransactionAction}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
