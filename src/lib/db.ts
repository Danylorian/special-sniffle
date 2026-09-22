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
  db.pragma("busy_timeout = 5000");
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

  CREATE TABLE IF NOT EXISTS caisses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
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
    household_name TEXT NOT NULL DEFAULT 'Ma caisse',
    theme TEXT NOT NULL DEFAULT 'system'
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_loans_contact ON loans(contact_id);
  CREATE INDEX IF NOT EXISTS idx_repayments_loan ON loan_repayments(loan_id);
`);

// --- Migration: transactions.caisse_id (each transaction belongs to a caisse) ---
const transactionColumns = db
  .prepare("PRAGMA table_info(transactions)")
  .all() as { name: string }[];
if (!transactionColumns.some((c) => c.name === "caisse_id")) {
  db.exec("ALTER TABLE transactions ADD COLUMN caisse_id INTEGER REFERENCES caisses(id)");
}

const settingsColumns = db
  .prepare("PRAGMA table_info(settings)")
  .all() as { name: string }[];
if (!settingsColumns.some((c) => c.name === "theme")) {
  db.exec("ALTER TABLE settings ADD COLUMN theme TEXT NOT NULL DEFAULT 'system'");
}

const settingsRow = db.prepare("SELECT id FROM settings WHERE id = 1").get();
if (!settingsRow) {
  db.prepare(
    "INSERT INTO settings (id, currency, household_name) VALUES (1, 'FCFA', 'Ma caisse')"
  ).run();
}

const caisseCount = db.prepare("SELECT COUNT(*) as count FROM caisses").get() as {
  count: number;
};

if (caisseCount.count === 0) {
  const existingCategories = db
    .prepare("SELECT DISTINCT name FROM categories")
    .all() as { name: string }[];

  const insertCaisse = db.prepare(
    "INSERT OR IGNORE INTO caisses (name) VALUES (?)"
  );

  if (existingCategories.length > 0) {
    const insertMany = db.transaction((rows: typeof existingCategories) => {
      for (const { name } of rows) insertCaisse.run(name);
    });
    insertMany(existingCategories);
  } else {
    const defaultCaisses = ["Cuisine", "Boissons", "Maïs", "Général"];
    const insertMany = db.transaction((rows: string[]) => {
      for (const name of rows) insertCaisse.run(name);
    });
    insertMany(defaultCaisses);
  }
}

// Backfill caisse_id for transactions that predate the caisses feature,
// matching by the old category's name, falling back to "Général".
const unassignedCount = db
  .prepare("SELECT COUNT(*) as count FROM transactions WHERE caisse_id IS NULL")
  .get() as { count: number };

if (unassignedCount.count > 0) {
  const generalId = (() => {
    const existing = db
      .prepare("SELECT id FROM caisses WHERE name = 'Général'")
      .get() as { id: number } | undefined;
    if (existing) return existing.id;
    const result = db
      .prepare("INSERT INTO caisses (name) VALUES ('Général')")
      .run();
    return Number(result.lastInsertRowid);
  })();

  db.exec(`
    UPDATE transactions
    SET caisse_id = COALESCE(
      (
        SELECT ca.id FROM categories cat
        JOIN caisses ca ON ca.name = cat.name
        WHERE cat.id = transactions.category_id
      ),
      ${generalId}
    )
    WHERE caisse_id IS NULL
  `);
}
