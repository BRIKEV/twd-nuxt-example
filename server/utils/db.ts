// server/utils/db.ts
// SQLite connection (via better-sqlite3) shared across all server routes.
// Auto-imported by Nitro, so any route can call useDb().
import { mkdirSync } from 'node:fs'
import Database from 'better-sqlite3'

let db: Database.Database | undefined

// Seed rows used both on first boot and on every reset (see resetDb()).
const SEED: ReadonlyArray<{ title: string; done: number }> = [
  { title: 'Learn Nuxt server routes', done: 1 },
  { title: 'Build a real todo list', done: 0 },
  { title: 'Test it with TWD', done: 0 },
]

function seed(database: Database.Database): void {
  const insert = database.prepare('INSERT INTO todos (title, done) VALUES (?, ?)')
  for (const todo of SEED) insert.run(todo.title, todo.done)
}

export function useDb(): Database.Database {
  if (db) return db

  // Keep the database file out of the source tree. .data/ is the Nitro
  // convention for local runtime state and is gitignored.
  mkdirSync('.data', { recursive: true })
  db = new Database('.data/todos.sqlite')

  // WAL gives better concurrency for a dev server handling parallel requests.
  db.pragma('journal_mode = WAL')

  // Create the schema on first run. Idempotent, so it's safe every boot.
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL,
      done       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `)

  // Seed a few rows the very first time so the UI isn't empty.
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM todos').get() as { count: number }
  if (count === 0) seed(db)

  return db
}

// Reset the database to its seeded state. Used by the dev-only test reset
// endpoint so each test can start from a known, deterministic state.
// Clearing sqlite_sequence makes the seeded ids deterministic (1, 2, 3...)
// on every reset, which keeps id-based assertions stable across test runs.
export function resetDb(): void {
  const database = useDb()
  const reset = database.transaction(() => {
    database.exec('DELETE FROM todos')
    database.exec("DELETE FROM sqlite_sequence WHERE name = 'todos'")
    seed(database)
  })
  reset()
}
