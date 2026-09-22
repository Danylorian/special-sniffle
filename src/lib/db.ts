import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "app.db");

declare global {
  var __caisseDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

export const db = globalThis.__caisseDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalThis.__caisseDb = db;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense','income')),
    archived INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('expense','income')),
    amount REAL NOT NULL CHECK (amount > 0),
    date TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    direction TEXT NOT NULL CHECK (direction IN ('lent','borrowed')),
    contact_id INTEGER NOT NULL REFERENCES contacts(id),
    amount REAL NOT NULL CHECK (amount > 0),
    date TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS loan_repayments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount REAL NOT NULL CHECK (amount > 0),
    date TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    currency TEXT NOT NULL DEFAULT 'FCFA',
    household_name TEXT NOT NULL DEFAULT 'Ma caisse'
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_loans_contact ON loans(contact_id);
  CREATE INDEX IF NOT EXISTS idx_repayments_loan ON loan_repayments(loan_id);
`);

const settingsRow = db.prepare("SELECT id FROM settings WHERE id = 1").get();
if (!settingsRow) {
  db.prepare(
    "INSERT INTO settings (id, currency, household_name) VALUES (1, 'FCFA', 'Ma caisse')"
  ).run();
}

const categoryCount = db
  .prepare("SELECT COUNT(*) as count FROM categories")
  .get() as { count: number };

if (categoryCount.count === 0) {
  const insertCategory = db.prepare(
    "INSERT INTO categories (name, type) VALUES (?, ?)"
  );
  const defaultCategories: Array<[string, "expense" | "income"]> = [
    ["Loyer", "expense"],
    ["Électricité", "expense"],
    ["Eau", "expense"],
    ["Ingrédients / cuisine", "expense"],
    ["Achats boissons", "expense"],
    ["Transport", "expense"],
    ["Autres dépenses", "expense"],
    ["Vente de plats", "income"],
    ["Vente de boissons", "income"],
    ["Autres recettes", "income"],
  ];
  const insertMany = db.transaction((rows: typeof defaultCategories) => {
    for (const [name, type] of rows) insertCategory.run(name, type);
  });
  insertMany(defaultCategories);
}
