export type TransactionType = "expense" | "income";
export type LoanDirection = "lent" | "borrowed";

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  archived: number;
}

export interface Contact {
  id: number;
  name: string;
  phone: string | null;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  date: string;
  category_id: number | null;
  description: string | null;
  created_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category_name: string | null;
}

export interface Loan {
  id: number;
  direction: LoanDirection;
  contact_id: number;
  amount: number;
  date: string;
  description: string | null;
  created_at: string;
}

export interface LoanRepayment {
  id: number;
  loan_id: number;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

export interface LoanWithDetails extends Loan {
  contact_name: string;
  repaid: number;
  remaining: number;
}

export interface Settings {
  id: number;
  currency: string;
  household_name: string;
}
