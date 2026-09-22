import LoanForm from "@/components/LoanForm";
import { createLoanAction } from "@/app/actions";

export default function NewLoanPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nouveau prêt / emprunt</h1>
      <LoanForm action={createLoanAction} />
    </div>
  );
}
