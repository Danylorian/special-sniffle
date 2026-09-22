"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addRepayment,
  archiveCategory,
  createCategory,
  createLoan,
  createTransaction,
  deleteLoan,
  deleteTransaction,
  updateSettings,
  updateTransaction,
} from "@/lib/queries";
import type { LoanDirection, TransactionType } from "@/lib/types";

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
  const categoryRaw = formData.get("categoryId");
  const categoryId = categoryRaw ? Number(categoryRaw) : null;
  const description = str(formData.get("description"));

  createTransaction({ type, amount, date, categoryId, description });

  revalidatePath("/");
  revalidatePath("/transactions");
  redirect("/transactions");
}

export async function updateTransactionAction(
  id: number,
  formData: FormData
) {
  const type = String(formData.get("type")) as TransactionType;
  const amount = parseAmount(formData.get("amount"));
  const date = str(formData.get("date")) ?? new Date().toISOString().slice(0, 10);
  const categoryRaw = formData.get("categoryId");
  const categoryId = categoryRaw ? Number(categoryRaw) : null;
  const description = str(formData.get("description"));

  updateTransaction(id, { type, amount, date, categoryId, description });

  revalidatePath("/");
  revalidatePath("/transactions");
  redirect("/transactions");
}

export async function deleteTransactionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  deleteTransaction(id);
  revalidatePath("/");
  revalidatePath("/transactions");
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
  const amount = parseAmount(formData.get("amount"));
  const date = str(formData.get("date")) ?? new Date().toISOString().slice(0, 10);
  const description = str(formData.get("description"));

  createLoan({ direction, contactName, contactPhone, amount, date, description });

  revalidatePath("/");
  revalidatePath("/prets");
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
  redirect(`/prets/${loanId}`);
}

export async function deleteLoanAction(formData: FormData) {
  const id = Number(formData.get("id"));
  deleteLoan(id);
  revalidatePath("/");
  revalidatePath("/prets");
  redirect("/prets");
}

// ---------- Categories ----------

export async function createCategoryAction(formData: FormData) {
  const name = str(formData.get("name"));
  const type = String(formData.get("type")) as TransactionType;
  if (!name) throw new Error("Le nom de la catégorie est obligatoire.");
  if (type !== "expense" && type !== "income") {
    throw new Error("Type de catégorie invalide.");
  }
  createCategory(name, type);
  revalidatePath("/categories");
  revalidatePath("/transactions/nouvelle");
}

export async function archiveCategoryAction(formData: FormData) {
  const id = Number(formData.get("id"));
  archiveCategory(id);
  revalidatePath("/categories");
  revalidatePath("/transactions/nouvelle");
}

// ---------- Settings ----------

export async function updateSettingsAction(formData: FormData) {
  const currency = str(formData.get("currency")) ?? "FCFA";
  const householdName = str(formData.get("householdName")) ?? "Ma caisse";
  updateSettings(currency, householdName);
  revalidatePath("/", "layout");
}
