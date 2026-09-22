import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TransactionForm from "../components/TransactionForm";
import { createTransaction, listCaisses } from "../lib/queries";
import type { Caisse, TransactionType } from "../lib/types";

export default function NewTransactionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType: TransactionType =
    searchParams.get("type") === "income" ? "income" : "expense";
  const defaultCaisseId = searchParams.get("caisse")
    ? Number(searchParams.get("caisse"))
    : undefined;

  const [caisses, setCaisses] = useState<Caisse[]>([]);

  useEffect(() => {
    listCaisses().then(setCaisses);
  }, []);

  async function handleSubmit(formData: FormData) {
    const type = String(formData.get("type")) as TransactionType;
    const amount = Number(String(formData.get("amount")).replace(",", "."));
    const date = String(formData.get("date"));
    const caisseId = Number(formData.get("caisseId"));
    const description = String(formData.get("description") || "").trim() || null;

    await createTransaction({ type, amount, date, caisseId, description });
    navigate("/transactions");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nouvelle opération</h1>
      <TransactionForm
        caisses={caisses}
        defaultType={defaultType}
        defaultCaisseId={defaultCaisseId}
        onSubmit={handleSubmit}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
