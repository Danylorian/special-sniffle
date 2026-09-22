import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TransactionForm from "../components/TransactionForm";
import {
  deleteTransaction,
  getTransaction,
  listCaisses,
  updateTransaction,
} from "../lib/queries";
import type { Caisse, Transaction, TransactionType } from "../lib/types";

export default function EditTransactionPage() {
  const { id } = useParams();
  const transactionId = Number(id);
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getTransaction(transactionId).then((t) => {
      if (!t) {
        setNotFound(true);
        return;
      }
      setTransaction(t);
    });
    listCaisses().then(setCaisses);
  }, [transactionId]);

  async function handleSubmit(formData: FormData) {
    const type = String(formData.get("type")) as TransactionType;
    const amount = Number(String(formData.get("amount")).replace(",", "."));
    const date = String(formData.get("date"));
    const caisseId = Number(formData.get("caisseId"));
    const description = String(formData.get("description") || "").trim() || null;

    await updateTransaction(transactionId, {
      type,
      amount,
      date,
      caisseId,
      description,
    });
    navigate("/transactions");
  }

  async function handleDelete() {
    if (!confirm("Supprimer cette opération ?")) return;
    await deleteTransaction(transactionId);
    navigate("/transactions");
  }

  if (notFound) {
    return (
      <p className="text-sm text-neutral-500 text-center py-10">
        Opération introuvable.
      </p>
    );
  }

  if (!transaction) {
    return <p className="text-sm text-neutral-500 text-center py-10">Chargement…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Modifier l&apos;opération</h1>
      <TransactionForm
        caisses={caisses}
        defaultType={transaction.type}
        onSubmit={handleSubmit}
        initialValues={{
          amount: transaction.amount,
          date: transaction.date,
          caisseId: transaction.caisse_id,
          description: transaction.description,
        }}
        submitLabel="Mettre à jour"
      />
      <button
        onClick={handleDelete}
        className="w-full rounded-xl border border-red-300 text-red-600 font-medium py-3 dark:border-red-900"
      >
        Supprimer cette opération
      </button>
    </div>
  );
}
