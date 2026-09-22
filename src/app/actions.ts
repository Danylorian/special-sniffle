"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addRepayment,
  archiveCaisse,
  createCaisse,
  createLoan,
  createTransaction,
  deleteLoan,
  deleteTransaction,
  updateSettings,
  updateTheme,
  updateTransaction,
} from "@/lib/queries";
import type { LoanDirection, ThemePreference, TransactionType } from "@/lib/types";

function parseAmount(raw: FormDataEntryValue | null): number {
  const value = Number(String(raw ?? "").replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Montant invalide : entre un nombre supérieur à 0.");
  }
  return Math.round(value * 100) / 100;
}

function str(raw: FormDataEntryValue | null): string | null {
  const value = String(raw ?? "").trim();
  return value.length > 0 ? value : null;
}

// ---------- Transactions ----------

export async function createTransactionAction(formData: FormData) {
  const type = String(formData.get("type")) as TransactionType;
  if (type !== "expense" && type !== "income") {
    throw new Error("Type de mouvement invalide.");
  }
  const amount = parseAmount(formData.get("amount"));
  const date = str(formData.get("date")) ?? new Date().toISOString().slice(0, 10);
  const caisseId = Number(formData.get("caisseId"));
  if (!caisseId) {
    throw new Error("La caisse est obligatoire.");
  }
  const description = str(formData.get("description"));

  createTransaction({ type, amount, date, caisseId, description });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/caisses");
  redirect("/transactions");
}

export async function updateTransactionAction(
  id: number,
  formData: FormData
) {
  const type = String(formData.get("type")) as TransactionType;
  const amount = parseAmount(formData.get("amount"));
  const date = str(formData.get("date")) ?? new Date().toISOString().slice(0, 10);
  const caisseId = Number(formData.get("caisseId"));
  if (!caisseId) {
    throw new Error("La caisse est obligatoire.");
  }
  const description = str(formData.get("description"));

  updateTransaction(id, { type, amount, date, caisseId, description });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/caisses");
  redirect("/transactions");
}

export async function deleteTransactionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  deleteTransaction(id);
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/caisses");
  redirect("/transactions");
}

// ---------- Loans ----------

export async function createLoanAction(formData: FormData) {
  const direction = String(formData.get("direction")) as LoanDirection;
  if (direction !== "lent" && direction !== "borrowed") {
    throw new Error("Sens du prêt invalide.");
  }
  const contactName = str(formData.get("contactName"));
  if (!contactName) {
    throw new Error("Le nom de la personne est obligatoire.");
  }
  const contactPhone = str(formData.get("contactPhone")) ?? undefined;
  const caisseId = Number(formData.get("caisseId"));
  if (!caisseId) {
    throw new Error("La caisse est obligatoire.");
  }
  const amount = parseAmount(formData.get("amount"));
  const date = str(formData.get("date")) ?? new Date().toISOString().slice(0, 10);
  const description = str(formData.get("description"));

  createLoan({
    direction,
    contactName,
    contactPhone,
    caisseId,
    amount,
    date,
    description,
  });

  revalidatePath("/");
  revalidatePath("/prets");
  revalidatePath("/caisses");
  redirect("/prets");
}

export async function addRepaymentAction(formData: FormData) {
  const loanId = Number(formData.get("loanId"));
  const amount = parseAmount(formData.get("amount"));
  const date = str(formData.get("date")) ?? new Date().toISOString().slice(0, 10);
  const note = str(formData.get("note"));

  addRepayment({ loanId, amount, date, note });

  revalidatePath("/");
  revalidatePath("/prets");
  revalidatePath(`/prets/${loanId}`);
  revalidatePath("/caisses");
  redirect(`/prets/${loanId}`);
}

export async function deleteLoanAction(formData: FormData) {
  const id = Number(formData.get("id"));
  deleteLoan(id);
  revalidatePath("/");
  revalidatePath("/prets");
  revalidatePath("/caisses");
  redirect("/prets");
}

// ---------- Caisses ----------

export async function createCaisseAction(formData: FormData) {
  const name = str(formData.get("name"));
  if (!name) throw new Error("Le nom de la caisse est obligatoire.");
  createCaisse(name);
  revalidatePath("/caisses");
  revalidatePath("/");
  revalidatePath("/transactions/nouvelle");
}

export async function archiveCaisseAction(formData: FormData) {
  const id = Number(formData.get("id"));
  archiveCaisse(id);
  revalidatePath("/caisses");
  revalidatePath("/");
  revalidatePath("/transactions/nouvelle");
}

// ---------- Settings ----------

export async function updateSettingsAction(formData: FormData) {
  const currency = str(formData.get("currency")) ?? "FCFA";
  const householdName = str(formData.get("householdName")) ?? "Ma caisse";
  updateSettings(currency, householdName);
  revalidatePath("/", "layout");
}

export async function updateThemeAction(formData: FormData) {
  const theme = String(formData.get("theme")) as ThemePreference;
  updateTheme(theme);
  revalidatePath("/", "layout");
}
