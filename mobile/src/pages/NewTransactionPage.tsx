import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TransactionForm from "../components/TransactionForm";
import { createTransaction, listCategories } from "../lib/queries";
import type { Category, TransactionType } from "../lib/types";

export default function NewTransactionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType: TransactionType =
    searchParams.get("type") === "income" ? "income" : "expense";

  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);

  useEffect(() => {
    listCategories("expense").then(setExpenseCategories);
    listCategories("income").then(setIncomeCategories);
  }, []);

  async function handleSubmit(formData: FormData) {
    const type = String(formData.get("type")) as TransactionType;
    const amount = Number(String(formData.get("amount")).replace(",", "."));
    const date = String(formData.get("date"));
    const categoryRaw = formData.get("categoryId");
    const categoryId = categoryRaw ? Number(categoryRaw) : null;
    const description = String(formData.get("description") || "").trim() || null;

    await createTransaction({ type, amount, date, categoryId, description });
    navigate("/transactions");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nouvelle opération</h1>
      <TransactionForm
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        defaultType={defaultType}
        onSubmit={handleSubmit}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
