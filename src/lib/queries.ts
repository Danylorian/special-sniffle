import { db } from "./db";
import type {
  Caisse,
  CaisseWithBalance,
  Contact,
  Loan,
  LoanDirection,
  LoanRepayment,
  LoanWithDetails,
  Settings,
  Transaction,
  TransactionType,
  TransactionWithCaisse,
} from "./types";

// ---------- Settings ----------

export function getSettings(): Settings {
  return db.prepare("SELECT * FROM settings WHERE id = 1").get() as Settings;
}

export function updateSettings(currency: string, householdName: string) {
  db.prepare(
    "UPDATE settings SET currency = ?, household_name = ? WHERE id = 1"
  ).run(currency, householdName);
}

// ---------- Caisses ----------

export function listCaisses(): Caisse[] {
  return db
    .prepare("SELECT * FROM caisses WHERE archived = 0 ORDER BY name")
    .all() as Caisse[];
}

export function listCaissesWithBalance(): CaisseWithBalance[] {
  const rows = db
    .prepare(
      `SELECT ca.*,
        COALESCE((SELECT SUM(amount) FROM transactions t WHERE t.caisse_id = ca.id AND t.type = 'income'), 0) as income,
        COALESCE((SELECT SUM(amount) FROM transactions t WHERE t.caisse_id = ca.id AND t.type = 'expense'), 0) as expense
       FROM caisses ca
       WHERE ca.archived = 0
       ORDER BY ca.name`
    )
    .all() as (Caisse & { income: number; expense: number })[];

  return rows.map((row) => ({
    ...row,
    balance: Math.round((row.income - row.expense) * 100) / 100,
  }));
}

export function getCaisse(id: number): Caisse | undefined {
  return db.prepare("SELECT * FROM caisses WHERE id = ?").get(id) as
    | Caisse
    | undefined;
}

export function getCaisseWithBalance(id: number): CaisseWithBalance | undefined {
  const row = db
    .prepare(
      `SELECT ca.*,
        COALESCE((SELECT SUM(amount) FROM transactions t WHERE t.caisse_id = ca.id AND t.type = 'income'), 0) as income,
        COALESCE((SELECT SUM(amount) FROM transactions t WHERE t.caisse_id = ca.id AND t.type = 'expense'), 0) as expense
       FROM caisses ca
       WHERE ca.id = ?`
    )
    .get(id) as (Caisse & { income: number; expense: number }) | undefined;
  if (!row) return undefined;
  return { ...row, balance: Math.round((row.income - row.expense) * 100) / 100 };
}

export function createCaisse(name: string) {
  const existing = db
    .prepare("SELECT id, archived FROM caisses WHERE name = ? COLLATE NOCASE")
    .get(name) as { id: number; archived: number } | undefined;
  if (existing) {
    if (existing.archived) {
      db.prepare("UPDATE caisses SET archived = 0 WHERE id = ?").run(existing.id);
    }
    return;
  }
  db.prepare("INSERT INTO caisses (name) VALUES (?)").run(name);
}

export function archiveCaisse(id: number) {
  db.prepare("UPDATE caisses SET archived = 1 WHERE id = ?").run(id);
}

// ---------- Contacts ----------

export function listContacts(): Contact[] {
  return db.prepare("SELECT * FROM contacts ORDER BY name").all() as Contact[];
}

export function findOrCreateContact(name: string, phone?: string): number {
  const existing = db
    .prepare("SELECT id FROM contacts WHERE name = ? COLLATE NOCASE")
    .get(name) as { id: number } | undefined;
  if (existing) return existing.id;
  const result = db
    .prepare("INSERT INTO contacts (name, phone) VALUES (?, ?)")
    .run(name, phone ?? null);
  return Number(result.lastInsertRowid);
}

// ---------- Transactions ----------

export function listTransactions(limit?: number): TransactionWithCaisse[] {
  const query = `
    SELECT t.*, ca.name as caisse_name
    FROM transactions t
    LEFT JOIN caisses ca ON ca.id = t.caisse_id
    ORDER BY t.date DESC, t.id DESC
    ${limit ? "LIMIT ?" : ""}
  `;
  if (limit) {
    return db.prepare(query).all(limit) as TransactionWithCaisse[];
  }
  return db.prepare(query).all() as TransactionWithCaisse[];
}

export function listTransactionsByCaisse(caisseId: number): TransactionWithCaisse[] {
  return db
    .prepare(
      `SELECT t.*, ca.name as caisse_name
       FROM transactions t
       LEFT JOIN caisses ca ON ca.id = t.caisse_id
       WHERE t.caisse_id = ?
       ORDER BY t.date DESC, t.id DESC`
    )
    .all(caisseId) as TransactionWithCaisse[];
}

export function getTransaction(id: number): Transaction | undefined {
  return db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as
    | Transaction
    | undefined;
}

export function createTransaction(input: {
  type: TransactionType;
  amount: number;
  date: string;
  caisseId: number;
  description: string | null;
}) {
  db.prepare(
    `INSERT INTO transactions (type, amount, date, caisse_id, description)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    input.type,
    input.amount,
    input.date,
    input.caisseId,
    input.description
  );
}

export function updateTransaction(
  id: number,
  input: {
    type: TransactionType;
    amount: number;
    date: string;
    caisseId: number;
    description: string | null;
  }
) {
  db.prepare(
    `UPDATE transactions
     SET type = ?, amount = ?, date = ?, caisse_id = ?, description = ?
     WHERE id = ?`
  ).run(
    input.type,
    input.amount,
    input.date,
    input.caisseId,
    input.description,
    id
  );
}

export function deleteTransaction(id: number) {
  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
}

// ---------- Loans ----------

export function listLoans(): LoanWithDetails[] {
  const rows = db
    .prepare(
      `SELECT l.*, c.name as contact_name,
              COALESCE((SELECT SUM(amount) FROM loan_repayments r WHERE r.loan_id = l.id), 0) as repaid
       FROM loans l
       JOIN contacts c ON c.id = l.contact_id
       ORDER BY l.date DESC, l.id DESC`
    )
    .all() as (Loan & { contact_name: string; repaid: number })[];

  return rows.map((row) => ({
    ...row,
    remaining: Math.round((row.amount - row.repaid) * 100) / 100,
  }));
}

export function getLoan(id: number): LoanWithDetails | undefined {
  const row = db
    .prepare(
      `SELECT l.*, c.name as contact_name,
              COALESCE((SELECT SUM(amount) FROM loan_repayments r WHERE r.loan_id = l.id), 0) as repaid
       FROM loans l
       JOIN contacts c ON c.id = l.contact_id
       WHERE l.id = ?`
    )
    .get(id) as (Loan & { contact_name: string; repaid: number }) | undefined;
  if (!row) return undefined;
  return { ...row, remaining: Math.round((row.amount - row.repaid) * 100) / 100 };
}

export function listRepayments(loanId: number): LoanRepayment[] {
  return db
    .prepare(
      "SELECT * FROM loan_repayments WHERE loan_id = ? ORDER BY date DESC, id DESC"
    )
    .all(loanId) as LoanRepayment[];
}

export function createLoan(input: {
  direction: LoanDirection;
  contactName: string;
  contactPhone?: string;
  amount: number;
  date: string;
  description: string | null;
}) {
  const contactId = findOrCreateContact(input.contactName, input.contactPhone);
  db.prepare(
    `INSERT INTO loans (direction, contact_id, amount, date, description)
     VALUES (?, ?, ?, ?, ?)`
  ).run(input.direction, contactId, input.amount, input.date, input.description);
}

export function addRepayment(input: {
  loanId: number;
  amount: number;
  date: string;
  note: string | null;
}) {
  db.prepare(
    `INSERT INTO loan_repayments (loan_id, amount, date, note)
     VALUES (?, ?, ?, ?)`
  ).run(input.loanId, input.amount, input.date, input.note);
}

export function deleteLoan(id: number) {
  db.prepare("DELETE FROM loans WHERE id = ?").run(id);
}

// ---------- Dashboard aggregates ----------

export interface DashboardData {
  balance: number;
  monthIncome: number;
  monthExpense: number;
  totalOwedToUs: number; // argent prêté non remboursé
  totalWeOwe: number; // emprunts non remboursés
  recentTransactions: TransactionWithCaisse[];
  activeLoans: LoanWithDetails[];
  caisses: CaisseWithBalance[];
}

export function getDashboardData(): DashboardData {
  const sums = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions`
    )
    .get() as { income: number; expense: number };

  const loanSums = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN direction = 'lent' THEN amount ELSE 0 END), 0) as lentTotal,
        COALESCE(SUM(CASE WHEN direction = 'borrowed' THEN amount ELSE 0 END), 0) as borrowedTotal
       FROM loans`
    )
    .get() as { lentTotal: number; borrowedTotal: number };

  const repaymentSums = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN l.direction = 'lent' THEN r.amount ELSE 0 END), 0) as repaidToUs,
        COALESCE(SUM(CASE WHEN l.direction = 'borrowed' THEN r.amount ELSE 0 END), 0) as repaidByUs
       FROM loan_repayments r
       JOIN loans l ON l.id = r.loan_id`
    )
    .get() as { repaidToUs: number; repaidByUs: number };

  const balance =
    sums.income -
    sums.expense -
    loanSums.lentTotal +
    repaymentSums.repaidToUs +
    loanSums.borrowedTotal -
    repaymentSums.repaidByUs;

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const monthSums = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions
       WHERE date >= ?`
    )
    .get(monthStart) as { income: number; expense: number };

  const allLoans = listLoans();
  const activeLoans = allLoans.filter((l) => l.remaining > 0.001);
  const totalOwedToUs = activeLoans
    .filter((l) => l.direction === "lent")
    .reduce((sum, l) => sum + l.remaining, 0);
  const totalWeOwe = activeLoans
    .filter((l) => l.direction === "borrowed")
    .reduce((sum, l) => sum + l.remaining, 0);

  return {
    balance: Math.round(balance * 100) / 100,
    monthIncome: monthSums.income,
    monthExpense: monthSums.expense,
    totalOwedToUs: Math.round(totalOwedToUs * 100) / 100,
    totalWeOwe: Math.round(totalWeOwe * 100) / 100,
    recentTransactions: listTransactions(8),
    activeLoans: activeLoans.slice(0, 6),
    caisses: listCaissesWithBalance(),
  };
}
