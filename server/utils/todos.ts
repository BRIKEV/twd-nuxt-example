// server/utils/todos.ts
// Data-access helpers for the `todos` table. Routes call these instead of
// touching SQL directly, so the query layer lives in one place.

export interface Todo {
  id: number
  title: string
  done: boolean
  createdAt: string
}

// SQLite has no boolean type, so `done` is stored as 0/1. This row shape
// reflects the raw DB columns; toTodo() maps it to the clean Todo contract.
interface TodoRow {
  id: number
  title: string
  done: number
  created_at: string
}

function toTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    done: Boolean(row.done),
    createdAt: row.created_at,
  }
}

export function listTodos(): Todo[] {
  const rows = useDb()
    .prepare('SELECT * FROM todos ORDER BY id DESC')
    .all() as TodoRow[]
  return rows.map(toTodo)
}

export function getTodo(id: number): Todo | null {
  const row = useDb().prepare('SELECT * FROM todos WHERE id = ?').get(id) as TodoRow | undefined
  return row ? toTodo(row) : null
}

export function createTodo(title: string): Todo {
  const info = useDb().prepare('INSERT INTO todos (title) VALUES (?)').run(title)
  return getTodo(Number(info.lastInsertRowid))!
}

export function deleteTodo(id: number): boolean {
  const info = useDb().prepare('DELETE FROM todos WHERE id = ?').run(id)
  return info.changes > 0
}
