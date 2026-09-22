import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoanForm from "../components/LoanForm";
import { createLoan, listCaisses } from "../lib/queries";
import type { Caisse, LoanDirection } from "../lib/types";

export default function LoanFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultCaisseId = searchParams.get("caisse")
    ? Number(searchParams.get("caisse"))
    : undefined;

  const [caisses, setCaisses] = useState<Caisse[]>([]);

  useEffect(() => {
    listCaisses().then(setCaisses);
  }, []);

  async function handleSubmit(formData: FormData) {
    const direction = String(formData.get("direction")) as LoanDirection;
    const contactName = String(formData.get("contactName")).trim();
    const contactPhone = String(formData.get("contactPhone") || "").trim() || undefined;
    const caisseId = Number(formData.get("caisseId"));
    const amount = Number(String(formData.get("amount")).replace(",", "."));
    const date = String(formData.get("date"));
    const description = String(formData.get("description") || "").trim() || null;

    await createLoan({
      direction,
      contactName,
      contactPhone,
      caisseId,
      amount,
      date,
      description,
    });
    navigate("/prets");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nouveau prêt / emprunt</h1>
      <LoanForm
        onSubmit={handleSubmit}
        caisses={caisses}
        defaultCaisseId={defaultCaisseId}
      />
    </div>
  );
}
