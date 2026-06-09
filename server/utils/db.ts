// server/utils/db.ts
// SQLite connection (via better-sqlite3) shared across all server routes.
// Auto-imported by Nitro, so any route can call useDb().
import { mkdirSync } from 'node:fs'
import Database from 'better-sqlite3'

let db: Database.Database | undefined

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
  if (count === 0) {
    const insert = db.prepare('INSERT INTO todos (title, done) VALUES (?, ?)')
    insert.run('Learn Nuxt server routes', 1)
    insert.run('Build a real todo list', 0)
    insert.run('Test it with TWD', 0)
  }

  return db
}
