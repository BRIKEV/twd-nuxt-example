// server/api/todos/index.get.ts
// GET /api/todos — list all todos (newest first).
export default defineEventHandler(() => {
  return listTodos()
})
