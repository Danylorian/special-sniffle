import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import { Filesystem, Directory } from "@capacitor/filesystem";

const DB_FILE = "caisse.db";

let sqlPromise: Promise<SqlJsStatic> | null = null;
let dbPromise: Promise<Database> | null = null;

function getSql(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: (file: string) => `${import.meta.env.BASE_URL}${file}`,
    });
  }
  return sqlPromise;
}

async function loadExistingBytes(): Promise<Uint8Array | undefined> {
  try {
    const result = await Filesystem.readFile({
      path: DB_FILE,
      directory: Directory.Data,
    });
    const base64 =
      typeof result.data === "string" ? result.data : await result.data.text();
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return undefined;
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function persist(db: Database) {
  const bytes = db.export();
  await Filesystem.writeFile({
    path: DB_FILE,
    directory: Directory.Data,
    data: bytesToBase64(bytes),
  });
}

const SCHEMA = `
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
`;

const DEFAULT_CATEGORIES: Array<[string, "expense" | "income"]> = [
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

async function initializeDb(SQL: SqlJsStatic, existing?: Uint8Array) {
  const db = new SQL.Database(existing);
  db.run(SCHEMA);

  const settingsRow = db.exec("SELECT id FROM settings WHERE id = 1");
  if (settingsRow.length === 0) {
    db.run(
      "INSERT INTO settings (id, currency, household_name) VALUES (1, 'FCFA', 'Ma caisse')"
    );
  }

  const countRes = db.exec("SELECT COUNT(*) FROM categories");
  const count = countRes.length ? Number(countRes[0].values[0][0]) : 0;
  if (count === 0) {
    for (const [name, type] of DEFAULT_CATEGORIES) {
      db.run("INSERT INTO categories (name, type) VALUES (?, ?)", [name, type]);
    }
  }

  if (!existing || settingsRow.length === 0 || count === 0) {
    await persist(db);
  }

  return db;
}

export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const [SQL, existing] = await Promise.all([
        getSql(),
        loadExistingBytes(),
      ]);
      return initializeDb(SQL, existing);
    })();
  }
  return dbPromise;
}

export async function resetDbCache() {
  dbPromise = null;
}
