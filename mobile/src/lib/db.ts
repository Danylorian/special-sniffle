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
    caisse_id INTEGER REFERENCES caisses(id),
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
`;

const DEFAULT_CAISSES = ["Cuisine", "Boissons", "Maïs", "Général"];

function columnExists(db: Database, table: string, column: string): boolean {
  const res = db.exec(`PRAGMA table_info(${table})`);
  if (res.length === 0) return false;
  const nameIdx = res[0].columns.indexOf("name");
  return res[0].values.some((row) => row[nameIdx] === column);
}

async function initializeDb(SQL: SqlJsStatic, existing?: Uint8Array) {
  const db = new SQL.Database(existing);
  db.run(SCHEMA);

  let dirty = !existing;

  if (!columnExists(db, "transactions", "caisse_id")) {
    db.run("ALTER TABLE transactions ADD COLUMN caisse_id INTEGER REFERENCES caisses(id)");
    dirty = true;
  }

  if (!columnExists(db, "loans", "caisse_id")) {
    db.run("ALTER TABLE loans ADD COLUMN caisse_id INTEGER REFERENCES caisses(id)");
    dirty = true;
  }

  if (!columnExists(db, "settings", "theme")) {
    db.run("ALTER TABLE settings ADD COLUMN theme TEXT NOT NULL DEFAULT 'system'");
    dirty = true;
  }

  const settingsRow = db.exec("SELECT id FROM settings WHERE id = 1");
  if (settingsRow.length === 0) {
    db.run(
      "INSERT INTO settings (id, currency, household_name) VALUES (1, 'FCFA', 'Ma caisse')"
    );
    dirty = true;
  }

  const caisseCountRes = db.exec("SELECT COUNT(*) FROM caisses");
  const caisseCount = caisseCountRes.length
    ? Number(caisseCountRes[0].values[0][0])
    : 0;

  if (caisseCount === 0) {
    const categoryNamesRes = db.exec("SELECT DISTINCT name FROM categories");
    const categoryNames = categoryNamesRes.length
      ? categoryNamesRes[0].values.map((row) => String(row[0]))
      : [];

    const namesToSeed = categoryNames.length > 0 ? categoryNames : DEFAULT_CAISSES;
    for (const name of namesToSeed) {
      db.run("INSERT OR IGNORE INTO caisses (name) VALUES (?)", [name]);
    }
    dirty = true;
  }

  function getOrCreateGeneralCaisseId(): number {
    const generalRes = db.exec("SELECT id FROM caisses WHERE name = 'Général'");
    if (generalRes.length > 0) return Number(generalRes[0].values[0][0]);
    db.run("INSERT INTO caisses (name) VALUES ('Général')");
    const idRes = db.exec("SELECT last_insert_rowid()");
    return Number(idRes[0].values[0][0]);
  }

  const unassignedRes = db.exec(
    "SELECT COUNT(*) FROM transactions WHERE caisse_id IS NULL"
  );
  const unassignedCount = unassignedRes.length
    ? Number(unassignedRes[0].values[0][0])
    : 0;

  if (unassignedCount > 0) {
    const generalId = getOrCreateGeneralCaisseId();

    db.run(
      `UPDATE transactions
       SET caisse_id = COALESCE(
         (
           SELECT ca.id FROM categories cat
           JOIN caisses ca ON ca.name = cat.name
           WHERE cat.id = transactions.category_id
         ),
         ${generalId}
       )
       WHERE caisse_id IS NULL`
    );
    dirty = true;
  }

  const unassignedLoansRes = db.exec(
    "SELECT COUNT(*) FROM loans WHERE caisse_id IS NULL"
  );
  const unassignedLoansCount = unassignedLoansRes.length
    ? Number(unassignedLoansRes[0].values[0][0])
    : 0;

  if (unassignedLoansCount > 0) {
    const generalId = getOrCreateGeneralCaisseId();
    db.run("UPDATE loans SET caisse_id = ? WHERE caisse_id IS NULL", [generalId]);
    dirty = true;
  }

  if (dirty) {
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
