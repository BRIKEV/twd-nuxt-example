// server/api/__test/reset.post.ts
// DEV-ONLY: POST /api/__test/reset
// Resets the database to its seeded state so TWD tests can start each test
// from a known baseline (call it from a beforeEach). Guarded by import.meta.dev
// so it returns 404 in a production build and is never reachable there.
export default defineEventHandler(() => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  resetDb()
  return { ok: true, todos: listTodos() }
})
