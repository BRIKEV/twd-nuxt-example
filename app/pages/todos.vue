<!-- app/pages/todos.vue -->
<!-- Todo list backed by SQLite. Reads with useFetch, mutates with $fetch. -->
<script setup lang="ts">
// useFetch infers Todo[] from the /api/todos route handler — no manual typing.
const { data: todos, refresh, pending } = await useFetch('/api/todos')

const newTitle = ref('')
const saving = ref(false)
const error = ref('')

async function withError(fn: () => Promise<void>) {
  error.value = ''
  try {
    await fn()
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Something went wrong'
  }
}

function addTodo() {
  const title = newTitle.value.trim()
  if (!title) return
  return withError(async () => {
    saving.value = true
    try {
      await $fetch('/api/todos', { method: 'POST', body: { title } })
      newTitle.value = ''
      await refresh()
    } finally {
      saving.value = false
    }
  })
}

function deleteTodo(id: number) {
  return withError(async () => {
    await $fetch(`/api/todos/${id}`, { method: 'DELETE' })
    await refresh()
  })
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 py-12">
    <div class="mx-auto max-w-xl px-4">
      <NuxtLink to="/" class="text-sm text-slate-500 hover:text-slate-800">← Back home</NuxtLink>

      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Todos</h1>
      <p class="mt-1 text-sm text-slate-500">Backed by SQLite — changes persist across reloads.</p>

      <!-- Add form -->
      <form
        data-testid="todo-form"
        class="mt-6 flex gap-2"
        @submit.prevent="addTodo"
      >
        <input
          v-model="newTitle"
          data-testid="todo-input"
          placeholder="What needs doing?"
          class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        >
        <button
          type="submit"
          data-testid="todo-add"
          :disabled="saving"
          class="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {{ saving ? 'Adding…' : 'Add' }}
        </button>
      </form>

      <p v-if="error" data-testid="todo-error" class="mt-3 text-sm text-red-600">{{ error }}</p>
      <p v-if="pending" class="mt-3 text-sm text-slate-400">Loading…</p>

      <!-- List -->
      <ul data-testid="todo-list" class="mt-6 space-y-2">
        <li
          v-for="todo in todos"
          :key="todo.id"
          :data-testid="`todo-item-${todo.id}`"
          class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <span class="flex-1 text-slate-900">{{ todo.title }}</span>
          <button
            :data-testid="`todo-delete-${todo.id}`"
            class="text-sm text-red-500 hover:text-red-700"
            @click="deleteTodo(todo.id)"
          >
            Delete
          </button>
        </li>
      </ul>

      <p v-if="todos && todos.length === 0" class="mt-6 text-center text-slate-400">
        Nothing here yet — add your first todo above.
      </p>
    </div>
  </main>
</template>
