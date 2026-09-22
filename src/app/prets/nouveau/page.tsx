import LoanForm from "@/components/LoanForm";
import { listCaisses } from "@/lib/queries";
import { createLoanAction } from "@/app/actions";

export default async function NewLoanPage({
  searchParams,
}: PageProps<"/prets/nouveau">) {
  const params = await searchParams;
  const defaultCaisseId = params.caisse ? Number(params.caisse) : undefined;
  const caisses = listCaisses();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nouveau prêt / emprunt</h1>
      <LoanForm
        action={createLoanAction}
        caisses={caisses}
        defaultCaisseId={defaultCaisseId}
      />
    </div>
  );
}
