// server/api/todos/index.post.ts
// POST /api/todos — create a todo from a { title } body.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ title?: string }>(event)
  const title = body?.title?.trim()

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  setResponseStatus(event, 201)
  return createTodo(title)
})
