import type { Database } from "sql.js";
import { getDb, persist } from "./db";
import type {
  Category,
  Loan,
  LoanDirection,
  LoanRepayment,
  LoanWithDetails,
  Settings,
  Transaction,
  TransactionType,
  TransactionWithCategory,
} from "./types";

type SqlParam = string | number | null;

function queryAll<T>(db: Database, sql: string, params: SqlParam[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

function queryOne<T>(
  db: Database,
  sql: string,
  params: SqlParam[] = []
): T | undefined {
  const rows = queryAll<T>(db, sql, params);
  return rows[0];
}

async function run(db: Database, sql: string, params: SqlParam[] = []) {
  db.run(sql, params);
  await persist(db);
}

// ---------- Settings ----------

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  return queryOne<Settings>(db, "SELECT * FROM settings WHERE id = 1")!;
}

export async function updateSettings(currency: string, householdName: string) {
  const db = await getDb();
  await run(
    db,
    "UPDATE settings SET currency = ?, household_name = ? WHERE id = 1",
    [currency, householdName]
  );
}

// ---------- Categories ----------

export async function listCategories(type?: TransactionType): Promise<Category[]> {
  const db = await getDb();
  if (type) {
    return queryAll<Category>(
      db,
      "SELECT * FROM categories WHERE type = ? AND archived = 0 ORDER BY name",
      [type]
    );
  }
  return queryAll<Category>(
    db,
    "SELECT * FROM categories WHERE archived = 0 ORDER BY type, name"
  );
}

export async function createCategory(name: string, type: TransactionType) {
  const db = await getDb();
  await run(db, "INSERT INTO categories (name, type) VALUES (?, ?)", [
    name,
    type,
  ]);
}

export async function archiveCategory(id: number) {
  const db = await getDb();
  await run(db, "UPDATE categories SET archived = 1 WHERE id = ?", [id]);
}

// ---------- Contacts ----------

async function findOrCreateContact(
  db: Database,
  name: string,
  phone?: string
): Promise<number> {
  const existing = queryOne<{ id: number }>(
    db,
    "SELECT id FROM contacts WHERE name = ? COLLATE NOCASE",
    [name]
  );
  if (existing) return existing.id;
  db.run("INSERT INTO contacts (name, phone) VALUES (?, ?)", [
    name,
    phone ?? null,
  ]);
  const row = queryOne<{ id: number }>(db, "SELECT last_insert_rowid() as id");
  return row!.id;
}

// ---------- Transactions ----------

export async function listTransactions(
  limit?: number
): Promise<TransactionWithCategory[]> {
  const db = await getDb();
  const sql = `
    SELECT t.*, c.name as category_name
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    ORDER BY t.date DESC, t.id DESC
    ${limit ? "LIMIT ?" : ""}
  `;
  return queryAll<TransactionWithCategory>(db, sql, limit ? [limit] : []);
}

export async function getTransaction(id: number): Promise<Transaction | undefined> {
  const db = await getDb();
  return queryOne<Transaction>(db, "SELECT * FROM transactions WHERE id = ?", [
    id,
  ]);
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  date: string;
  categoryId: number | null;
  description: string | null;
}

export async function createTransaction(input: TransactionInput) {
  const db = await getDb();
  await run(
    db,
    `INSERT INTO transactions (type, amount, date, category_id, description)
     VALUES (?, ?, ?, ?, ?)`,
    [input.type, input.amount, input.date, input.categoryId, input.description]
  );
}

export async function updateTransaction(id: number, input: TransactionInput) {
  const db = await getDb();
  await run(
    db,
    `UPDATE transactions
     SET type = ?, amount = ?, date = ?, category_id = ?, description = ?
     WHERE id = ?`,
    [
      input.type,
      input.amount,
      input.date,
      input.categoryId,
      input.description,
      id,
    ]
  );
}

export async function deleteTransaction(id: number) {
  const db = await getDb();
  await run(db, "DELETE FROM transactions WHERE id = ?", [id]);
}

// ---------- Loans ----------

function withRemaining(
  row: Loan & { contact_name: string; repaid: number }
): LoanWithDetails {
  return {
    ...row,
    remaining: Math.round((row.amount - row.repaid) * 100) / 100,
  };
}

export async function listLoans(): Promise<LoanWithDetails[]> {
  const db = await getDb();
  const rows = queryAll<Loan & { contact_name: string; repaid: number }>(
    db,
    `SELECT l.*, c.name as contact_name,
            COALESCE((SELECT SUM(amount) FROM loan_repayments r WHERE r.loan_id = l.id), 0) as repaid
     FROM loans l
     JOIN contacts c ON c.id = l.contact_id
     ORDER BY l.date DESC, l.id DESC`
  );
  return rows.map(withRemaining);
}

export async function getLoan(id: number): Promise<LoanWithDetails | undefined> {
  const db = await getDb();
  const row = queryOne<Loan & { contact_name: string; repaid: number }>(
    db,
    `SELECT l.*, c.name as contact_name,
            COALESCE((SELECT SUM(amount) FROM loan_repayments r WHERE r.loan_id = l.id), 0) as repaid
     FROM loans l
     JOIN contacts c ON c.id = l.contact_id
     WHERE l.id = ?`,
    [id]
  );
  return row ? withRemaining(row) : undefined;
}

export async function listRepayments(loanId: number): Promise<LoanRepayment[]> {
  const db = await getDb();
  return queryAll<LoanRepayment>(
    db,
    "SELECT * FROM loan_repayments WHERE loan_id = ? ORDER BY date DESC, id DESC",
    [loanId]
  );
}

export interface LoanInput {
  direction: LoanDirection;
  contactName: string;
  contactPhone?: string;
  amount: number;
  date: string;
  description: string | null;
}

export async function createLoan(input: LoanInput) {
  const db = await getDb();
  const contactId = await findOrCreateContact(
    db,
    input.contactName,
    input.contactPhone
  );
  await run(
    db,
    `INSERT INTO loans (direction, contact_id, amount, date, description)
     VALUES (?, ?, ?, ?, ?)`,
    [input.direction, contactId, input.amount, input.date, input.description]
  );
}

export interface RepaymentInput {
  loanId: number;
  amount: number;
  date: string;
  note: string | null;
}

export async function addRepayment(input: RepaymentInput) {
  const db = await getDb();
  await run(
    db,
    `INSERT INTO loan_repayments (loan_id, amount, date, note)
     VALUES (?, ?, ?, ?)`,
    [input.loanId, input.amount, input.date, input.note]
  );
}

export async function deleteLoan(id: number) {
  const db = await getDb();
  await run(db, "DELETE FROM loans WHERE id = ?", [id]);
}

// ---------- Dashboard aggregates ----------

export interface DashboardData {
  balance: number;
  monthIncome: number;
  monthExpense: number;
  totalOwedToUs: number;
  totalWeOwe: number;
  recentTransactions: TransactionWithCategory[];
  activeLoans: LoanWithDetails[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const db = await getDb();

  const sums = queryOne<{ income: number; expense: number }>(
    db,
    `SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
     FROM transactions`
  )!;

  const loanSums = queryOne<{ lentTotal: number; borrowedTotal: number }>(
    db,
    `SELECT
      COALESCE(SUM(CASE WHEN direction = 'lent' THEN amount ELSE 0 END), 0) as lentTotal,
      COALESCE(SUM(CASE WHEN direction = 'borrowed' THEN amount ELSE 0 END), 0) as borrowedTotal
     FROM loans`
  )!;

  const repaymentSums = queryOne<{ repaidToUs: number; repaidByUs: number }>(
    db,
    `SELECT
      COALESCE(SUM(CASE WHEN l.direction = 'lent' THEN r.amount ELSE 0 END), 0) as repaidToUs,
      COALESCE(SUM(CASE WHEN l.direction = 'borrowed' THEN r.amount ELSE 0 END), 0) as repaidByUs
     FROM loan_repayments r
     JOIN loans l ON l.id = r.loan_id`
  )!;

  const balance =
    sums.income -
    sums.expense -
    loanSums.lentTotal +
    repaymentSums.repaidToUs +
    loanSums.borrowedTotal -
    repaymentSums.repaidByUs;

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const monthSums = queryOne<{ income: number; expense: number }>(
    db,
    `SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
     FROM transactions
     WHERE date >= ?`,
    [monthStart]
  )!;

  const allLoans = await listLoans();
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
    recentTransactions: await listTransactions(8),
    activeLoans: activeLoans.slice(0, 6),
  };
}
