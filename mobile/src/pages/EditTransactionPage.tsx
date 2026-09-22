import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TransactionForm from "../components/TransactionForm";
import {
  deleteTransaction,
  getTransaction,
  listCategories,
  updateTransaction,
} from "../lib/queries";
import type { Category, Transaction, TransactionType } from "../lib/types";

export default function EditTransactionPage() {
  const { id } = useParams();
  const transactionId = Number(id);
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getTransaction(transactionId).then((t) => {
      if (!t) {
        setNotFound(true);
        return;
      }
      setTransaction(t);
    });
    listCategories("expense").then(setExpenseCategories);
    listCategories("income").then(setIncomeCategories);
  }, [transactionId]);

  async function handleSubmit(formData: FormData) {
    const type = String(formData.get("type")) as TransactionType;
    const amount = Number(String(formData.get("amount")).replace(",", "."));
    const date = String(formData.get("date"));
    const categoryRaw = formData.get("categoryId");
    const categoryId = categoryRaw ? Number(categoryRaw) : null;
    const description = String(formData.get("description") || "").trim() || null;

    await updateTransaction(transactionId, {
      type,
      amount,
      date,
      categoryId,
      description,
    });
    navigate("/transactions");
  }

  async function handleDelete() {
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
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        defaultType={transaction.type}
        onSubmit={handleSubmit}
        initialValues={{
          amount: transaction.amount,
          date: transaction.date,
          categoryId: transaction.category_id,
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
