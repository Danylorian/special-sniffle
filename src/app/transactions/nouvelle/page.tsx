import TransactionForm from "@/components/TransactionForm";
import { listCaisses } from "@/lib/queries";
import { createTransactionAction } from "@/app/actions";

export default async function NewTransactionPage({
  searchParams,
}: PageProps<"/transactions/nouvelle">) {
  const params = await searchParams;
  const defaultType = params.type === "income" ? "income" : "expense";
  const defaultCaisseId = params.caisse ? Number(params.caisse) : undefined;

  const caisses = listCaisses();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nouvelle opération</h1>
      <TransactionForm
        caisses={caisses}
        defaultType={defaultType}
        defaultCaisseId={defaultCaisseId}
        action={createTransactionAction}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
