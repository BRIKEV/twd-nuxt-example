// server/api/todos/[id].delete.ts
// DELETE /api/todos/:id — remove a todo by id.
export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const removed = deleteTodo(id)
  if (!removed) {
    throw createError({ statusCode: 404, statusMessage: 'Todo not found' })
  }

  return { success: true }
})
