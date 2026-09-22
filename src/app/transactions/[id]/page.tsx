import { notFound } from "next/navigation";
import TransactionForm from "@/components/TransactionForm";
import DeleteTransactionButtonLarge from "@/components/DeleteTransactionButtonLarge";
import { getTransaction, listCaisses } from "@/lib/queries";
import { updateTransactionAction } from "@/app/actions";

export default async function EditTransactionPage({
  params,
}: PageProps<"/transactions/[id]">) {
  const { id } = await params;
  const transactionId = Number(id);
  const transaction = getTransaction(transactionId);
  if (!transaction) notFound();

  const caisses = listCaisses();
  const updateWithId = updateTransactionAction.bind(null, transactionId);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Modifier l&apos;opération</h1>
      <TransactionForm
        caisses={caisses}
        defaultType={transaction.type}
        action={updateWithId}
        initialValues={{
          amount: transaction.amount,
          date: transaction.date,
          caisseId: transaction.caisse_id,
          description: transaction.description,
        }}
        submitLabel="Mettre à jour"
      />
      <DeleteTransactionButtonLarge id={transactionId} />
    </div>
  );
}
